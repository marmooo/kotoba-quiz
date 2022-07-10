let endAudio, correctAudio;
loadAudios();
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
const tegakiPanel = document.getElementById("tegakiPanel");
const gameTime = 180;
let canvases = [...tegakiPanel.getElementsByTagName("canvas")];
let pads = [];
let problems = [];
let answered = false;
let answer = "ゴファー";
let firstRun = true;
const canvasCache = document.createElement("canvas").getContext("2d");
let japaneseVoices = [];
let correctCount = 0;
loadConfig();

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.dataset.theme = "dark";
  }
  if (localStorage.getItem("voice") != 1) {
    document.getElementById("voiceOn").classList.add("d-none");
    document.getElementById("voiceOff").classList.remove("d-none");
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    delete document.documentElement.dataset.theme;
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.dataset.theme = "dark";
  }
}

function toggleVoice() {
  if (localStorage.getItem("voice") == 1) {
    localStorage.setItem("voice", 0);
    document.getElementById("voiceOn").classList.add("d-none");
    document.getElementById("voiceOff").classList.remove("d-none");
    speechSynthesis.cancel();
  } else {
    localStorage.setItem("voice", 1);
    document.getElementById("voiceOn").classList.remove("d-none");
    document.getElementById("voiceOff").classList.add("d-none");
    unlockAudio();
    loopVoice(answer, 3);
  }
}

function playAudio(audioBuffer, volume) {
  const audioSource = audioContext.createBufferSource();
  audioSource.buffer = audioBuffer;
  if (volume) {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(audioContext.destination);
    audioSource.connect(gainNode);
    audioSource.start();
  } else {
    audioSource.connect(audioContext.destination);
    audioSource.start();
  }
}

function unlockAudio() {
  audioContext.resume();
}

function loadAudio(url) {
  return fetch(url)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
      return new Promise((resolve, reject) => {
        audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
          resolve(audioBuffer);
        }, (err) => {
          reject(err);
        });
      });
    });
}

function loadAudios() {
  promises = [
    loadAudio("mp3/end.mp3"),
    loadAudio("mp3/correct3.mp3"),
  ];
  Promise.all(promises).then((audioBuffers) => {
    endAudio = audioBuffers[0];
    correctAudio = audioBuffers[1];
  });
}

function loadVoices() {
  // https://stackoverflow.com/questions/21513706/
  const allVoicesObtained = new Promise(function (resolve) {
    let voices = speechSynthesis.getVoices();
    if (voices.length !== 0) {
      resolve(voices);
    } else {
      speechSynthesis.addEventListener("voiceschanged", function () {
        voices = speechSynthesis.getVoices();
        resolve(voices);
      });
    }
  });
  allVoicesObtained.then((voices) => {
    japaneseVoices = voices.filter((voice) => voice.lang == "ja-JP");
  });
}
loadVoices();

function loopVoice(text, n) {
  speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(text);
  msg.voice = japaneseVoices[Math.floor(Math.random() * japaneseVoices.length)];
  msg.lang = "ja-JP";
  for (let i = 0; i < n; i++) {
    speechSynthesis.speak(msg);
  }
}

function respeak() {
  loopVoice(answer, 3);
}

function setTegakiPanel() {
  const tegakiPanel = document.getElementById("tegakiPanel");
  while (tegakiPanel.firstChild) {
    tegakiPanel.removeChild(tegakiPanel.lastChild);
  }
  pads = [];
  for (let i = 0; i < answer.length; i++) {
    // const box = document.createElement("tegaki-box");
    const box = createTegakiBox();
    tegakiPanel.appendChild(box);
  }
  // const boxes = tegakiPanel.getElementsByTagName("tegaki-box");
  // canvases = [...boxes].map((box) => box.shadowRoot.querySelector("canvas"));
  const boxes = tegakiPanel.children;
  canvases = [...boxes].map((box) => box.querySelector("canvas"));
}

