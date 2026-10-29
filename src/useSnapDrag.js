import {useEffect} from 'react';

// Lets an element be picked up and moved freely, then springs it back to its place on release.
// Mouse: drag after a few pixels of movement. Touch: press and hold briefly first, so normal
// page scrolling still works. Buttons inside keep working; a drag swallows the click it ends with.
//
// Smoothness: pointer events only record where the finger is; one requestAnimationFrame loop
// writes the transform once per display frame (60/120 Hz). Tilt follows the drag velocity through
// a damped spring, and the release is a real spring simulation stepped by frame time, so motion
// stays the same speed at any frame rate.
const STIFFNESS=260,DAMPING=24,TILT_STIFFNESS=320,TILT_DAMPING=26;

export function useSnapDrag(ref){
 useEffect(()=>{
  const el=ref.current;
  if(!el)return;
  let start=null,dragging=false,held=false,timer=0,frame=0,last=0;
  // Position/velocity of the element and of its tilt; target is where the pointer wants it.
  const pos={x:0,y:0,vx:0,vy:0},tilt={a:0,v:0},target={x:0,y:0};
  let prevTarget={x:0,y:0},pointerVx=0;

  function render(){el.style.transform=`translate3d(${pos.x.toFixed(2)}px,${pos.y.toFixed(2)}px,0) rotate(${tilt.a.toFixed(2)}deg)`}
  function step(now){
   const dt=Math.min(.032,(now-(last||now))/1000)||1/60;last=now;
   if(dragging){
    // Follow the pointer exactly; derive its velocity for the tilt.
    pointerVx+=((target.x-prevTarget.x)/dt-pointerVx)*.25;prevTarget={...target};
    // Smoothed velocity, so the release throw doesn't depend on one uneven frame.
    pos.vx+=((target.x-pos.x)/dt-pos.vx)*.35;pos.vy+=((target.y-pos.y)/dt-pos.vy)*.35;pos.x=target.x;pos.y=target.y;
   }else{
    // Spring back to the origin, carrying the release velocity.
    for(const k of ['x','y']){const v='v'+k;pos[v]+=(-STIFFNESS*pos[k]-DAMPING*pos[v])*dt;pos[k]+=pos[v]*dt}
    pointerVx*=.8;
   }
   const goal=Math.max(-12,Math.min(12,pointerVx/90));
   tilt.v+=(TILT_STIFFNESS*(goal-tilt.a)-TILT_DAMPING*tilt.v)*dt;tilt.a+=tilt.v*dt;
   render();
   const resting=!dragging&&Math.abs(pos.x)+Math.abs(pos.y)<.3&&Math.abs(pos.vx)+Math.abs(pos.vy)<5&&Math.abs(tilt.a)<.05;
   if(resting){pos.x=pos.y=pos.vx=pos.vy=tilt.a=tilt.v=0;el.style.transform='';el.classList.remove('is-moving');frame=0;last=0;return}
   frame=requestAnimationFrame(step);
  }
  function wake(){el.classList.add('is-moving');if(!frame){last=0;frame=requestAnimationFrame(step)}}

  function down(e){
   if(e.button>0)return;
   start={x:e.clientX-pos.x,y:e.clientY-pos.y,ox:e.clientX,oy:e.clientY,id:e.pointerId,touch:e.pointerType!=='mouse'};
   held=!start.touch;
   if(start.touch)timer=setTimeout(()=>{held=true;el.classList.add('is-held');navigator.vibrate?.(8)},200);
  }
  function move(e){
   if(!start||e.pointerId!==start.id)return;
   const moved=Math.hypot(e.clientX-start.ox,e.clientY-start.oy);
   if(!dragging){
    if(!held){if(moved>8){clearTimeout(timer);start=null}return}
    if(moved<5)return;
    dragging=true;try{el.setPointerCapture(e.pointerId)}catch{}el.classList.add('is-dragging');
    prevTarget={x:pos.x,y:pos.y};pointerVx=0;
   }
   target.x=e.clientX-start.x;target.y=e.clientY-start.y;
   wake();
  }
  function up(){
   clearTimeout(timer);el.classList.remove('is-held');
   if(dragging){
    // Swallow the click that would fire on whatever button the drag ended over.
    const swallow=e=>{e.stopPropagation();e.preventDefault()};
    addEventListener('click',swallow,true);setTimeout(()=>removeEventListener('click',swallow,true),0);
    el.classList.remove('is-dragging');
    // Cap the throw so a fast flick still comes back gracefully.
    const speed=Math.hypot(pos.vx,pos.vy),cap=2400;
    if(speed>cap){pos.vx*=cap/speed;pos.vy*=cap/speed}
    wake();
   }
   start=null;dragging=false;held=false;
  }
  // While a touch drag is active, stop the page from scrolling underneath it.
  function block(e){if(held||dragging)e.preventDefault()}
  el.addEventListener('pointerdown',down);addEventListener('pointermove',move);addEventListener('pointerup',up);addEventListener('pointercancel',up);
  el.addEventListener('touchmove',block,{passive:false});el.addEventListener('contextmenu',block);
  return()=>{clearTimeout(timer);cancelAnimationFrame(frame);el.removeEventListener('pointerdown',down);removeEventListener('pointermove',move);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);el.removeEventListener('touchmove',block);el.removeEventListener('contextmenu',block)};
 },[ref]);
}
