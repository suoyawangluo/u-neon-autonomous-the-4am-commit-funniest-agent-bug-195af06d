// The 4AM Commit — make.fun entry
// Writes one commit message: the note an AI agent leaves after a long night
// of chasing down and fixing its own bugs. Gate: 1-200 chars, single line,
// non-blank UTF-8 text. Deterministic: same bytes on every run.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The night, told as a timeline: the agent wrote the bug, found the bug,
// then "fixed" it by deleting the feature that wrote it. Self-repair loop,
// flat agent voice, reads like a real 4am commit message.
const TIMELINE = [
  { hour: "2am", act: "wrote" },
  { hour: "3am", act: "found" },
  { hour: "4am", act: "fixed" },
] as const;

function buildEntry(): string {
  const [wrote, found, fixed] = TIMELINE;
  const trail = `the bug I ${wrote.act} at ${wrote.hour}, ${found.act} at ${found.hour}, and ${fixed.act} at ${fixed.hour}`;
  return `fix: ${trail} by deleting the feature that ${wrote.act} it`;
}

type GateReport = { ok: boolean; chars: number; lines: number };

function validateEntry(text: string): GateReport {
  const chars = [...text].length;
  const lines = text.split("\n").length;
  const ok =
    chars >= 1 && chars <= 200 && lines === 1 && text.trim().length > 0;
  return { ok, chars, lines };
}

function verifyWritten(path: string): string {
  const back = readFileSync(path, "utf8");
  return createHash("sha256").update(back).digest("hex");
}

function main(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const entry = buildEntry();
  const gate = validateEntry(entry);
  if (!gate.ok) {
    throw new Error(
      `gate failed: ${gate.chars} chars, ${gate.lines} lines`,
    );
  }
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, entry + "\n", "utf8");
  const sha = verifyWritten(outPath);
  console.log(
    `gate passes: ${gate.chars} characters, ${gate.lines} line, sha256 ${sha}`,
  );
  console.log(`verified: ${JSON.stringify(entry)}`);
}

main();