function showPredictResult(canvas, result) {
  const pos = canvases.indexOf(canvas);
  const answerWord = answer[pos];
  let matched = false;
  for (let i = 0; i < result.length; i++) {
    if (result[i] == answerWord) {
      matched = true;
      break;
    }
  }
  if (matched) {
    canvas.setAttribute("data-predict", answerWord);
  } else {
    canvas.setAttribute("data-predict", result[0]);
  }
  let reply = "";
  for (let i = 0; i < canvases.length; i++) {
    const result = canvases[i].getAttribute("data-predict");
    if (result) {
      reply += result;
    } else {
      reply += " ";
    }
  }
  document.getElementById("reply").textContent = reply;
  return reply;
}

function initSignaturePad(canvas) {
  const pad = new SignaturePad(canvas, {
    minWidth: 2,
    maxWidth: 2,
    penColor: "black",
    backgroundColor: "white",
    throttle: 0,
    minDistance: 0,
  });
  pad.addEventListener("endStroke", () => {
    predict(pad.canvas);
  });
  return pad;
}

function getImageData(drawElement) {
  const inputWidth = inputHeight = 28;
  // resize
  canvasCache.drawImage(drawElement, 0, 0, inputWidth, inputHeight);
  // invert color
  const imageData = canvasCache.getImageData(0, 0, inputWidth, inputHeight);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
  return imageData;
}

