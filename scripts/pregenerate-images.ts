// Pre-generates the rewritten pictures so nobody waits 30s on stage.
//   node scripts/pregenerate-images.ts                    # Aussie pictures that don't exist yet
//   node scripts/pregenerate-images.ts --variant genz     # the Gen Z ones (also: pm, agile)
//   node scripts/pregenerate-images.ts --force            # regenerate everything
// Reads OPENAI_API_KEY and OPENAI_IMAGE_MODEL from .env. Writes images/<dir>/<name>.png.
import fs from "node:fs";
import path from "node:path";
import OpenAI, { toFile } from "openai";

const env = Object.fromEntries(
  fs
    .readFileSync(".env", "utf8")
    .split("\n")
    .map((l) => l.match(/^([A-Z_]+)=(.*)$/))
    .filter((m): m is RegExpMatchArray => !!m)
    .map((m) => [m[1], m[2].trim()]),
);
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
const model = env.OPENAI_IMAGE_MODEL || "gpt-image-2";
const force = process.argv.includes("--force");

// Keep in step with `images` in src/variants/<variant>.ts.
const VARIANTS: Record<string, { dir: string; prompt: string }> = {
  aussie: {
    dir: "aussified",
    prompt: "Rewrite all of the text in this image into the broadest, most over-the-top Aussie slang you can. Keep everything else exactly the same.",
  },
  genz: {
    dir: "genzified",
    prompt:
      "Rewrite all of the text in this image into the most over-the-top Gen Z slang you can. Keep it about as short as the original. Keep everything else exactly the same.",
  },
  pm: {
    dir: "pmified",
    prompt:
      "Rewrite all of the text in this image into over-the-top product manager speak: everything's a quick win, ship it, deadlines get pulled in. Keep it about as short as the original. Keep everything else exactly the same.",
  },
  agile: {
    dir: "agilified",
    prompt: "Rewrite all of the text in this image into the most over-the-top Agile coach jargon you can. Keep everything else exactly the same.",
  },
};
const variantArg = process.argv[process.argv.indexOf("--variant") + 1];
const variant = VARIANTS[process.argv.includes("--variant") ? variantArg : "aussie"];
if (!variant) throw new Error(`Unknown variant: ${variantArg}. Try: ${Object.keys(VARIANTS).join(", ")}`);
fs.mkdirSync(path.join("images", variant.dir), { recursive: true });

const JOBS = ["kitchen_notice", "cafe_board", "safety_sign"];

await Promise.all(
  JOBS.map(async (name) => {
    const out = path.join("images", variant.dir, `${name}.png`);
    if (fs.existsSync(out) && !force) return console.log(`skip  ${out} (exists)`);
    const started = Date.now();
    const res = await openai.images.edit({
      model,
      image: await toFile(fs.readFileSync(path.join("images", `${name}.jpg`)), `${name}.jpg`, { type: "image/jpeg" }),
      prompt: variant.prompt,
    });
    const b64 = res.data?.[0]?.b64_json;
    if (!b64) throw new Error(`No image returned for ${name}`);
    fs.writeFileSync(out, Buffer.from(b64, "base64"));
    console.log(`wrote ${out} in ${((Date.now() - started) / 1000).toFixed(0)}s`);
  }),
);
