/*
  this file generates a manifest of clean csvs for 
  the client to request from the static BASE_DIR
*/
const fs = require("fs");
const { promisify } = require("util");

const readDir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);

const BASE_DIR = "./static";

(async () => {
  const files = await readDir(BASE_DIR);
  const CSVs = files.filter(file => file.slice(-4) === ".csv"); // only CSV files allowed
  const fullPaths = CSVs.map(file => `${BASE_DIR}/${file}`);

  await writeFile("manifest.json", JSON.stringify(fullPaths));
})();
