import {memo,useEffect,useRef} from 'react';

// Aceternity's background-gradient-animation, recoloured from the album palette
// (CSS variables) and roughened with grain + scanlines for a retro finish.
export default memo(function RetroGradient({enabled}){
 const pointer=useRef(null);
 useEffect(()=>{
  if(!enabled||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let x=innerWidth/2,y=innerHeight/2,tx=x,ty=y,frame=0;
  // The follow loop only runs while the glow is catching up with the pointer.
  const tick=()=>{x+=(tx-x)/20;y+=(ty-y)/20;pointer.current.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;frame=Math.abs(tx-x)+Math.abs(ty-y)>.5?requestAnimationFrame(tick):0};
  const move=e=>{tx=e.clientX;ty=e.clientY;if(!frame)frame=requestAnimationFrame(tick)};
  addEventListener('pointermove',move,{passive:true});frame=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(frame);removeEventListener('pointermove',move)};
 },[enabled]);
 return <div className={'retro-gradient '+(enabled?'':'is-paused')} aria-hidden="true">
  <div className="gradient-blobs"><i className="blob b1"/><i className="blob b2"/><i className="blob b3"/><i className="blob b4"/><i className="blob b5"/><i ref={pointer} className="blob pointer"/></div>
  <div className="retro-grain"/><div className="retro-scanlines"/>
 </div>
});
