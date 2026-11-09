// Every press of a telling, as a PDF: one page per press, exactly what the projector shows.
//
//   npm run dev                      (in another terminal; the talk must be running)
//   npm run slides-pdf:service       → docs/slides-service.pdf
//
// Usage: npx tsx scripts/slides-pdf.ts [service|talk] [out.pdf] [base URL]
// It drives headless Chrome over the DevTools protocol: jump to each press (#beat.step) with ?mock,
// let the entrances settle, screenshot at 1600×900, then print the screenshots into a 16:9 PDF.
// Set CHROME to Chrome's path if it isn't in the usual macOS place.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const telling = process.argv[2] === "talk" ? "talk" : "service";
const out = process.argv[3] ?? `docs/slides-${telling}.pdf`;
const base = process.argv[4] ?? "http://localhost:5173";
const query = telling === "service" ? "?service&mock" : "?mock";
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const W = 1600, H = 900, SETTLE_MS = 3200, PORT = 9400 + Math.floor(Math.random() * 400);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const { BEATS } = await import(telling === "service" ? "../src/service/content.ts" : "../src/talk/content.ts");
  const presses: string[] = [];
  BEATS.forEach((b: { steps: unknown[] }, bi: number) => b.steps.forEach((_, si) => presses.push(`${bi}.${si}`)));

  try {
    await fetch(base);
  } catch {
    throw new Error(`Nothing at ${base}. Start the talk first: npm run dev`);
  }

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "slides-pdf-"));
  const chrome = spawn(CHROME, ["--headless=new", "--hide-scrollbars", `--user-data-dir=${profile}`, `--remote-debugging-port=${PORT}`, `--window-size=${W},${H}`, "about:blank"], { stdio: "ignore" });
  try {
    let target: { type: string; webSocketDebuggerUrl: string } | undefined;
    for (let i = 0; i < 60 && !target; i++) {
      await sleep(250);
      try {
        target = ((await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()) as (typeof target)[]).find((t) => t?.type === "page");
      } catch {}
    }
    if (!target) throw new Error("Chrome didn't start. Set CHROME to its path.");
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r) => (ws.onopen = r));
    let id = 0;
    const pending = new Map<number, (v: any) => void>();
    ws.onmessage = (e) => {
      const m = JSON.parse(String(e.data));
      if (m.id && pending.has(m.id)) {
        pending.get(m.id)!(m.result);
        pending.delete(m.id);
      }
    };
    const send = (method: string, params: object = {}): Promise<any> =>
      new Promise((r) => {
        const i = ++id;
        pending.set(i, r);
        ws.send(JSON.stringify({ id: i, method, params }));
      });

    await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
    const shots: string[] = [];
    for (const [i, hash] of presses.entries()) {
      await send("Page.navigate", { url: "about:blank" });
      await sleep(300);
      await send("Page.navigate", { url: `${base}/${query}#${hash}` });
      for (let k = 0; k < 40; k++) {
        await sleep(250);
        const r = await send("Runtime.evaluate", { expression: "!!document.querySelector('.canvas .layer *')", returnByValue: true });
        if (r?.result?.value) break;
      }
      await sleep(SETTLE_MS);
      shots.push((await send("Page.captureScreenshot", { format: "jpeg", quality: 88 })).data);
      process.stderr.write(`\r${i + 1}/${presses.length}`);
    }
    process.stderr.write("\n");

    // One page per screenshot, 16:9, edge to edge.
    const html = `<!doctype html><meta charset="utf-8"><style>@page{size:${W}px ${H}px;margin:0}html,body{margin:0}img{display:block;width:${W}px;height:${H}px;break-after:page}</style>${shots.map((s) => `<img src="data:image/jpeg;base64,${s}">`).join("")}`;
    await send("Page.navigate", { url: "about:blank" });
    await sleep(300);
    const { frameTree } = await send("Page.getFrameTree");
    await send("Page.setDocumentContent", { frameId: frameTree.frame.id, html });
    await send("Runtime.evaluate", { expression: "Promise.all([...document.images].map((i) => i.decode()))", awaitPromise: true });
    // Streamed: the whole PDF (about 10 MB) is too big to come back in one DevTools message, and the call never returns.
    const { stream } = await send("Page.printToPDF", { printBackground: true, preferCSSPageSize: true, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0, transferMode: "ReturnAsStream" });
    const parts: Buffer[] = [];
    for (;;) {
      const chunk = await send("IO.read", { handle: stream, size: 1 << 20 });
      parts.push(Buffer.from(chunk.data, chunk.base64Encoded ? "base64" : "utf8"));
      if (chunk.eof) break;
    }
    await send("IO.close", { handle: stream });
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, Buffer.concat(parts));
    console.log(`${out}: ${presses.length} pages`);
    ws.close();
  } finally {
    chrome.kill();
    fs.rmSync(profile, { recursive: true, force: true });
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
