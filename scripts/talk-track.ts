// Prints the talk track as Markdown, straight from src/talk/content.ts, so the printed script and
// the presenter window can never disagree.   npm run talk-track   (writes docs/talk-track.md)

import { BEATS, MOVEMENTS } from "../src/talk/content.ts";

const out: string[] = [];
const p = (s = "") => out.push(s);

p("# Talk track: “Your AI feature works in the demo. Now prove it.”");
p();
p("Generated from `src/talk/content.ts` by `npm run talk-track`. Edit the lines there, not here: the presenter window shows the same text.");
p();
p("Each numbered line is one press of → (or the clicker). Quoted words are what to say; the rest is what to do. Make the words your own: the beats matter more than the phrasing.");
p();
p("| Movement | Finish by | Beats |");
p("| --- | --- | --- |");
for (const m of MOVEMENTS) {
  const beats = BEATS.filter((b) => b.movement === m.n);
  p(`| ${m.n} · ${m.name} | ${m.ends} min | ${beats.length} beats, ${beats.reduce((n, b) => n + b.steps.length, 0)} presses |`);
}
p();

let movement = -1;
for (const b of BEATS) {
  if (b.movement !== movement) {
    movement = b.movement;
    const m = MOVEMENTS.find((x) => x.n === movement);
    p(m ? `## ${m.n} · ${m.name}` : "## Before the talk");
    p();
  }
  p(`### ${b.num} · ${b.title}`);
  p();
  b.steps.forEach((s, i) => {
    const keys = s.keys ? ` *(keys: ${s.keys})*` : "";
    p(`${i + 1}. ${s.say}${keys}`);
  });
  p();
}

console.log(out.join("\n"));
