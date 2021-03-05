# yomi-dict
Kanji reading dictionary.

## Installation
```
npm install yomi-dict
```

## Build
1. install [SudachiDict](https://github.com/WorksApplications/SudachiDict)
2. install [NAIST-jdic](https://ja.osdn.net/projects/naist-jdic/downloads/53500/mecab-naist-jdic-0.6.3b-20111013.tar.gz/)
3. ```npm install```
4. ```node build.js```

## Usage
```
const YomiDict = require('yomi-dict');

const dict = new YomiDict();
dict.get('学校');  // --> [がっこう]
```

## License
Apache-2.0

## Attribution
- [SudachiDict](https://github.com/WorksApplications/SudachiDict) is licensed under the [Apache-2.0](http://www.apache.org/licenses/LICENSE-2.0).

