/*
  this file converts a stop word csv to a JSON file
*/
const fs = require("fs");
const INFILE = "./stop-word-list.csv";
const OUTFILE = "./stopWordList.json";

fs.readFile(INFILE, (err, data) => {
  const list = data
    .toString()
    .split(",")
    .map(word => word.trim());

  fs.writeFile(OUTFILE, JSON.stringify(list), (err, data) => {
    console.log("Work finished. Parsed", list.length, "records.");
  });
});
