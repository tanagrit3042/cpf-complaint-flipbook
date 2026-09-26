import { readFile, writeFile } from "node:fs/promises";

const nextVersion = process.argv[2];

if (!nextVersion || !/^[0-9A-Za-z._-]+$/.test(nextVersion)) {
  console.error("Usage: npm run version-assets -- <version>");
  process.exit(1);
}

const replacements = [
  ["index.html", /(\.(?:css|js)\?v=)[^"']+/g],
  ["new.html", /(\.(?:css|js)\?v=)[^"']+/g],
  ["styles.css", /(\.png\?v=)[^"')]+/g],
];

for (const [file, pattern] of replacements) {
  const source = await readFile(file, "utf8");
  await writeFile(file, source.replace(pattern, `$1${nextVersion}`));
}

for (const [file, constant] of [
  ["app.js", "ASSET_VERSION"],
  ["new-pageflip.js", "PAGE_VERSION"],
]) {
  const source = await readFile(file, "utf8");
  const pattern = new RegExp(`(const ${constant} = ")[^"]+(";)`);
  await writeFile(file, source.replace(pattern, `$1${nextVersion}$2`));
}

console.log(`Asset version updated to ${nextVersion}`);