function predict(canvas) {
  const imageData = getImageData(canvas);
  const pos = canvases.indexOf(canvas);
  worker.postMessage({ imageData: imageData, pos: pos });
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function hideAnswer() {
  const node = document.getElementById("answer");
  node.classList.add("d-none");
}

function showAnswer() {
  const node = document.getElementById("answer");
  node.classList.remove("d-none");
  node.textContent = answer;
}

function nextProblem() {
  answered = false;
  const searchButton = document.getElementById("searchButton");
  searchButton.disabled = true;
  setTimeout(() => {
    searchButton.disabled = false;
  }, 2000);
  const [word, query] = problems[getRandomInt(0, problems.length - 1)];
  const input = document.getElementById("cse-search-input-box-id");
  input.value = query;
  answer = word;
  document.getElementById("reply").textContent = "";
  if (document.getElementById("mode").textContent == "EASY") {
    showAnswer();
  } else {
    hideAnswer();
  }
  document.getElementById("wordLength").textContent = answer.length;
  if (localStorage.getItem("voice") == 1) {
    loopVoice(answer, 3);
  } else {
    speechSynthesis.cancel();
  }
}

function initProblems() {
  const index = document.getElementById("grade").selectedIndex;
  const grade = (index == 0) ? "hira" : "kana";
  fetch(grade + ".lst")
    .then((response) => response.text())
    .then((tsv) => {
      problems = [];
      tsv.trimEnd().split("\n").forEach((line) => {
        const [word, query] = line.split("\t");
        problems.push([word, query]);
      });
    });
}

function searchByGoogle(event) {
  event.preventDefault();
  const input = document.getElementById("cse-search-input-box-id");
  const element = google.search.cse.element.getElement("searchresults-only0");
  nextProblem();
  if (input.value == "") {
    element.clearAllResults();
  } else {
    element.execute(input.value);
  }
  setTegakiPanel();
  if (firstRun) {
    const gophers = document.getElementById("gophers");
    while (gophers.firstChild) {
      gophers.removeChild(gophers.lastChild);
    }
    unlockAudio();
    firstRun = false;
  }
  return false;
}
document.getElementById("cse-search-box-form-id").onsubmit = searchByGoogle;

let gameTimer;
function startGameTimer() {
  clearInterval(gameTimer);
  const timeNode = document.getElementById("time");
  initTime();
  gameTimer = setInterval(() => {
    const t = parseInt(timeNode.textContent);
    if (t > 0) {
      timeNode.textContent = t - 1;
    } else {
      clearInterval(gameTimer);
      playAudio(endAudio);
      playPanel.classList.add("d-none");
      scorePanel.classList.remove("d-none");
      document.getElementById("score").textContent = correctCount;
    }
  }, 1000);
}

let countdownTimer;
function countdown() {
  clearTimeout(countdownTimer);
  gameStart.classList.remove("d-none");
  playPanel.classList.add("d-none");
  scorePanel.classList.add("d-none");
  const counter = document.getElementById("counter");
  counter.textContent = 3;
  countdownTimer = setInterval(() => {
    const colors = ["skyblue", "greenyellow", "violet", "tomato"];
    if (parseInt(counter.textContent) > 1) {
      const t = parseInt(counter.textContent) - 1;
      counter.style.backgroundColor = colors[t];
      counter.textContent = t;
    } else {
      clearTimeout(countdownTimer);
      gameStart.classList.add("d-none");
      playPanel.classList.remove("d-none");
      correctCount = 0;
      document.getElementById("score").textContent = correctCount;
      document.getElementById("searchButton").classList.add(
        "animate__heartBeat",
      );
      startGameTimer();
    }
  }, 1000);
}

function initTime() {
  document.getElementById("time").textContent = gameTime;
}

function changeMode() {
  if (this.textContent == "EASY") {
    this.textContent = "HARD";
  } else {
    this.textContent = "EASY";
  }
}

customElements.define(
  "tegaki-box",
  class extends HTMLElement {
    constructor() {
      super();
      const template = document.getElementById("tegaki-box").content.cloneNode(
        true,
      );
      const canvas = template.querySelector("canvas");
      const pad = initSignaturePad(canvas);
      template.querySelector(".eraser").onclick = () => {
        pad.clear();
      };
      pads.push(pad);
      this.attachShadow({ mode: "open" }).appendChild(template);
    }
  },
);

function createTegakiBox() {
  const div = document.createElement("div");
  const template = document.getElementById("tegaki-box").content.cloneNode(
    true,
  );
  div.appendChild(template);
  const canvas = div.querySelector("canvas");
  const pad = initSignaturePad(canvas);
  div.querySelector(".eraser").onclick = () => {
    pad.clear();
  };
  pads.push(pad);
  return div;
}

function kanaToHira(str) {
  return str.replace(/[\u30a1-\u30f6]/g, (match) => {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

function hiraToKana(str) {
  return str.replace(/[\u3041-\u3096]/g, (match) => {
    const chr = match.charCodeAt(0) + 0x60;
    return String.fromCharCode(chr);
  });
}

function formatReply(reply) {
  // 「へべぺ」のひらがな/カタカナを見分けるのは困難
  if (document.getElementById("grade").selectedIndex == 1) { // kana
    if (["へ", "べ", "ぺ"].includes(reply)) {
      return hiraToKana(reply);
    }
  } else {
    if (["ヘ", "ベ", "ペ"].includes(reply)) {
      return kanaToHira(reply);
    }
  }
  return reply;
}

canvases.forEach((canvas) => {
  const pad = initSignaturePad(canvas);
  pads.push(pad);
  canvas.parentNode.querySelector(".eraser").onclick = () => {
    pad.clear();
    showPredictResult(canvas, " ");
  };
});

const worker = new Worker("worker.js");
worker.addEventListener("message", (e) => {
  if (answered) return;
  const reply = showPredictResult(canvases[e.data.pos], e.data.result);
  if (answer == formatReply(reply)) {
    answered = true;
    if (document.getElementById("mode").textContent == "EASY") {
      correctCount += 1;
    } else {
      const node = document.getElementById("answer");
      const noHint = node.classList.contains("d-none");
      if (noHint) correctCount += 1;
    }
    playAudio(correctAudio);
    document.getElementById("reply").textContent = "⭕ " + answer;
    document.getElementById("searchButton").classList.add("animate__heartBeat");
  }
});

initProblems();

document.getElementById("mode").onclick = changeMode;
document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("toggleVoice").onclick = toggleVoice;
document.getElementById("respeak").onclick = respeak;
document.getElementById("restartButton").onclick = countdown;
document.getElementById("startButton").onclick = countdown;
document.getElementById("showAnswer").onclick = showAnswer;
document.getElementById("grade").onchange = initProblems;
document.getElementById("searchButton").addEventListener(
  "animationend",
  (e) => {
    e.target.classList.remove("animate__heartBeat");
  },
);
document.addEventListener("click", unlockAudio, {
  once: true,
  useCapture: true,
});
