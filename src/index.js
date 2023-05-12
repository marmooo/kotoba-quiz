const tegakiPanel = document.getElementById("tegakiPanel");
const canvasCache = document.createElement("canvas")
  .getContext("2d", { willReadFrequently: true });
let canvases = [...tegakiPanel.getElementsByTagName("canvas")];
const gameTime = 180;
let pads = [];
let problems = [];
let answered = false;
let answer = "ゴファー";
let firstRun = true;
const audioContext = new AudioContext();
const audioBufferCache = {};
loadAudio("end", "mp3/end.mp3");
loadAudio("correct", "mp3/correct3.mp3");
let japaneseVoices = [];
let correctCount = 0;
loadConfig();

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.dataset.theme = "dark";
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

async function playAudio(name, volume) {
  const audioBuffer = await loadAudio(name, audioBufferCache[name]);
  const sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = audioBuffer;
  if (volume) {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(audioContext.destination);
    sourceNode.connect(gainNode);
    sourceNode.start();
  } else {
    sourceNode.connect(audioContext.destination);
    sourceNode.start();
  }
}

async function loadAudio(name, url) {
  if (audioBufferCache[name]) return audioBufferCache[name];
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  audioBufferCache[name] = audioBuffer;
  return audioBuffer;
}

function unlockAudio() {
  audioContext.resume();
}

function loadVoices() {
  // https://stackoverflow.com/questions/21513706/
  const allVoicesObtained = new Promise((resolve) => {
    let voices = speechSynthesis.getVoices();
    if (voices.length !== 0) {
      resolve(voices);
    } else {
      speechSynthesis.addEventListener("voiceschanged", () => {
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
    // const box = new TegakiBox();
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
  loopVoice(answer, 3);
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
      playAudio("end");
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

function changeMode(event) {
  if (event.target.textContent == "EASY") {
    event.target.textContent = "HARD";
  } else {
    event.target.textContent = "EASY";
  }
}

class TegakiBox extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById("tegaki-box")
      .content.cloneNode(true);
    const canvas = template.querySelector("canvas");
    const pad = initSignaturePad(canvas);
    template.querySelector(".eraser").onclick = () => {
      pad.clear();
    };
    pads.push(pad);
    this.attachShadow({ mode: "open" }).appendChild(template);
  }
}
customElements.define("tegaki-box", TegakiBox);

function createTegakiBox() {
  const div = document.createElement("div");
  const template = document.getElementById("tegaki-box")
    .content.cloneNode(true);
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
    playAudio("correct");
    document.getElementById("reply").textContent = "⭕ " + answer;
    document.getElementById("searchButton").classList.add("animate__heartBeat");
  }
});

initProblems();

document.getElementById("mode").onclick = changeMode;
document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("respeak").onclick = respeak;
document.getElementById("restartButton").onclick = countdown;
document.getElementById("startButton").onclick = countdown;
document.getElementById("showAnswer").onclick = showAnswer;
document.getElementById("grade").onchange = initProblems;
document.getElementById("searchButton")
  .addEventListener("animationend", (event) => {
    event.target.classList.remove("animate__heartBeat");
  });
document.addEventListener("click", unlockAudio, {
  once: true,
  useCapture: true,
});
