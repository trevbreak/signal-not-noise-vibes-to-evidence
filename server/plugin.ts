import type { Plugin } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI, { toFile } from "openai";

// Everything that touches an API key lives here, inside the Vite dev server.
// The browser only ever talks to /api/*, so keys never reach devtools on a shared screen.

type Env = Record<string, string>;

const ROOT = process.cwd();
const IMAGES_DIR = path.join(ROOT, "images");
const GENERATED_DIR = path.join(ROOT, "generated");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
};

export function apiPlugin(env: Env): Plugin {
  const anthropicKey = env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  const openaiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  const anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null;
  const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

  const cfg = {
    translatorModel: env.TRANSLATOR_MODEL || "claude-haiku-4-5",
    judgeModel: env.JUDGE_MODEL || "claude-opus-5-5",
    imageModel: env.OPENAI_IMAGE_MODEL || "gpt-image-2",
    ttsModel: env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
    sttModel: env.OPENAI_STT_MODEL || "gpt-4o-transcribe",
  };

  async function claude(opts: {
    model: string;
    system?: string;
    content: Anthropic.Beta.BetaContentBlockParam[] | string;
    maxTokens?: number;
    schema?: Record<string, unknown>;
  }) {
    if (!anthropic) throw new HttpError(503, "ANTHROPIC_API_KEY is not set. Add it to .env and restart.");
    const isHaiku = opts.model.includes("haiku");
    const outputConfig: Anthropic.Beta.BetaOutputConfig = {};
    if (opts.schema) outputConfig.format = { type: "json_schema", schema: opts.schema };
    // Low effort keeps stage latency down; Haiku 4.5 doesn't take an effort setting.
    if (!isHaiku) outputConfig.effort = "low";
    const supportsDefaultFallback = /opus-5|sonnet-5-5|fable-5/.test(opts.model);

    const started = Date.now();
    const res = await anthropic.beta.messages.create({
      model: opts.model,
      max_tokens: opts.maxTokens ?? 2000,
      ...(opts.system ? { system: opts.system } : {}),
      messages: [{ role: "user", content: opts.content }],
      ...(Object.keys(outputConfig).length ? { output_config: outputConfig } : {}),
      // If a safety classifier declines, retry server-side on Anthropic's recommended fallback model.
      ...(supportsDefaultFallback
        ? { fallbacks: "default" as const, betas: ["server-side-fallback-2026-07-01"] }
        : {}),
    });
    const latencyMs = Date.now() - started;
    if (res.stop_reason === "refusal") {
      throw new HttpError(422, "The model declined this request (stop_reason: refusal).");
    }
    const text = res.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    return {
      text,
      model: res.model,
      latencyMs,
      usage: { input: res.usage.input_tokens, output: res.usage.output_tokens },
      stopReason: res.stop_reason,
    };
  }

  const routes: Record<string, (body: any) => Promise<unknown>> = {
    "/api/health": async () => ({
      anthropic: !!anthropic,
      openai: !!openai,
      ...cfg,
    }),

    // The "app under test": whatever prompt the presenter has on screen, sent as-is.
    "/api/translate": async (body: { model?: string; system?: string; user: string }) => {
      return claude({
        model: body.model || cfg.translatorModel,
        system: body.system || undefined,
        content: body.user,
        maxTokens: 1000,
      });
    },

    // LLM-as-judge: one call scores every rubric criterion, with a reason for each.
    "/api/judge": async (body: {
      source: string;
      output: string;
      context?: string;
      criteria: { id: string; name: string; rubric: string }[];
    }) => {
      const system = [
        "You are a strict, fair evaluator marking the output of an AI feature against a rubric.",
        "Mark each criterion independently. Pass only if the criterion is clearly met.",
        "Reasons must be one short sentence, at most 15 words, that a non-technical audience can read at a glance. Quote the word or phrase that decided it.",
      ].join("\n");
      const user = [
        body.context ? `<context>\n${body.context}\n</context>` : "<context>None provided.</context>",
        `<source_text>\n${body.source}\n</source_text>`,
        `<ai_output>\n${body.output}\n</ai_output>`,
        "<rubric>",
        ...body.criteria.map((c) => `- [${c.id}] ${c.name}: ${c.rubric}`),
        "</rubric>",
        "Return a result for every criterion id.",
      ].join("\n");
      const res = await claude({
        model: cfg.judgeModel,
        system,
        content: user,
        maxTokens: 1500,
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["results"],
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["id", "pass", "reason"],
                properties: {
                  // Only the ids we sent: otherwise it sometimes answers with the criterion's name.
                  id: { type: "string", enum: body.criteria.map((c) => c.id) },
                  pass: { type: "boolean" },
                  reason: { type: "string" },
                },
              },
            },
          },
        },
      });
      return { ...JSON.parse(res.text), latencyMs: res.latencyMs, model: res.model };
    },

    // Axial coding: group the presenter's free-text failure notes into categories that become evals.
    "/api/cluster": async (body: { notes: { id: string; note: string; source: string; output: string }[] }) => {
      const user = [
        "These are open-coding notes a product team wrote while reviewing traces of an AI feature",
        "that rewrites workplace content into Australian slang. Group them into 3-6 failure categories",
        "(axial coding). For each category, propose one concrete, testable eval.",
        "",
        ...body.notes.map(
          (n) => `<note id="${n.id}">\nsource: ${n.source}\noutput: ${n.output}\nreviewer note: ${n.note}\n</note>`,
        ),
      ].join("\n");
      const res = await claude({
        model: cfg.judgeModel,
        content: user,
        maxTokens: 3000,
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["categories"],
          properties: {
            categories: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["name", "description", "noteIds", "evalIdea", "evalType"],
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  noteIds: { type: "array", items: { type: "string" } },
                  evalIdea: { type: "string" },
                  evalType: { type: "string", enum: ["code", "llm-judge", "human"] },
                },
              },
            },
          },
        },
      });
      return JSON.parse(res.text);
    },

    // Vision with a JSON schema: classifier, localisation planner, OCR read-back, and image judge.
    "/api/vision": async (body: {
      images: string[];
      prompt: string;
      schema: Record<string, unknown>;
    }) => {
      const content: Anthropic.Beta.BetaContentBlockParam[] = body.images.map((ref) => {
        const { data, mime } = readImageRef(ref);
        return {
          type: "image" as const,
          source: { type: "base64" as const, media_type: mime as "image/jpeg", data: data.toString("base64") },
        };
      });
      content.push({ type: "text", text: body.prompt });
      const res = await claude({ model: cfg.judgeModel, content, maxTokens: 3000, schema: body.schema });
      return { ...JSON.parse(res.text), latencyMs: res.latencyMs };
    },

    // OpenAI image edit. Results are cached on disk by (image, prompt, model) so a rehearsed
    // edit replays instantly on stage. Pass fresh: true to force a new generation.
    "/api/image-edit": async (body: { image: string; prompt: string; fresh?: boolean }) => {
      const key = hash([body.image, body.prompt, cfg.imageModel]);
      const outName = `edit-${key}.png`;
      const outPath = path.join(GENERATED_DIR, outName);
      if (!body.fresh && fs.existsSync(outPath)) {
        return { url: `/generated/${outName}`, cached: true, latencyMs: 0 };
      }
      if (!openai) throw new HttpError(503, "OPENAI_API_KEY is not set. Add it to .env and restart.");
      const { data, mime, name } = readImageRef(body.image);
      const started = Date.now();
      const res = await openai.images.edit({
        model: cfg.imageModel,
        image: await toFile(data, name, { type: mime }),
        prompt: body.prompt,
      });
      const b64 = res.data?.[0]?.b64_json;
      if (!b64) throw new HttpError(502, "The image model returned no image.");
      fs.mkdirSync(GENERATED_DIR, { recursive: true });
      fs.writeFileSync(outPath, Buffer.from(b64, "base64"));
      return { url: `/generated/${outName}`, cached: false, latencyMs: Date.now() - started };
    },

    // OpenAI text-to-speech, cached on disk the same way.
    "/api/tts": async (body: { text: string; voice?: string; instructions?: string; fresh?: boolean }) => {
      const voice = body.voice || "coral";
      const key = hash([body.text, voice, body.instructions ?? "", cfg.ttsModel]);
      const outName = `tts-${key}.mp3`;
      const outPath = path.join(GENERATED_DIR, outName);
      if (!body.fresh && fs.existsSync(outPath)) {
        return { url: `/generated/${outName}`, cached: true, latencyMs: 0 };
      }
      if (!openai) throw new HttpError(503, "OPENAI_API_KEY is not set. Add it to .env and restart.");
      const started = Date.now();
      const res = await openai.audio.speech.create({
        model: cfg.ttsModel,
        voice,
        input: body.text,
        ...(body.instructions ? { instructions: body.instructions } : {}),
        response_format: "mp3",
      });
      fs.mkdirSync(GENERATED_DIR, { recursive: true });
      fs.writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
      return { url: `/generated/${outName}`, cached: false, latencyMs: Date.now() - started };
    },
  };

  // Iterate: rewrite the app's instructions from the reviewers' coded feedback on bad answers.
  routes["/api/improve-prompt"] = async (body: {
    instructions: string;
    feedback: { source: string; output: string; code: string; comment: string }[];
    /** The voice the feature writes in. Left out: broad Aussie slang (the original telling). */
    voice?: string;
  }) => {
    const voice = body.voice ?? "broad, over-the-top Australian slang";
    const user = [
      `You maintain the instructions for an AI feature: it rewrites workplace notices into ${voice}. The English notice is added after the instructions.`,
      `<current_instructions>\n${body.instructions}\n</current_instructions>`,
      "Reviewers checked some answers and coded what went wrong, with their reasoning:",
      ...body.feedback.map(
        (f) => `<feedback>\nenglish: ${f.source}\nanswer: ${f.output}\nwhat went wrong: ${f.code}\nreviewers' reasoning: ${f.comment}\n</feedback>`,
      ),
      "Rewrite the instructions so these problems don't happen again, on these notices and on similar ones.",
      `Generalise from the reasoning: describe what a good answer looks like rather than adding a rule per example. Keep the ${body.voice ? "same over-the-top" : "broad, over-the-top Aussie"} voice. Keep it short and plain: something a non-technical person can read in 20 seconds. Write it as instructions to the AI, with no heading.`,
      "Also list what you changed, in plain words (3-5 short items).",
    ].join("\n\n");
    const res = await claude({
      model: cfg.judgeModel,
      content: user,
      maxTokens: 2000,
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["instructions", "changes"],
        properties: { instructions: { type: "string" }, changes: { type: "array", items: { type: "string" } } },
      },
    });
    return JSON.parse(res.text);
  };

  // Iterate: rewrite the judge's marking guide from the reviewers' reasoning on the answers it got wrong.
  routes["/api/refine-rubric"] = async (body: {
    rubric: string;
    context?: string;
    notes: { source: string; output: string; label: string; judgeSaid: string; reasoning: string }[];
    /** Examples the judge already gets right: the new guide must keep getting them right. */
    keep?: { source: string; output: string; label: string; reasoning: string }[];
    /** What this one judge is for, and the other judges that cover everything else. */
    scope?: string;
    others?: string[];
    voice?: string;
  }) => {
    const user = [
      "You maintain the marking guide (rubric) that an AI judge uses to mark an app's answers.",
      `The app rewrites workplace notices into ${body.voice ?? "broad, over-the-top Australian slang"}.`,
      body.context ? `<context>\n${body.context}\n</context>` : "",
      `<current_marking_guide>\n${body.rubric}\n</current_marking_guide>`,
      body.scope
        ? `This judge checks one thing only: ${body.scope}. Keep the guide to that job. Other judges already check: ${(body.others ?? []).join(", ")}. Don't add their checks.`
        : "",
      "Human reviewers checked the judge against answers they had already labelled. Here is every case where the judge got it wrong, with the reviewers' reasoning:",
      ...body.notes.map(
        (n) =>
          `<case>\nenglish: ${n.source}\nanswer: ${n.output}\nreviewers' label: ${n.label}\nthe judge said: ${n.judgeSaid}\nreviewers' reasoning: ${n.reasoning}\n</case>`,
      ),
      ...(body.keep?.length
        ? [
            "The judge already agrees with the reviewers on these. The new guide must still get every one of them right:",
            ...body.keep.map(
              (k) => `<example>\nenglish: ${k.source}\nanswer: ${k.output}\nreviewers' label: ${k.label}\nreviewers' reasoning: ${k.reasoning}\n</example>`,
            ),
          ]
        : []),
      "Rewrite the marking guide so the judge would agree with the reviewers on every case and example above, and on similar answers it hasn't seen. Keep anything in the current guide that still matters.",
      "Generalise from the reasoning: write principles, not a list of the specific answers. Keep it short and plain: at most 8 bullet points a non-technical person can read.",
      "Also list what you changed, in plain words (3-5 short items).",
    ]
      .filter(Boolean)
      .join("\n\n");
    const res = await claude({
      model: cfg.judgeModel,
      content: user,
      maxTokens: 2000,
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["rubric", "changes"],
        properties: { rubric: { type: "string" }, changes: { type: "array", items: { type: "string" } } },
      },
    });
    return JSON.parse(res.text);
  };

  // Speech → text, so a spoken answer can be checked by the same rules as a written one.
  routes["/api/transcribe"] = async (body: { url: string; model?: string }) => {
    if (!openai) throw new HttpError(503, "OPENAI_API_KEY is not set. Add it to .env and restart.");
    if (!body.url?.startsWith("/generated/")) throw new HttpError(400, "Can only transcribe generated audio.");
    const file = path.join(GENERATED_DIR, path.basename(body.url));
    if (!fs.existsSync(file)) throw new HttpError(404, "Audio not found.");
    const started = Date.now();
    // Allow swapping the listener live, to show the transcription step has its own failure rate.
    const model = body.model && ["gpt-4o-transcribe", "gpt-4o-mini-transcribe", "whisper-1"].includes(body.model) ? body.model : cfg.sttModel;
    const res = await openai.audio.transcriptions.create({
      model,
      file: await toFile(fs.readFileSync(file), "speech.mp3", { type: "audio/mpeg" }),
    });
    return { text: res.text, model, latencyMs: Date.now() - started };
  };

  return {
    name: "strine-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || "").split("?")[0];

        if (url.startsWith("/images/") || url.startsWith("/generated/")) {
          const file = safePath(decodeURIComponent(url));
          if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) return next();
          res.setHeader("Content-Type", MIME[path.extname(file).toLowerCase()] || "application/octet-stream");
          fs.createReadStream(file).pipe(res);
          return;
        }

        const handler = routes[url];
        if (!handler) return next();
        try {
          const body = req.method === "POST" ? await readJson(req) : {};
          sendJson(res, 200, await handler(body));
        } catch (err) {
          sendJson(res, ...describeError(err));
        }
      });
    },
  };
}

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function describeError(err: unknown): [number, { error: string }] {
  if (err instanceof HttpError) return [err.status, { error: err.message }];
  if (err instanceof Anthropic.AuthenticationError) return [401, { error: "Anthropic rejected the API key." }];
  if (err instanceof Anthropic.RateLimitError) return [429, { error: "Anthropic rate limit hit. Wait a moment." }];
  if (err instanceof Anthropic.APIError) return [err.status ?? 500, { error: `Anthropic: ${err.message}` }];
  if (err instanceof OpenAI.AuthenticationError) return [401, { error: "OpenAI rejected the API key." }];
  if (err instanceof OpenAI.RateLimitError) return [429, { error: "OpenAI rate limit hit. Wait a moment." }];
  if (err instanceof OpenAI.APIError) return [err.status ?? 500, { error: `OpenAI: ${err.message}` }];
  if (err instanceof SyntaxError) return [400, { error: `Bad JSON: ${err.message}` }];
  return [500, { error: err instanceof Error ? err.message : String(err) }];
}

