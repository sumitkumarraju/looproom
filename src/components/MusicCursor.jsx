import {useEffect,useRef,useState} from 'react';

// Music-note cursor: a drawn eighth note that follows the pointer (beamed notes over anything
// clickable), leaving a light trail of notes and the musical alphabet (C D E F G A B) that drift
// up and fade. Everything moves with transform/opacity only: the follow loop runs on
// requestAnimationFrame only while the pointer moves, and trail notes animate on the compositor
// (Web Animations). Fine pointers without reduced motion only; touch keeps the native behaviour.
const glyphs=['♪','♫','♩','♬','C','D','E','F','G','A','B'];
const TRAIL=10;

export default function MusicCursor(){
 const note=useRef(null),dot=useRef(null),trail=useRef(null);
 const [enabled,setEnabled]=useState(false);
 useEffect(()=>{setEnabled(matchMedia('(pointer: fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches)},[]);
 useEffect(()=>{
  if(!enabled)return;
  const root=document.documentElement;root.classList.add('music-cursor-on');
  const pool=[...trail.current.children];
  let x=0,y=0,tx=0,ty=0,tilt=0,seen=false,frame=0,next=0,ex=0,ey=0,lastEmit=0;
  const show=on=>{note.current.style.opacity=dot.current.style.opacity=on?'1':'0'};
  function emit(px,py,burst=false){
   const el=pool[next++%pool.length];
   el.textContent=glyphs[(Math.random()*glyphs.length)|0];
   const dx=(Math.random()-.5)*(burst?70:30),rise=burst?60+Math.random()*30:34+Math.random()*16,spin=(Math.random()-.5)*50;
   el.animate([{transform:`translate3d(${px}px,${py}px,0) scale(${burst?1:.8})`,opacity:.95},{transform:`translate3d(${px+dx}px,${py-rise}px,0) scale(.5) rotate(${spin}deg)`,opacity:0}],{duration:burst?800:900,easing:'cubic-bezier(.22,1,.36,1)'});
  }
  function tick(now){
   x+=(tx-x)*.38;y+=(ty-y)*.38;
   tilt+=(Math.max(-24,Math.min(24,(tx-x)*1.2))-tilt)*.2;
   note.current.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${tilt.toFixed(1)}deg)`;
   if(Math.hypot(tx-ex,ty-ey)>34&&now-lastEmit>70){emit(tx,ty);ex=tx;ey=ty;lastEmit=now}
   frame=Math.abs(tx-x)+Math.abs(ty-y)+Math.abs(tilt)>.4?requestAnimationFrame(tick):0;
  }
  function move(e){
   tx=e.clientX;ty=e.clientY;
   if(!seen){x=ex=tx;y=ey=ty;seen=true;show(true)}
   dot.current.style.transform=`translate3d(${tx}px,${ty}px,0)`;
   note.current.classList.toggle('is-hot',!!e.target.closest?.('a,button,input,select,label,[role=tab]'));
   if(!frame)frame=requestAnimationFrame(tick);
  }
  function leave(){seen=false;show(false)}
  function down(e){note.current.classList.add('is-down');for(let i=0;i<3;i++)emit(e.clientX,e.clientY,true)}
  const up=()=>note.current.classList.remove('is-down');
  addEventListener('pointermove',move,{passive:true});document.addEventListener('pointerleave',leave);addEventListener('pointerdown',down,{passive:true});addEventListener('pointerup',up,{passive:true});
  return()=>{cancelAnimationFrame(frame);root.classList.remove('music-cursor-on');removeEventListener('pointermove',move);document.removeEventListener('pointerleave',leave);removeEventListener('pointerdown',down);removeEventListener('pointerup',up)};
 },[enabled]);
 if(!enabled)return null;
 return <>
  <span ref={trail} className="music-trail" aria-hidden="true">{Array.from({length:TRAIL},(_,i)=><span key={i}/>)}</span>
  <div ref={note} className="music-cursor" aria-hidden="true">
   <svg viewBox="0 0 40 40">
    <g className="note-single"><path d="M19 6v21"/><path className="flag" d="M19 6c3 4 10 5 10 12 0 3-2 5-3 6 1-6-3-8-7-9"/><ellipse cx="13" cy="28" rx="7" ry="5.2" transform="rotate(-22 13 28)"/></g>
    <g className="note-beam"><path d="M13 9l17-4v6L13 15z"/><path d="M13 9v20M30 5v20"/><ellipse cx="8" cy="30" rx="6" ry="4.5" transform="rotate(-22 8 30)"/><ellipse cx="25" cy="26" rx="6" ry="4.5" transform="rotate(-22 25 26)"/></g>
   </svg>
  </div>
  <span ref={dot} className="cursor-dot" aria-hidden="true"/>
 </>
}
