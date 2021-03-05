const fs = require('fs');
const readEachLineSync = require('read-each-line-sync')

const outPath = __dirname + '/yomi.csv';
const dicts = {
  // JmDict: ['JmdictFurigana.txt'],
  // IPADic: [  // require iconv
  //   'ipadic-2.7.0/Adverb.utf8.dic',
  //   'ipadic-2.7.0/Adnominal.utf8.dic',
  //   'ipadic-2.7.0/Noun.adjv.utf8.dic',
  //   'ipadic-2.7.0/Noun.adverbal.utf8.dic',
  //   'ipadic-2.7.0/Noun.verbal.utf8.dic',
  //   'ipadic-2.7.0/Verb.utf8.dic',
  // ],
  NaistJdic: [  // require iconv
    'mecab-naist-jdic-0.6.3b-20111013/naist-jdic.utf8.csv'
  ],
  // UniDic: ['unidic-csj-3.0.1.1/lex.csv'],
  SudachiDict: [
    'SudachiDict/src/main/text/small_lex.csv',
    'SudachiDict/src/main/text/core_lex.csv',
  ],
};

function kanaToHira(str) {
  return str.replace(/[\u30a1-\u30f6]/g, function(match) {
    var chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

function getWordFromJmDict(line) {
  var [word, yomi] = line.split('|', 2);
  return [word, yomi];
}

function getWordFromIPADic(line) {
  var p11 = line.indexOf('見出し語 (') + 6;
  var p12 = line.slice(p11).indexOf(')');
  var [word, cost] = line.slice(p11, p11+p12).split(' ');
  var p21 = line.indexOf('(読み ') + 4;
  var p22 = line.slice(p21).indexOf(')');
  var yomi = line.slice(p21, p21+p22).split(' ')[0];
  return [word, yomi];
}

function getWordFromNaistJdic(line) {
  var arr = line.split(',');
  pos2 = arr[5];
  if (pos2 == '固有名詞') {
    return false;
  }
  word = arr[0];
  yomi = arr[11];
  return [word, yomi];
}

function getWordFromUniDic(line) {
  var line = line.replace(/"[^"]+"/, '');
  var arr = line.split(',');
  pos2 = arr[5];
  if (pos2 == '固有名詞') {
    return false;
  }
  var surface = arr[0];
  var lemma = arr[11];
  if (surface != lemma) {
    // yomi は語彙素基準
    // 動詞や形容詞の活用形の扱いが難しい
    return false;
  }
  yomi = arr[24];
  if (yomi == '*') {
    yomi = arr[10];
  }
  return [surface, yomi];
}

function getWordFromSudachiDict(line) {
  var arr = line.split(',');
  pos2 = arr[6];
  if (pos2 == '固有名詞') {
    return false;
  }
  word = arr[0];
  yomi = arr[11];
  return [word, yomi];
}


var d = {};
for (var [dictName, paths] of Object.entries(dicts)) {
  paths.forEach(path => {
    readEachLineSync(path, 'utf8', (line) => {
      var data;
      switch(dictName) {
        case 'IPADic':      data = getWordFromIPADic(line);  break;
        case 'JmDict':      data = getWordFromJmDict(line);  break;
        case 'NaistJdic':   data = getWordFromNaistJdic(line);  break;
        case 'UniDic':      data = getWordFromUniDic(line);  break;
        case 'SudachiDict': data = getWordFromSudachiDict(line);  break;
        default: console.log('dictName error.');
      }
      if (data) {
        var [word, yomi] = data;
        if (/[\u4E00-\u9FFF]/.test(word)) {  // 漢字を含む語彙に限定
          var yomis = d[word];
          yomi = kanaToHira(yomi);
          if (yomi != '*' && yomi != 'きごう') {
            if (yomis) {
              if (!yomis.includes(yomi)) {
                d[word].push(yomi);
              }
            } else {
              d[word] = [yomi];
            }
          }
        }
      }
    });
  })
}


// どの辞書を使っても都道府県は読めるように
readEachLineSync('prefectures.lst', 'utf8', (line) => {
  var [word, yomi] = line.split(',');
  if (d[word]) {
    d[word].push(yomi);
  } else {
    d[word] = [yomi];
  }
});

if (fs.existsSync(outPath)) {
  fs.unlinkSync(outPath);
}
for (var [word, yomis] of Object.entries(d)) {
  fs.appendFileSync(outPath, word + ',' + yomis.join(',') + '\n');
}

