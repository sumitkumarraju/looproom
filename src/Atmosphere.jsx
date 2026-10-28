import {memo,useEffect,useRef} from 'react';

// One graph per media element: reconnecting an element would break playback.
const graphs=new WeakMap();
export function wakeAudioAnalysis(element){
 if(!element)return;
 try{
  let graph=graphs.get(element);
  if(!graph){
   const AudioContext=window.AudioContext||window.webkitAudioContext;
   if(!AudioContext)return;
   const context=new AudioContext();
   const analyser=context.createAnalyser();
   analyser.fftSize=256;
   analyser.smoothingTimeConstant=.78;
   const source=context.createMediaElementSource(element);
   source.connect(analyser);analyser.connect(context.destination);
   graph={context,analyser};graphs.set(element,graph);
  }
  if(graph.context.state==='suspended')graph.context.resume().catch(()=>{});
 }catch{/* Visual enhancement must never prevent the player from working. */}
}

export default memo(function Atmosphere({audio,playing,spotify,enabled}){
 const root=useRef(null);
 useEffect(()=>{
  const node=root.current;
  const lights=[...node.querySelectorAll('.atmosphere-light')];
  const bars=[...node.querySelectorAll('.atmosphere-bar')];
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const data=new Uint8Array(128),levels=new Float32Array(bars.length);
  let frame=0,last=0,phase=0,energy=0;
  function reset(){
   lights.forEach(light=>{light.style.transform='';light.style.opacity=''});
   bars.forEach(bar=>{bar.style.transform='scaleY(.08)';bar.style.opacity='.12'});
  }
  function draw(now){
   frame=requestAnimationFrame(draw);
   if(now-last<32)return;
   const dt=Math.min((now-last)/1000,.064);last=now;
   const analyser=!spotify?graphs.get(audio.current)?.analyser:null;
   if(analyser)analyser.getByteFrequencyData(data);
   let bass=0;
   if(analyser){for(let i=1;i<10;i++)bass+=data[i]/255;bass/=9;}
   // Spotify movement is intentionally ambient, never presented as beat analysis.
   const target=analyser?bass:0.12;
   energy+=(target-energy)*(target>energy?.3:.09);
   phase+=dt*(.28+energy*.2);
   lights.forEach((light,i)=>{
    const angle=phase+i*2.1;
    const x=Math.sin(angle)*32,y=Math.cos(angle*.73)*24;
    light.style.transform=`translate3d(${x}px,${y}px,0) scale(${1+energy*(.13+i*.025)})`;
    light.style.opacity=String(.5+energy*.22);
   });
   bars.forEach((bar,i)=>{
    const bin=1+Math.floor((i/(bars.length-1))**1.8*72);
    const value=analyser?data[bin]/255:.08;
    levels[i]+=(value-levels[i])*(value>levels[i]?.4:.12);
    bar.style.transform=`scaleY(${.06+levels[i]*.94})`;
    bar.style.opacity=String(.12+levels[i]*.2);
   });
  }
  function sync(){cancelAnimationFrame(frame);reset();if(enabled&&playing&&!preference.matches&&!document.hidden){last=performance.now();frame=requestAnimationFrame(draw)}}
  preference.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);sync();
  return()=>{cancelAnimationFrame(frame);preference.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync)};
 },[audio,playing,spotify,enabled]);
 return <div ref={root} className={'atmosphere '+(!enabled?'atmosphere-off':'')} aria-hidden="true"><div className="atmosphere-light light-peach"/><div className="atmosphere-light light-leaf"/><div className="atmosphere-light light-gold"/><div className="atmosphere-spectrum">{Array.from({length:40},(_,i)=><i className="atmosphere-bar" key={i}/>)}</div></div>;
});
