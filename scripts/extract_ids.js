#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');

function processLineByLine(src, dest, numLines) {
  const fileStream = fs.createReadStream(src);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let idArray = [];
  let counter = 0;

  rl.on('line', (line) => {

    if (numLines && (counter < numLines)) {
      counter++;
      const moleculeID = line.split(/(\s+)/)[0];
      idArray.push(moleculeID);
    }

    if (numLines && (counter >= numLines)) {
      rl.close();
    }
  });

  rl.on('close', (line) => {
    const dataOut = {
      ids: idArray
    };

    const jsonOut = JSON.stringify(dataOut);

    if (dest) {
      fs.writeFile(dest, jsonOut, 'utf8', (err, data) => {
        if (err) {
          console.error(err);
        } else {
          console.log(`Successfully wrote ${counter} IDs to ${dest}.`);
        }
      })
    } else {
      console.log(jsonOut);
    }
  })
}

let [,, ...args] = process.argv;

let numSamples;

// Check for the --samples flag and if it exists, extract and parse its following value and remove the flag and value from the array
args.forEach((arg, index) => {
  if ((arg === '--samples') || (arg === '-s')) {
    const parsedSamplesVal = parseInt(args[index + 1]);
    if (parsedSamplesVal) {
      numSamples = parsedSamplesVal;
    } else {
      console.error(`Invalid integer provided for --samples flag: ${parsedSamplesVal}`);
      process.exit(1);
    }

    args = args.slice(0, index).concat(args.slice(index + 2));

    return;
  }
});

const sourceFile = args[0];
const destFile = args[1];

if ((sourceFile === '--help') || (!sourceFile)) {
  console.log(`
    Use this parser to extract ChEMBL IDs from dumps of their database, or other similarly formatted files.
    All this parser does is extract the first entry from each line of a white-space separated text file of data and write it to a file, or standard out, as a JSON object. For ChEMBL database dumps, the first value of each line is a ChEMBL ID.

    USAGE:
    node extract_ids.js [sourceFile] [destinationFile] [flags]

    Arguments:
    sourceFile: the file path to a text file from which to extract IDs.
    destinationFile: the desired file path where the final result should be written. If left undefined, the JSON data will be printed to standard out.

    Flags:
    --samples, -s: An integer indicating the number of lines to read, parse and write.
  `);

  process.exit(0);
}

if (!sourceFile) {
  console.error('No source file provided! Exiting...');
} else {
  if (!destFile) {
    console.warn('No destination file path provided. Will print result to standard out.')
  }

  processLineByLine(sourceFile, destFile, numSamples);
}
