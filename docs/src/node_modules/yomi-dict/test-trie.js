const fs = require('fs');
const readEachLineSync = require('read-each-line-sync')

// https://gist.github.com/zensh/4975495
function memorySizeOf(obj) {
  var bytes = 0;

  function sizeOf(obj) {
    if(obj !== null && obj !== undefined) {
      switch(typeof obj) {
        case 'number':
          bytes += 8;
          break;
        case 'string':
          bytes += obj.length * 2;
          break;
        case 'boolean':
          bytes += 4;
          break;
        case 'object':
          var objClass = Object.prototype.toString.call(obj).slice(8, -1);
          if(objClass === 'Object' || objClass === 'Array') {
            for(var key in obj) {
              if(!obj.hasOwnProperty(key)) continue;
              sizeOf(obj[key]);
            }
          } else bytes += obj.toString().length * 2;
          break;
      }
    }
    return bytes;
  };

  function formatByteSize(bytes) {
    if(bytes < 1024) return bytes + " bytes";
    else if(bytes < 1048576) return(bytes / 1024).toFixed(3) + " KiB";
    else if(bytes < 1073741824) return(bytes / 1048576).toFixed(3) + " MiB";
    else return(bytes / 1073741824).toFixed(3) + " GiB";
  };

  return formatByteSize(sizeOf(obj));
};

function Trie() {
  this.root = {};
}

Trie.prototype.set = function(word, yomi) {
  var node = this.root;
  for(var i = 0; i < word.length; i++) {
    if (!node[word[i]]) {
      var newNode = {};
      node[word[i]] = newNode;
      node = newNode;
    } else {
      node = node[word[i]];
    }
  }
  if (node[true]) {
    if (!node[true].includes(yomi)) {
      node[true].push(yomi);
    }
  } else {
    node[true] = [yomi];
  }
};

Trie.prototype.contains = function(word) {
  var node = this.root;
  for(var i = 0; i < word.length; i++) {
    if (node[word[i]]) {
      node = node[word[i]];
    } else {
      return false;
    }
  }
  return node;
};

Trie.prototype.get = function(word) {
  var node = this.root;
  for(var i = 0; i < word.length; i++) {
    if (node[word[i]]) {
      node = node[word[i]];
    } else {
      return undefined;
    }
  }
  return node[true];
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
  var arr = line.split(',');
  pos2 = arr[5];
  if (pos2 == '固有名詞') {
    return false;
  }
  word = arr[0];
  yomi = arr[10];
  return [word, yomi];
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


var path = __dirname + '/yomi.csv';

// trie.set('学校', 'がっこう');
// trie.get('学校');
var trie = new Trie();
readEachLineSync(path, 'utf8', (line) => {
  var arr = line.split(',');
  var word = arr[0];
  var yomis = arr.slice(1);
  yomis.forEach(yomi => trie.set(word, yomi));
});
console.log('trie: ' + memorySizeOf(trie.root));

var hash = {};
readEachLineSync(path, 'utf8', (line) => {
  var arr = line.split(',');
  var word = arr[0];
  var yomis = arr.slice(1);
  hash[word] = yomis;
});
console.log('hash: ' + memorySizeOf(hash));

