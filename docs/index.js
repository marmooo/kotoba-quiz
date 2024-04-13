import signaturePad from"https://cdn.jsdelivr.net/npm/signature_pad@4.2.0/+esm";const playPanel=document.getElementById("playPanel"),infoPanel=document.getElementById("infoPanel"),countPanel=document.getElementById("countPanel"),scorePanel=document.getElementById("scorePanel"),tegakiPanel=document.getElementById("tegakiPanel"),canvasCache=document.createElement("canvas").getContext("2d",{alpha:!1,willReadFrequently:!0});let canvases=[...tegakiPanel.getElementsByTagName("canvas")];const gameTime=180;let pads=[],problems=[],answered=!1,answer="ゴファー",firstRun=!0;const audioContext=new globalThis.AudioContext,audioBufferCache={};loadAudio("end","mp3/end.mp3"),loadAudio("correct","mp3/correct3.mp3");let japaneseVoices=[],correctCount=0;loadConfig();function loadConfig(){localStorage.getItem("darkMode")==1&&document.documentElement.setAttribute("data-bs-theme","dark")}function toggleDarkMode(){localStorage.getItem("darkMode")==1?(localStorage.setItem("darkMode",0),document.documentElement.setAttribute("data-bs-theme","light")):(localStorage.setItem("darkMode",1),document.documentElement.setAttribute("data-bs-theme","dark"))}async function playAudio(e,t){const s=await loadAudio(e,audioBufferCache[e]),n=audioContext.createBufferSource();if(n.buffer=s,t){const e=audioContext.createGain();e.gain.value=t,e.connect(audioContext.destination),n.connect(e),n.start()}else n.connect(audioContext.destination),n.start()}async function loadAudio(e,t){if(audioBufferCache[e])return audioBufferCache[e];const s=await fetch(t),o=await s.arrayBuffer(),n=await audioContext.decodeAudioData(o);return audioBufferCache[e]=n,n}function unlockAudio(){audioContext.resume()}function loadVoices(){const e=new Promise(e=>{let t=speechSynthesis.getVoices();if(t.length!==0)e(t);else{let n=!1;speechSynthesis.addEventListener("voiceschanged",()=>{n=!0,t=speechSynthesis.getVoices(),e(t)}),setTimeout(()=>{n||document.getElementById("noTTS").classList.remove("d-none")},1e3)}});e.then(e=>{japaneseVoices=e.filter(e=>e.lang=="ja-JP")})}loadVoices();function loopVoice(e,t){speechSynthesis.cancel();const n=new globalThis.SpeechSynthesisUtterance(e);n.voice=japaneseVoices[Math.floor(Math.random()*japaneseVoices.length)],n.lang="ja-JP";for(let e=0;e<t;e++)speechSynthesis.speak(n)}function respeak(){loopVoice(answer,3)}function setTegakiPanel(){const e=document.getElementById("tegakiPanel");for(;e.firstChild;)e.removeChild(e.lastChild);pads=[];for(let t=0;t<answer.length;t++){const n=createTegakiBox();e.appendChild(n)}const t=e.children;canvases=[...t].map(e=>e.querySelector("canvas"))}function showPredictResult(e,t){const i=canvases.indexOf(e),s=answer[i];let o=!1;for(let e=0;e<t.length;e++)if(t[e]==s){o=!0;break}o?e.setAttribute("data-predict",s):e.setAttribute("data-predict",t[0]);let n="";for(let e=0;e<canvases.length;e++){const t=canvases[e].getAttribute("data-predict");t?n+=t:n+=" "}return document.getElementById("reply").textContent=n,n}function initSignaturePad(e){const t=new signaturePad(e,{minWidth:2,maxWidth:2,penColor:"black",backgroundColor:"white",throttle:0,minDistance:0});return t.addEventListener("endStroke",()=>{predict(t.canvas)}),t}function getImageData(e){const n=28,s=28;canvasCache.drawImage(e,0,0,n,s);const o=canvasCache.getImageData(0,0,n,s),t=o.data;for(let e=0;e<t.length;e+=4)t[e]=255-t[e],t[e+1]=255-t[e+1],t[e+2]=255-t[e+2];return o}function predict(e){const t=getImageData(e),n=canvases.indexOf(e);worker.postMessage({imageData:t,pos:n})}function getRandomInt(e,t){return e=Math.ceil(e),t=Math.floor(t),Math.floor(Math.random()*(t-e)+e)}function hideAnswer(){const e=document.getElementById("answer");e.classList.add("d-none")}function showAnswer(){const e=document.getElementById("answer");e.classList.remove("d-none"),e.textContent=answer}function nextProblem(){answered=!1;const e=document.getElementById("searchButton");e.disabled=!0,setTimeout(()=>{e.disabled=!1},2e3);const[t,n]=problems[getRandomInt(0,problems.length-1)],s=document.getElementById("cse-search-input-box-id");s.value=n,answer=t,document.getElementById("reply").textContent="",document.getElementById("mode").textContent=="EASY"?showAnswer():hideAnswer(),document.getElementById("wordLength").textContent=answer.length,loopVoice(answer,3)}function initProblems(){const e=document.getElementById("grade").selectedIndex,t=e==0?"hira":"kana";fetch(t+".lst").then(e=>e.text()).then(e=>{problems=[],e.trimEnd().split(`
`).forEach(e=>{const[t,n]=e.split("	");problems.push([t,n])})})}function searchByGoogle(e){e.preventDefault();const t=document.getElementById("cse-search-input-box-id"),n=google.search.cse.element.getElement("searchresults-only0");return nextProblem(),t.value==""?n.clearAllResults():n.execute(t.value),setTegakiPanel(),firstRun&&(document.getElementById("gophers").replaceChildren(),document.getElementById("searchResults").classList.remove("d-none"),firstRun=!1),!1}document.getElementById("cse-search-box-form-id").onsubmit=searchByGoogle;let gameTimer;function startGameTimer(){clearInterval(gameTimer);const e=document.getElementById("time");initTime(),gameTimer=setInterval(()=>{const t=parseInt(e.textContent);t>0?e.textContent=t-1:(clearInterval(gameTimer),playAudio("end"),playPanel.classList.add("d-none"),scorePanel.classList.remove("d-none"),document.getElementById("score").textContent=correctCount)},1e3)}let countdownTimer;function countdown(){clearTimeout(countdownTimer),countPanel.classList.remove("d-none"),infoPanel.classList.add("d-none"),playPanel.classList.add("d-none"),scorePanel.classList.add("d-none");const e=document.getElementById("counter");e.textContent=3,countdownTimer=setInterval(()=>{const t=["skyblue","greenyellow","violet","tomato"];if(parseInt(e.textContent)>1){const n=parseInt(e.textContent)-1;e.style.backgroundColor=t[n],e.textContent=n}else clearTimeout(countdownTimer),countPanel.classList.add("d-none"),infoPanel.classList.remove("d-none"),playPanel.classList.remove("d-none"),correctCount=0,document.getElementById("score").textContent=correctCount,document.getElementById("searchButton").classList.add("animate__heartBeat"),startGameTimer()},1e3)}function initTime(){document.getElementById("time").textContent=gameTime}function changeMode(e){e.target.textContent=="EASY"?e.target.textContent="HARD":e.target.textContent="EASY"}class TegakiBox extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=[globalCSS];const e=document.getElementById("tegaki-box").content.cloneNode(!0),t=e.querySelector("use"),s=t.getAttribute("href").slice(1),o=document.getElementById(s).firstElementChild.cloneNode(!0);t.replaceWith(o),this.shadowRoot.appendChild(e);const i=this.shadowRoot.querySelector("canvas"),n=initSignaturePad(i);this.shadowRoot.querySelector(".eraser").onclick=()=>{n.clear()},pads.push(n),document.documentElement.getAttribute("data-bs-theme")=="dark"&&this.shadowRoot.querySelector("canvas").setAttribute("style","filter: invert(1) hue-rotate(180deg);")}}customElements.define("tegaki-box",TegakiBox);function createTegakiBox(){const e=document.createElement("div"),n=document.getElementById("tegaki-box").content.cloneNode(!0);e.appendChild(n);const s=e.querySelector("canvas"),t=initSignaturePad(s);return e.querySelector(".eraser").onclick=()=>{t.clear()},pads.push(t),e}function kanaToHira(e){return e.replace(/[\u30a1-\u30f6]/g,e=>{const t=e.charCodeAt(0)-96;return String.fromCharCode(t)})}function hiraToKana(e){return e.replace(/[\u3041-\u3096]/g,e=>{const t=e.charCodeAt(0)+96;return String.fromCharCode(t)})}function formatReply(e){if(document.getElementById("grade").selectedIndex==1){if(["へ","べ","ぺ"].includes(e))return hiraToKana(e)}else if(["ヘ","ベ","ペ"].includes(e))return kanaToHira(e);return e}function getGlobalCSS(){let e="";for(const t of document.styleSheets)try{for(const n of t.cssRules)e+=n.cssText}catch{}const t=new CSSStyleSheet;return t.replaceSync(e),t}const globalCSS=getGlobalCSS();canvases.forEach(e=>{const t=initSignaturePad(e);pads.push(t),e.parentNode.querySelector(".eraser").onclick=()=>{t.clear(),showPredictResult(e," ")}});const worker=new Worker("worker.js");worker.addEventListener("message",e=>{if(answered)return;const t=showPredictResult(canvases[e.data.pos],e.data.result);if(answer==formatReply(t)){if(answered=!0,document.getElementById("mode").textContent=="EASY")correctCount+=1;else{const e=document.getElementById("answer"),t=e.classList.contains("d-none");t&&(correctCount+=1)}playAudio("correct",.3),document.getElementById("reply").textContent="⭕ "+answer,document.getElementById("searchButton").classList.add("animate__heartBeat")}}),initProblems(),document.getElementById("mode").onclick=changeMode,document.getElementById("toggleDarkMode").onclick=toggleDarkMode,document.getElementById("respeak").onclick=respeak,document.getElementById("restartButton").onclick=countdown,document.getElementById("startButton").onclick=countdown,document.getElementById("showAnswer").onclick=showAnswer,document.getElementById("grade").onchange=initProblems,document.getElementById("searchButton").addEventListener("animationend",e=>{e.target.classList.remove("animate__heartBeat")}),document.addEventListener("click",unlockAudio,{once:!0,useCapture:!0})