let ctx, master, musicGain, sfxGain, musicTimer, musicOn=false;
const MUTE_KEY='rune-territories.mute';
let mute=false;
// Sample files (art/audio, generated originals). Loaded lazily after the first tap; synth below stays as fallback.
const SAMPLE={dice:'dice',step:'step',summon:'card',salary:'gold-gain',upgrade:'levelup',spell:'spell',hit:'hit',fail:'guard',win:'victory',lose:'defeat',tap:'tap',capture:'capture',toll:'gold-loss'};
const buffers={};let loading=false,bgmBuf=null,bgmSrc=null,bgmGain=null;
function ext(){try{return new Audio().canPlayType('audio/ogg; codecs="vorbis"')?'ogg':'mp3';}catch{return 'mp3';}}
async function fetchBuf(name){const r=await fetch(`./art/audio/${name}.${ext()}`);if(!r.ok)throw new Error(name);const a=await r.arrayBuffer();return await new Promise((ok,no)=>{const p=ctx.decodeAudioData(a,ok,no);if(p&&p.then)p.then(ok,no);});}
async function loadSamples(){if(loading||!ctx)return;loading=true;
  for(const f of new Set(Object.values(SAMPLE))){try{buffers[f]=await fetchBuf(f);}catch{/* keep synth fallback */}}
  try{bgmBuf=await fetchBuf('bgm-loop');if(musicOn&&!mute){stopSynth();startSampleMusic();}}catch{/* synth music stays */}
}
try{mute=localStorage.getItem(MUTE_KEY)==='1';}catch{/* private mode */}

function ensure(){
  if(!ctx){
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC) return null;
    ctx=new AC({latencyHint:'interactive'});
    master=ctx.createGain();
    musicGain=ctx.createGain();
    sfxGain=ctx.createGain();
    musicGain.connect(master); sfxGain.connect(master); master.connect(ctx.destination);
    applyGains();
  }
  if(ctx.state==='suspended') ctx.resume();
  return ctx;
}
function applyGains(){
  if(!master) return;
  const m=mute?0:0.8;
  master.gain.setTargetAtTime(m, ctx.currentTime, 0.02);
  musicGain.gain.setTargetAtTime(mute?0:0.045, ctx.currentTime, 0.03);
  sfxGain.gain.setTargetAtTime(mute?0:0.7, ctx.currentTime, 0.02);
}
export function muted(){return mute;}
export function unlockAudio(){
  if(!ensure()) return;
  loadSamples();
  if(!musicOn && !mute) startMusic();
}
export function toggleMute(){
  mute=!mute;
  try{localStorage.setItem(MUTE_KEY, mute?'1':'0');}catch{/* ignore */}
  if(ensure()){applyGains(); if(!mute) startMusic(); else stopMusic();}
  return mute;
}
function tone(freq, dur, type, gain, when, dest){
  const o=ctx.createOscillator(), g=ctx.createGain();
  o.type=type; o.frequency.setValueAtTime(freq, when);
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(gain, when+0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, when+dur);
  o.connect(g); g.connect(dest); o.start(when); o.stop(when+dur+0.02);
}
function playBuf(b){const src=ctx.createBufferSource(),g=ctx.createGain();src.buffer=b;src.playbackRate.value=1+(Math.random()*0.04-0.02);g.gain.value=0.9;src.connect(g);g.connect(sfxGain);src.start();}
export function sfx(name){
  if(mute || !ensure()) return;
  const b=buffers[SAMPLE[name]];if(b){playBuf(b);return;}
  const t=ctx.currentTime, bus=sfxGain;
  const jitter=1+(Math.random()*0.06-0.03);
  if(name==='dice'){tone(420*jitter,0.08,'triangle',0.2,t,bus);tone(640*jitter,0.09,'square',0.08,t+0.07,bus);}
  else if(name==='step'){tone(210,0.06,'sine',0.1,t,bus);tone(420,0.05,'triangle',0.05,t+0.02,bus);}
  else if(name==='summon'){tone(220,0.16,'sine',0.22,t,bus);tone(440,0.2,'triangle',0.16,t+0.05,bus);tone(660,0.18,'sine',0.08,t+0.1,bus);}
  else if(name==='salary'){tone(523,0.12,'sine',0.16,t,bus);tone(659,0.14,'sine',0.14,t+0.08,bus);tone(784,0.18,'triangle',0.1,t+0.16,bus);}
  else if(name==='upgrade'){tone(300,0.1,'triangle',0.14,t,bus);tone(450,0.14,'triangle',0.12,t+0.08,bus);}
  else if(name==='spell'){tone(700,0.18,'sine',0.12,t,bus);tone(980,0.2,'sine',0.08,t+0.06,bus);}
  else if(name==='hit'){tone(180,0.12,'sawtooth',0.12,t,bus);tone(90,0.2,'sine',0.18,t,bus);}
  else if(name==='fail'){tone(240,0.16,'square',0.08,t,bus);tone(160,0.2,'triangle',0.1,t+0.08,bus);}
  else if(name==='win'){tone(523,0.16,'triangle',0.16,t,bus);tone(659,0.16,'triangle',0.14,t+0.14,bus);tone(784,0.28,'sine',0.14,t+0.28,bus);}
  else if(name==='lose'){tone(392,0.2,'sine',0.12,t,bus);tone(330,0.22,'sine',0.12,t+0.16,bus);tone(262,0.3,'triangle',0.1,t+0.32,bus);}
  else tone(520,0.05,'sine',0.08,t,bus);
}
const SCALE=[261.6,293.7,329.6,392,440,523.3];
function startSampleMusic(){
  if(!bgmBuf||bgmSrc) return;
  bgmGain=ctx.createGain();bgmGain.gain.value=5;  // musicGain is 0.045; x5 gives ~0.22 for the normalised loop
  bgmSrc=ctx.createBufferSource();bgmSrc.buffer=bgmBuf;bgmSrc.loop=true;bgmSrc.connect(bgmGain);bgmGain.connect(musicGain);bgmSrc.start();
}
function stopSynth(){if(musicTimer)clearTimeout(musicTimer);musicTimer=null;}
function startMusic(){
  if(!ctx || musicOn) return;
  musicOn=true;
  if(bgmBuf){startSampleMusic();return;}
  let step=0;
  const tick=()=>{
    if(!musicOn || mute || bgmSrc) return;
    const t=ctx.currentTime;
    tone(SCALE[step%SCALE.length], 0.45, 'sine', 0.9, t, musicGain);
    if(step%2===0) tone(SCALE[0]/2, 0.5, 'triangle', 0.4, t, musicGain);
    step++;
    musicTimer=setTimeout(tick, 720);
  };
  tick();
}
function stopMusic(){musicOn=false; if(musicTimer) clearTimeout(musicTimer); if(bgmSrc){try{bgmSrc.stop();}catch{/* stopped */} bgmSrc=null;}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible' && ctx && ctx.state==='suspended') ctx.resume();});
