import {useEffect,useRef} from 'react';

// Shows the YouTube player. The iframe never moves in the DOM (moving it would reload the video):
// this fixed box is placed over the player's screen (.yt-slot) every frame while a YouTube song is
// on, following scrolling and dragging. When the screen isn't visible (scrolled away, or another
// tab on phones) it becomes a small floating player, because YouTube requires its player to stay
// visible (at least 200×200) while it plays.
export default function YouTubeStage({host,active}){
 const box=useRef(null);
 useEffect(()=>{box.current.append(host)},[host]);
 useEffect(()=>{
  const el=box.current;
  if(!active){el.classList.remove('is-on');return}
  el.classList.add('is-on');
  let frame=0,last='';
  const place=()=>{
   frame=requestAnimationFrame(place);
   const r=document.querySelector('.yt-slot')?.getBoundingClientRect();
   const visible=r&&r.width>=200&&r.bottom>60&&r.top<innerHeight-60;
   const key=visible?`${r.left.toFixed(1)},${r.top.toFixed(1)},${r.width|0},${r.height|0}`:'float';
   if(key===last)return;last=key;
   el.classList.toggle('is-floating',!visible);
   el.style.transform=visible?`translate3d(${r.left}px,${r.top}px,0)`:'';
   el.style.width=visible?`${r.width}px`:'';el.style.height=visible?`${r.height}px`:'';
  };
  place();
  return()=>cancelAnimationFrame(frame);
 },[active]);
 return <div ref={box} className="yt-stage" aria-label="YouTube player"/>;
}
