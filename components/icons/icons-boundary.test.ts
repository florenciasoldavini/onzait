import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const allowedImportFile = join("components", "icons", "index.tsx");
const excludedDirectories = new Set([
  ".expo",
  ".git",
  "coverage",
  "dist",
  "node_modules"
]);

describe("icon import boundary", () => {
  it("keeps lucide-react-native imports inside the central icon module", () => {
    const violations = collectSourceFiles(process.cwd())
      .filter((file) => relative(process.cwd(), file) !== allowedImportFile)
      .filter((file) =>
        /from\s+["']lucide-react-native["']/.test(readFileSync(file, "utf8"))
      )
      .map((file) => relative(process.cwd(), file));

    expect(violations).toEqual([]);
  });
});

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      return excludedDirectories.has(entry.name)
        ? []
        : collectSourceFiles(join(directory, entry.name));
    }

    return /\.(ts|tsx)$/.test(entry.name) ? [join(directory, entry.name)] : [];
  });
}
