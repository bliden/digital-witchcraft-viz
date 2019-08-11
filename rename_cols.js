const fs = require("fs");
const { promisify } = require("util");
const flattenDeep = require("lodash/flattenDeep");
const { each } = require("async");
const fastCSV = require("fast-csv");

const BASE_DIR = "./csv";

const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

let dirtyManifest;

(async () => {
  await generateManifestToBeCleaned();
  debugger;
  // await renameHeaders(manifest);
  await each(dirtyManifest, filepath => renameHeaders(filepath));
})();

async function generateManifestToBeCleaned() {
  const rootDirs = await readDir(BASE_DIR);
  const secondDirs = await Promise.all(
    rootDirs.map(dir => {
      return readDir(`${BASE_DIR}/${dir}`);
    })
  );
  let dirs = [...rootDirs].map((dir, i) => {
    return secondDirs[i].map(file => {
      return `${BASE_DIR}/${dir}/${file}`;
    });
  });
  dirs = flattenDeep(dirs);

  await writeFile("dirty-manifest.json", JSON.stringify(dirs));
  dirtyManifest = dirs;
}

async function renameHeaders(path) {
  const [primary, secondary] = parseFilename(path);
  const [primaryFileName, secondaryFileName] = [
    primary.replace(/\s/gi, "_"),
    secondary.replace(/\s/gi, "_")
  ];
  const headers = ["word", primary, secondary, "total"];
  const writeStream = fs.createWriteStream(
    `./static/${primaryFileName}-${secondaryFileName}.csv`
  );
  fs.createReadStream(path)
    .pipe(fastCSV.parse({ headers, renameHeaders: true }))
    .pipe(fastCSV.format({ headers: true }))
    .pipe(writeStream);
}

function parseFilename(dir) {
  //./csv/The_Witches_of_Eastwick/1987_Witches_of_Eastwick_82.txt-1948_Macbeth.txt-20180415-114832.csv
  let [, , primary, filename] = dir.split("/");
  filename = filename.split(".txt-")[1];
  if (filename.includes("rtf")) {
    filename = filename.split(".rtf-")[0];
  }
  filename = filename.split("_").slice(1); // remove year and split
  const lastIndex = parseInt(filename[filename.length - 1]);
  if (typeof lastIndex === "number" && !isNaN(lastIndex)) {
    filename = filename.slice(0, filename.length - 1);
  }
  const secondary = filename.join(" ");
  primary = primary.replace(/_/gi, " ");
  return [primary, secondary];
}
