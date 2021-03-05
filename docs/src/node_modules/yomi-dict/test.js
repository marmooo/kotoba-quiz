const YomiDict = require('.');

var dict = new YomiDict();
console.log('学 --> ' + dict.get('学'));
console.log('学校 --> ' + dict.get('学校'));

