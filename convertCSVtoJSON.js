/*
  this file converts a stop word csv to a JSON file
*/
const fs = require("fs");
const INFILE = "./stop-word-list.csv"; // convert to cli flag
const OUTFILE = "./stopWordList.json"; // convert to cli flag

/*
  Not using the file streaming interface here bevause the \
  expected CSV files are (around) 2k lines long. not too huge
*/
fs.readFile(INFILE, (err, data) => {
  const list = data
    .toString()
    .split(",")
    .map(word => word.trim());

  fs.writeFile(OUTFILE, JSON.stringify(list), (err, data) => {
    console.log("Work finished. Parsed", list.length, "records.");
  });
});
