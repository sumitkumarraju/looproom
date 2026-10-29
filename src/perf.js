// Lite mode for slower hardware. It turns on when the device reports few CPU cores or little
// memory, or when the page measurably drops frames after it starts; the result is remembered.
// It keeps every feature but removes costly extras (see .lite in style.css).
const KEY='looproom-lite';

function apply(on){document.documentElement.classList.toggle('lite',on)}

export function startPerformanceGuard(){
 let saved=null;try{saved=localStorage.getItem(KEY)}catch{}
 if(saved){apply(saved==='on');return}
 const weak=(navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=4;
 if(weak){apply(true);return}
 // Sample ~2 s of frames once the page is visible and settled; slower than ~40 fps means lite.
 const sample=()=>{
  const gaps=[];let last=0;
  const tick=now=>{if(last)gaps.push(now-last);last=now;if(gaps.length<120)return requestAnimationFrame(tick);
   gaps.sort((a,b)=>a-b);const median=gaps[gaps.length>>1];
   if(document.visibilityState==='visible'){const on=median>25;apply(on);try{localStorage.setItem(KEY,on?'on':'off')}catch{}}};
  requestAnimationFrame(tick);
 };
 const begin=()=>{if(document.visibilityState==='visible')setTimeout(sample,2500);else document.addEventListener('visibilitychange',begin,{once:true})};
 begin();
}
