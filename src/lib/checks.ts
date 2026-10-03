import type { CodeCheckId, Verdict } from "./types";

// Deterministic judges. Cheap, instant, and never wrong about the thing they check,
// which is exactly why they can't check everything.

// Broad Aussie slang is the product. These are the clichés only Hollywood thinks we say.
const HOLLYWOOD = [
  "shrimp",
  "foster's",
  "fosters",
  "australian for beer",
  "crocodile dundee",
  "that's not a knife",
  "outback steakhouse",
  "kangaroos in the street",
];

const PREAMBLE = /^\s*["“]?(here('|’)?s|here is|sure|certainly|of course|okay|ok[,!]|righto[,!]?\s+here|no worries[,!]?\s+here|alright[,!]?\s+here)/i;
const META = /(translation|translated|aussie version|in australian slang|in aussie slang)\s*:/i;

const digits = (s: string): string[] => [...(s.match(/\d+(?:[.,]\d+)?/g) ?? [])];
const placeholders = (s: string): string[] => [...(s.match(/\{[A-Za-z_][A-Za-z0-9_]*\}/g) ?? [])].sort();

export function runCheck(check: CodeCheckId, source: string, output: string, terms: string[] = []): Verdict {
  switch (check) {
    case "no-preamble": {
      if (PREAMBLE.test(output)) return { pass: false, reason: `Starts with chatter: "${output.slice(0, 40)}…"` };
      if (META.test(output)) return { pass: false, reason: "Talks about the translation instead of just giving it." };
      return { pass: true, reason: "Just the output, no chatter." };
    }
    case "length-ratio": {
      const r = output.length / Math.max(1, source.length);
      return r < 0.4 || r > 3
        ? { pass: false, reason: `Output is ${r.toFixed(1)}× the source length.` }
        : { pass: true, reason: `Length ratio ${r.toFixed(1)}×.` };
    }
    case "numbers": {
      const want = digits(source);
      const have = digits(output);
      const missing = want.filter((n) => {
        const i = have.indexOf(n);
        if (i === -1) return true;
        have.splice(i, 1);
        return false;
      });
      if (!want.length) return { pass: true, reason: "No numbers to keep." };
      return missing.length
        ? { pass: false, reason: `Missing ${missing.map((m) => `"${m}"`).join(", ")} from the source.` }
        : { pass: true, reason: `All ${want.length} number(s) kept.` };
    }
    case "placeholders": {
      const want = placeholders(source);
      const have = placeholders(output);
      if (!want.length) return { pass: true, reason: "No placeholders to keep." };
      const missing = want.filter((p) => !have.includes(p));
      const extra = have.filter((p) => !want.includes(p));
      if (missing.length || extra.length)
        return {
          pass: false,
          reason: [missing.length && `Lost ${missing.join(" ")}`, extra.length && `invented ${extra.join(" ")}`]
            .filter(Boolean)
            .join(", ") + ". The template will break.",
        };
      return { pass: true, reason: "Placeholders intact." };
    }
    case "glossary": {
      const norm = (x: string) => x.replace(/[’‘]/g, "'");
      const required = terms.filter((t) => norm(source).includes(norm(t)));
      if (!required.length) return { pass: true, reason: "No protected names in this one." };
      const missing = required.filter((t) => !norm(output).includes(norm(t)));
      return missing.length
        ? { pass: false, reason: `Changed protected name: ${missing.join(", ")}.` }
        : { pass: true, reason: "Protected names kept verbatim." };
    }
    case "hollywood": {
      const lower = output.toLowerCase().replace(/[’‘]/g, "'");
      const hits = HOLLYWOOD.filter((w) => lower.includes(w));
      if (hits.includes("shrimp")) return { pass: false, reason: "Said 'shrimp'. Australians say prawns. Instant fail." };
      return hits.length
        ? { pass: false, reason: `Hollywood Aussie: ${hits.join(", ")}.` }
        : { pass: true, reason: "Broad, but real Aussie." };
    }
  }
}
