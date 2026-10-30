import {useEffect,useRef} from 'react';

// Shows the YouTube player. The iframe never moves in the DOM (moving it would reload the video):
// this fixed box is laid over the player's screen (.yt-slot) every frame while a YouTube song is on,
// following scrolling and dragging. YouTube requires its player to stay visible while it plays, so
// when the screen is out of view (scrolled away, or another tab on phones) the video is paused
// instead of continuing hidden; pressing play brings it back.
export default function YouTubeStage({host,active,onHidden}){
 const box=useRef(null),hidden=useRef(onHidden);
 hidden.current=onHidden;
 useEffect(()=>{box.current.append(host)},[host]);
 useEffect(()=>{
  const el=box.current;
  if(!active){el.classList.remove('is-on');return}
  el.classList.add('is-on');
  let frame=0,last='',unseenSince=0,paused=false;
  const place=now=>{
   frame=requestAnimationFrame(place);
   const r=document.querySelector('.yt-slot')?.getBoundingClientRect();
   const visible=r&&r.width>=200&&r.height>=112&&r.bottom>60&&r.top<innerHeight-60;
   if(visible){unseenSince=0;paused=false}
   else{
    // Brief grace so a re-rendering screen (new song, layout change) doesn't pause the video.
    unseenSince||=now;
    if(!paused&&now-unseenSince>500){paused=true;hidden.current?.()}
   }
   const key=visible?`${r.left.toFixed(1)},${r.top.toFixed(1)},${r.width|0},${r.height|0}`:'hidden';
   if(key===last)return;last=key;
   el.classList.toggle('is-hidden',!visible);
   el.style.transform=visible?`translate3d(${r.left}px,${r.top}px,0)`:'';
   el.style.width=visible?`${r.width}px`:'';el.style.height=visible?`${r.height}px`:'';
  };
  frame=requestAnimationFrame(place);
  return()=>cancelAnimationFrame(frame);
 },[active]);
 return <div ref={box} className="yt-stage" aria-label="YouTube player"/>;
}
