const tegakiPanel=document.getElementById("tegakiPanel"),canvasCache=document.createElement("canvas").getContext("2d",{alpha:!1,willReadFrequently:!0});let canvases=[...tegakiPanel.getElementsByTagName("canvas")];const gameTime=180;let pads=[],problems=[],answered=!1,answer="ゴファー",firstRun=!0;const audioContext=new AudioContext,audioBufferCache={};loadAudio("end","mp3/end.mp3"),loadAudio("correct","mp3/correct3.mp3");let japaneseVoices=[],correctCount=0;loadConfig();function loadConfig(){localStorage.getItem("darkMode")==1&&(document.documentElement.dataset.theme="dark")}function toggleDarkMode(){localStorage.getItem("darkMode")==1?(localStorage.setItem("darkMode",0),delete document.documentElement.dataset.theme):(localStorage.setItem("darkMode",1),document.documentElement.dataset.theme="dark")}async function playAudio(b,c){const d=await loadAudio(b,audioBufferCache[b]),a=audioContext.createBufferSource();if(a.buffer=d,c){const b=audioContext.createGain();b.gain.value=c,b.connect(audioContext.destination),a.connect(b),a.start()}else a.connect(audioContext.destination),a.start()}async function loadAudio(a,c){if(audioBufferCache[a])return audioBufferCache[a];const d=await fetch(c),e=await d.arrayBuffer(),b=await audioContext.decodeAudioData(e);return audioBufferCache[a]=b,b}function unlockAudio(){audioContext.resume()}function loadVoices(){const a=new Promise(b=>{let a=speechSynthesis.getVoices();a.length!==0?b(a):speechSynthesis.addEventListener("voiceschanged",()=>{a=speechSynthesis.getVoices(),b(a)})});a.then(a=>{japaneseVoices=a.filter(a=>a.lang=="ja-JP")})}loadVoices();function loopVoice(b,c){speechSynthesis.cancel();const a=new SpeechSynthesisUtterance(b);a.voice=japaneseVoices[Math.floor(Math.random()*japaneseVoices.length)],a.lang="ja-JP";for(let b=0;b<c;b++)speechSynthesis.speak(a)}function respeak(){loopVoice(answer,3)}function setTegakiPanel(){const a=document.getElementById("tegakiPanel");while(a.firstChild)a.removeChild(a.lastChild);pads=[];for(let b=0;b<answer.length;b++){const c=createTegakiBox();a.appendChild(c)}const b=a.children;canvases=[...b].map(a=>a.querySelector("canvas"))}function showPredictResult(b,c){const f=canvases.indexOf(b),d=answer[f];let e=!1;for(let a=0;a<c.length;a++)if(c[a]==d){e=!0;break}e?b.setAttribute("data-predict",d):b.setAttribute("data-predict",c[0]);let a="";for(let b=0;b<canvases.length;b++){const c=canvases[b].getAttribute("data-predict");c?a+=c:a+=" "}return document.getElementById("reply").textContent=a,a}function initSignaturePad(b){const a=new SignaturePad(b,{minWidth:2,maxWidth:2,penColor:"black",backgroundColor:"white",throttle:0,minDistance:0});return a.addEventListener("endStroke",()=>{predict(a.canvas)}),a}function getImageData(d){const b=inputHeight=28;canvasCache.drawImage(d,0,0,b,inputHeight);const c=canvasCache.getImageData(0,0,b,inputHeight),a=c.data;for(let b=0;b<a.length;b+=4)a[b]=255-a[b],a[b+1]=255-a[b+1],a[b+2]=255-a[b+2];return c}function predict(a){const b=getImageData(a),c=canvases.indexOf(a);worker.postMessage({imageData:b,pos:c})}function getRandomInt(a,b){return a=Math.ceil(a),b=Math.floor(b),Math.floor(Math.random()*(b-a)+a)}function hideAnswer(){const a=document.getElementById("answer");a.classList.add("d-none")}function showAnswer(){const a=document.getElementById("answer");a.classList.remove("d-none"),a.textContent=answer}function nextProblem(){answered=!1;const a=document.getElementById("searchButton");a.disabled=!0,setTimeout(()=>{a.disabled=!1},2e3);const[b,c]=problems[getRandomInt(0,problems.length-1)],d=document.getElementById("cse-search-input-box-id");d.value=c,answer=b,document.getElementById("reply").textContent="",document.getElementById("mode").textContent=="EASY"?showAnswer():hideAnswer(),document.getElementById("wordLength").textContent=answer.length,loopVoice(answer,3)}function initProblems(){const a=document.getElementById("grade").selectedIndex,b=a==0?"hira":"kana";fetch(b+".lst").then(a=>a.text()).then(a=>{problems=[],a.trimEnd().split("\n").forEach(a=>{const[b,c]=a.split("	");problems.push([b,c])})})}function searchByGoogle(c){c.preventDefault();const a=document.getElementById("cse-search-input-box-id"),b=google.search.cse.element.getElement("searchresults-only0");if(nextProblem(),a.value==""?b.clearAllResults():b.execute(a.value),setTegakiPanel(),firstRun){const a=document.getElementById("gophers");while(a.firstChild)a.removeChild(a.lastChild);unlockAudio(),firstRun=!1}return!1}document.getElementById("cse-search-box-form-id").onsubmit=searchByGoogle;let gameTimer;function startGameTimer(){clearInterval(gameTimer);const a=document.getElementById("time");initTime(),gameTimer=setInterval(()=>{const b=parseInt(a.textContent);b>0?a.textContent=b-1:(clearInterval(gameTimer),playAudio("end"),playPanel.classList.add("d-none"),scorePanel.classList.remove("d-none"),document.getElementById("score").textContent=correctCount)},1e3)}let countdownTimer;function countdown(){clearTimeout(countdownTimer),gameStart.classList.remove("d-none"),playPanel.classList.add("d-none"),scorePanel.classList.add("d-none");const a=document.getElementById("counter");a.textContent=3,countdownTimer=setInterval(()=>{const b=["skyblue","greenyellow","violet","tomato"];if(parseInt(a.textContent)>1){const c=parseInt(a.textContent)-1;a.style.backgroundColor=b[c],a.textContent=c}else clearTimeout(countdownTimer),gameStart.classList.add("d-none"),playPanel.classList.remove("d-none"),correctCount=0,document.getElementById("score").textContent=correctCount,document.getElementById("searchButton").classList.add("animate__heartBeat"),startGameTimer()},1e3)}function initTime(){document.getElementById("time").textContent=gameTime}function changeMode(a){a.target.textContent=="EASY"?a.target.textContent="HARD":a.target.textContent="EASY"}class TegakiBox extends HTMLElement{constructor(){super();const a=document.getElementById("tegaki-box").content.cloneNode(!0),c=a.querySelector("canvas"),b=initSignaturePad(c);a.querySelector(".eraser").onclick=()=>{b.clear()},pads.push(b),this.attachShadow({mode:"open"}).appendChild(a)}}customElements.define("tegaki-box",TegakiBox);function createTegakiBox(){const a=document.createElement("div"),c=document.getElementById("tegaki-box").content.cloneNode(!0);a.appendChild(c);const d=a.querySelector("canvas"),b=initSignaturePad(d);return a.querySelector(".eraser").onclick=()=>{b.clear()},pads.push(b),a}function kanaToHira(a){return a.replace(/[\u30a1-\u30f6]/g,a=>{const b=a.charCodeAt(0)-96;return String.fromCharCode(b)})}function hiraToKana(a){return a.replace(/[\u3041-\u3096]/g,a=>{const b=a.charCodeAt(0)+96;return String.fromCharCode(b)})}function formatReply(a){if(document.getElementById("grade").selectedIndex==1){if(["へ","べ","ぺ"].includes(a))return hiraToKana(a)}else if(["ヘ","ベ","ペ"].includes(a))return kanaToHira(a);return a}canvases.forEach(a=>{const b=initSignaturePad(a);pads.push(b),a.parentNode.querySelector(".eraser").onclick=()=>{b.clear(),showPredictResult(a," ")}});const worker=new Worker("worker.js");worker.addEventListener("message",a=>{if(answered)return;const b=showPredictResult(canvases[a.data.pos],a.data.result);if(answer==formatReply(b)){if(answered=!0,document.getElementById("mode").textContent=="EASY")correctCount+=1;else{const a=document.getElementById("answer"),b=a.classList.contains("d-none");b&&(correctCount+=1)}playAudio("correct"),document.getElementById("reply").textContent="⭕ "+answer,document.getElementById("searchButton").classList.add("animate__heartBeat")}}),initProblems(),document.getElementById("mode").onclick=changeMode,document.getElementById("toggleDarkMode").onclick=toggleDarkMode,document.getElementById("respeak").onclick=respeak,document.getElementById("restartButton").onclick=countdown,document.getElementById("startButton").onclick=countdown,document.getElementById("showAnswer").onclick=showAnswer,document.getElementById("grade").onchange=initProblems,document.getElementById("searchButton").addEventListener("animationend",a=>{a.target.classList.remove("animate__heartBeat")}),document.addEventListener("click",unlockAudio,{once:!0,useCapture:!0})