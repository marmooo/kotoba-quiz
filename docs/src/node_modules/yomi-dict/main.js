const fs = require('fs');
const readEachLineSync = require('read-each-line-sync')

function YomiDict() {
  var dict = {};
  readEachLineSync(__dirname + '/yomi.csv', 'utf8', (line) => {
    var arr = line.split(',');
    var word = arr[0];
    var yomis = arr.slice(1);
    dict[word] = yomis;
  });
  this.dict = dict;
}

YomiDict.prototype.get = function(word) {
  return this.dict[word];
};

module.exports = YomiDict;

