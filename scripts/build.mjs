import { cp, mkdir, writeFile } from "node:fs/promises";
import { wedding } from "../site.config.js";

await mkdir("dist", { recursive: true });
for (const file of [
  "index.html",
  "styles.css",
  "app.js",
  "site.config.js",
  "assets",
]) {
  await cp(file, `dist/${file}`, { recursive: true });
}
await writeFile("dist/.nojekyll", "");
console.log("Hotovo: dist/ — statický web připravený pro GitHub Pages.");
if (!wedding.formEndpoint)
  console.log(
    "Formulář zatím nepřijímá odpovědi. Doplňte formEndpoint v site.config.js.",
  );
