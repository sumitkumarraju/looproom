import {useEffect} from 'react';

// Lets an element be picked up and moved freely, then springs it back to its place on release.
// Mouse: drag after a few pixels of movement. Touch: press and hold briefly first, so normal
// page scrolling still works. Buttons inside keep working; a drag swallows the click it ends with.
export function useSnapDrag(ref){
 useEffect(()=>{
  const el=ref.current;
  if(!el)return;
  let start=null,dragging=false,held=false,timer=0,x=0,y=0;
  const set=(dx,dy,tilt)=>{el.style.transform=`translate3d(${dx}px,${dy}px,0) rotate(${tilt}deg)`};
  function down(e){
   if(e.button>0)return;
   start={x:e.clientX,y:e.clientY,id:e.pointerId,touch:e.pointerType!=='mouse'};
   held=!start.touch;
   if(start.touch)timer=setTimeout(()=>{held=true;el.classList.add('is-held');navigator.vibrate?.(8)},220);
  }
  function move(e){
   if(!start||e.pointerId!==start.id)return;
   const dx=e.clientX-start.x,dy=e.clientY-start.y;
   if(!dragging){
    if(!held){if(Math.hypot(dx,dy)>8){clearTimeout(timer);start=null}return}
    if(Math.hypot(dx,dy)<6)return;
    dragging=true;try{el.setPointerCapture(e.pointerId)}catch{}el.classList.add('is-dragging');el.style.transition='none';
   }
   const tilt=Math.max(-10,Math.min(10,(dx-x)*.6));x=dx;y=dy;
   set(dx,dy,tilt);
  }
  function up(){
   clearTimeout(timer);el.classList.remove('is-held');
   if(dragging){
    // Swallow the click that would fire on whatever button the drag ended over.
    const swallow=e=>{e.stopPropagation();e.preventDefault()};
    addEventListener('click',swallow,true);setTimeout(()=>removeEventListener('click',swallow,true),0);
    el.classList.remove('is-dragging');el.style.transition='transform .75s cubic-bezier(.34,1.56,.64,1)';set(0,0,0);
   }
   start=null;dragging=false;held=false;x=y=0;
  }
  // While a touch drag is active, stop the page from scrolling underneath it.
  function block(e){if(held||dragging)e.preventDefault()}
  el.addEventListener('pointerdown',down);addEventListener('pointermove',move);addEventListener('pointerup',up);addEventListener('pointercancel',up);
  el.addEventListener('touchmove',block,{passive:false});el.addEventListener('contextmenu',block);
  return()=>{clearTimeout(timer);el.removeEventListener('pointerdown',down);removeEventListener('pointermove',move);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);el.removeEventListener('touchmove',block);el.removeEventListener('contextmenu',block)};
 },[ref]);
}
