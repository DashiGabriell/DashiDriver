import { spawn } from "node:child_process";
import { writeFileSync, existsSync } from "node:fs";

const [, , url, out, width = "1440", height = "900", scrollTo = ""] = process.argv;
const edge = [
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
].find(existsSync);
const port = 9300 + Math.floor(Math.random() * 500);
const proc = spawn(edge, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${process.env.TEMP}/qc-shot-${port}`,
  "about:blank",
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) {
  await sleep(250);
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    target = list.find((t) => t.type === "page");
  } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
});
const send = (method, params = {}) =>
  new Promise((r) => {
    const mid = ++id;
    pending.set(mid, r);
    ws.send(JSON.stringify({ id: mid, method, params }));
  });

const w = Number(width);
const h = Number(height);
await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 600 });
await send("Page.enable");
await send("Page.navigate", { url });
await sleep(6000);
if (scrollTo) {
  await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${Number(scrollTo)})` });
  await sleep(1200);
}
const full = !scrollTo;
let clip;
if (full) {
  const { result } = await send("Runtime.evaluate", {
    expression: "JSON.stringify({w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight})",
    returnByValue: true,
  });
  const size = JSON.parse(result.result.value);
  clip = { x: 0, y: 0, width: size.w, height: size.h, scale: 1 };
  console.log("page size", size);
}
const shot = await send("Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: full,
  ...(clip ? { clip } : {}),
});
writeFileSync(out, Buffer.from(shot.result.data, "base64"));
console.log("wrote", out);
ws.close();
proc.kill();
process.exit(0);
