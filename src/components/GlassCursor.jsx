import {useEffect,useRef,useState} from 'react';
import {LiquidGlass} from '@/components/ui/liquid-glass';

// Pointer-following liquid glass lens that refracts the page beneath it.
// Only on fine pointers without reduced motion; the native cursor is untouched otherwise.
export default function GlassCursor(){
 const outer=useRef(null),dot=useRef(null);
 const [enabled,setEnabled]=useState(false);
 useEffect(()=>{setEnabled(matchMedia('(pointer: fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches)},[]);
 useEffect(()=>{
  if(!enabled)return;
  const root=document.documentElement;root.classList.add('glass-cursor-on');
  let x=0,y=0,tx=0,ty=0,seen=false,frame=0;
  function show(on){outer.current.style.opacity=dot.current.style.opacity=on?'1':'0'}
  function move(e){
   tx=e.clientX;ty=e.clientY;
   if(!seen){x=tx;y=ty;seen=true;show(true)}
   dot.current.style.transform=`translate(${tx}px,${ty}px)`;
   outer.current.classList.toggle('is-hot',!!e.target.closest?.('a,button,input,select,label,[role=tab]'));
  }
  function leave(){seen=false;show(false)}
  const down=()=>outer.current.classList.add('is-down'),up=()=>outer.current.classList.remove('is-down');
  function tick(){frame=requestAnimationFrame(tick);if(!seen)return;x+=(tx-x)*.2;y+=(ty-y)*.2;outer.current.style.transform=`translate(${x}px,${y}px)`}
  addEventListener('pointermove',move);document.addEventListener('pointerleave',leave);addEventListener('pointerdown',down);addEventListener('pointerup',up);
  frame=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(frame);root.classList.remove('glass-cursor-on');removeEventListener('pointermove',move);document.removeEventListener('pointerleave',leave);removeEventListener('pointerdown',down);removeEventListener('pointerup',up)};
 },[enabled]);
 if(!enabled)return null;
 return <><div ref={outer} className="glass-cursor" aria-hidden="true"><LiquidGlass radius={70} scale={48} aberration={14} bevelDepth={30} frost={0.4} tint={0.12} className="glass-lens size-full shadow-[0_12px_40px_rgb(0_0_0/0.25),inset_0_1px_0_rgb(255_255_255/0.5)]"/></div><span ref={dot} className="cursor-dot" aria-hidden="true"/></>
}