/** Accepts "firetruck_real.jpg" (from images/), "/generated/x.png", or a data: URL. */
function readImageRef(ref: string): { data: Buffer; mime: string; name: string } {
  if (ref.startsWith("data:")) {
    const [meta, b64] = ref.split(",", 2);
    const mime = meta.slice(5).split(";")[0];
    return { data: Buffer.from(b64, "base64"), mime, name: `upload${mime === "image/png" ? ".png" : ".jpg"}` };
  }
  const file = ref.startsWith("/") ? safePath(ref) : path.join(IMAGES_DIR, path.basename(ref));
  const name = path.basename(ref);
  if (!file || !fs.existsSync(file)) throw new HttpError(404, `Image not found: ${ref}`);
  return { data: fs.readFileSync(file), mime: MIME[path.extname(name).toLowerCase()] || "image/jpeg", name };
}

/** Map /images/... or /generated/... to a file inside that folder, refusing anything that escapes it. */
function safePath(url: string): string | null {
  const [, top, ...rest] = url.split("/");
  const dir = top === "images" ? IMAGES_DIR : top === "generated" ? GENERATED_DIR : null;
  if (!dir) return null;
  const file = path.resolve(dir, ...rest);
  return file.startsWith(dir + path.sep) ? file : null;
}

function hash(parts: string[]) {
  return crypto.createHash("sha256").update(parts.join("\u0000")).digest("hex").slice(0, 16);
}

function readJson(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}
