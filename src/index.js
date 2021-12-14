let endAudio, correctAudio;
loadAudios();
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
const tegakiPanel = document.getElementById("tegakiPanel");
let canvases = [...tegakiPanel.getElementsByTagName("canvas")];
let pads = [];
let problems = [];
let answer = "ゴファー";
let firstRun = true;
const canvasCache = document.createElement("canvas").getContext("2d");
let japaneseVoices = [];
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
    loopVoice();
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

function loopVoice() {
  speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(answer);
  msg.voice = japaneseVoices[Math.floor(Math.random() * japaneseVoices.length)];
  msg.lang = "ja-JP";
  for (let i = 0; i < 5; i++) {
    speechSynthesis.speak(msg);
  }
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
  pad.onEnd = () => {
    predict(pad.canvas);
  };
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
  const searchButton = document.getElementById("searchButton");
  searchButton.disabled = true;
  setTimeout(function () {
    searchButton.disabled = false;
  }, 2000);
  const [word, query] = problems[getRandomInt(0, problems.length - 1)];
  const input = document.getElementById("cse-search-input-box-id");
  input.value = query;
  answer = word;
  hideAnswer();
  document.getElementById("wordLength").textContent = answer.length;
  if (localStorage.getItem("voice") == 1) {
    loopVoice();
  } else {
    speechSynthesis.cancel();
  }
}

function changeGrade() {
  const index = document.getElementById("levelOption").selectedIndex;
  const grade = (index == 0) ? "hira" : "kana";
  fetch(grade + ".lst").then((response) => response.text()).then((tsv) => {
    problems = [];
    tsv.split("\n").forEach((line) => {
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

canvases.forEach((canvas) => {
  const pad = initSignaturePad(canvas);
  pads.push(pad);
  canvas.parentNode.querySelector(".eraser").onclick = () => {
    pad.clear();
    showPredictResult(canvas, " ");
  };
});

const worker = new Worker("worker.js");
worker.addEventListener("message", function (e) {
  const reply = showPredictResult(canvases[e.data.pos], e.data.result);
  if (reply == answer) {
    playAudio(correctAudio);
  }
});

changeGrade();

document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("toggleVoice").onclick = toggleVoice;
document.getElementById("showAnswer").onclick = showAnswer;
document.getElementById("levelOption").onchange = changeGrade;

