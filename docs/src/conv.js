const fs = require('fs');
const YomiDict = require('yomi-dict');
const readEachLineSync = require('read-each-line-sync');

readEachLineSync('4.lst', 'utf8', (line) => {
  let [_, word2] = line.split('\t');
  YomiDict.get(word2);
});
