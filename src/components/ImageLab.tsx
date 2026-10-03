import { useState } from "react";
import { post } from "../lib/api";
import type { ImageScene, Verdict } from "../lib/types";
import type { ImageChapter } from "../variants/types";
import { V } from "../scenes";
import { Judging } from "./Judging";

// Three short chapters, one idea each. The rewritten pictures are pre-generated
// (scripts/pregenerate-images.ts) because an image model takes ~30s, and nobody wants to watch that.

type Chapter = ImageChapter;
const CHAPTERS = V.images.chapters;

const PURPOSES = [
  { id: "party", label: "For the party slideshow" },
  { id: "wall", label: "On the real wall" },
] as const;

type Ocr = { texts: { text: string }[] };
type Marks = { numbers?: Verdict; meaning?: Verdict };

// The same two kinds of judge as the text: a simple rule, and an AI judge reading for meaning.
const IMAGE_JUDGES = [
  { id: "numbers", name: "Numbers and prices kept", kind: "code", blurb: "Every number on the original is still there" },
  { id: "meaning", name: "Same meaning", kind: "llm", blurb: "Every item, fact, rule and warning still means the same" },
] as const;

const OCR_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["texts"],
  properties: {
    texts: {
      type: "array",
      items: { type: "object", additionalProperties: false, required: ["text"], properties: { text: { type: "string" } } },
    },
  },
};
const MEANING_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["pass", "reason"],
  properties: { pass: { type: "boolean" }, reason: { type: "string" } },
};

// Prices like $5.50, times like 4pm, phone numbers like 0400 000 123: every run of digits must come back.
const numbersIn = (o: Ocr): string[] => o.texts.flatMap((t) => [...(t.text.match(/\d+(?:[.:]\d+)?/g) ?? [])]);

export function ImageLab({ scene }: { scene: ImageScene }) {
  const [chapterId, setChapterId] = useState(CHAPTERS[0].id);
  const [purpose, setPurpose] = useState<(typeof PURPOSES)[number]["id"]>("party");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [working, setWorking] = useState(false);
  const [checks, setChecks] = useState<Record<string, Marks>>({});
  const [error, setError] = useState<string | null>(null);

  const ch = CHAPTERS.find((c) => c.id === chapterId)!;
  const original = `/images/${ch.image}.jpg`;
  const aussified = `/images/${V.images.dir}/${ch.image}.png`;
  const dontTouch = ch.purposes && purpose === "wall";
  const key = ch.purposes ? `${ch.id}:${purpose}` : ch.id;
  const isRevealed = !!revealed[key];

  const aussify = () => {
    // Pre-generated, so this is instant. A short beat keeps the "magic" moment. Then the judges mark it.
    setWorking(true);
    setTimeout(() => {
      setWorking(false);
      setRevealed((r) => ({ ...r, [key]: true }));
      check(ch);
    }, 900);
  };

  const check = async (ch: Chapter) => {
    const original = `/images/${ch.image}.jpg`;
    const aussified = `/images/${V.images.dir}/${ch.image}.png`;
    setChecks((c) => ({ ...c, [ch.id]: {} }));
    setError(null);
    try {
      const read = (ref: string) =>
        post<Ocr>("/api/vision", {
          images: [ref],
          prompt: "Transcribe every piece of visible text in this image exactly as written, including every number, price and phone number.",
          schema: OCR_SCHEMA,
        });
      const meaning = post<{ pass: boolean; reason: string }>("/api/vision", {
        images: [original, aussified],
        prompt: [
          `Image 1 is the original. Image 2 rewrites its text into ${V.style}.`,
          "Pass only if everything in image 2 still means the same thing as image 1: every item, fact, rule and warning. Slang words are fine; changing what something actually is, or softening a rule, is not.",
          "Give a one-sentence reason a non-technical audience can understand. Name the worst change if it fails.",
        ].join("\n"),
        schema: MEANING_SCHEMA,
      }).then((m) => setChecks((c) => ({ ...c, [ch.id]: { ...c[ch.id], meaning: m } })));
      const numbers = Promise.all([read(original), read(aussified)]).then(([before, after]) => {
        const want = numbersIn(before);
        const missing = want.filter((n) => !numbersIn(after).includes(n));
        const v: Verdict = {
          pass: missing.length === 0,
          reason: missing.length ? `Missing or changed: ${missing.join(", ")}.` : want.length ? `All there: ${want.join(", ")}.` : "No numbers to keep.",
        };
        setChecks((c) => ({ ...c, [ch.id]: { ...c[ch.id], numbers: v } }));
      });
      await Promise.all([meaning, numbers]);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const chChecks = checks[ch.id];
  const judged = !!chChecks?.numbers && !!chChecks?.meaning;
  const showLesson = dontTouch || (isRevealed && judged);

  return (
    <div className="workbench imgstory" aria-label={scene.title}>
      <div className="chapters" role="tablist" aria-label="Pictures">
        {CHAPTERS.map((c, i) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={c.id === chapterId}
            className={c.id === chapterId ? "on" : ""}
            onClick={() => setChapterId(c.id)}
          >
            <span className="step-n">{i + 1}</span> {c.label}
          </button>
        ))}
      </div>

      <p className="setup">{ch.setup}</p>

      {ch.purposes && (
        <div className="seg" role="group" aria-label="Where it's going">
          {PURPOSES.map((p) => (
            <button key={p.id} className={p.id === purpose ? "on" : ""} onClick={() => setPurpose(p.id)}>
              {p.label}
            </button>
          ))}
        </div>
      )}

      <div className="imgs">
        <figure className="imgcard" style={{ margin: 0 }}>
          <figcaption className="cap">English</figcaption>
          <img src={original} alt={`${ch.label}, original`} />
        </figure>
        <figure className="imgcard" style={{ margin: 0 }}>
          <figcaption className="cap">{V.outLabel}</figcaption>
          {dontTouch ? (
            <div className="placeholder dont">
              <strong>Don't touch it.</strong>
              <span>People rely on this sign to stay safe, and safety signs follow a standard. The right answer is no change at all.</span>
            </div>
          ) : isRevealed ? (
            <img src={aussified} alt={`${ch.label}, rewritten`} className="reveal-img" />
          ) : (
            <div className="placeholder">
              <button className="translate big" disabled={working} onClick={aussify}>
                {working ? V.verbing : `${V.verb} ✨`}
              </button>
            </div>
          )}
        </figure>
      </div>

      <div className="story-foot">
        {isRevealed && !dontTouch && chChecks && (
          <Judging
            runKey={key}
            lines={IMAGE_JUDGES.map((j) => ({ ...j, verdict: chChecks[j.id] ?? "pending" }))}
          />
        )}
        {error && <div className="error">{error}</div>}
        {showLesson && <div className="lesson">{ch.lesson}</div>}
      </div>
    </div>
  );
}
