import {memo} from 'react';

// For components that don't show playback time: re-render only when some other prop changes.
// Safe because useLooproom's callbacks are stable wrappers that always call the latest version.
const clock=new Set(['time','activeLine']);
export function memoIgnoringClock(Component){
 return memo(Component,(prev,next)=>{
  for(const k in next)if(!clock.has(k)&&prev[k]!==next[k])return false;
  for(const k in prev)if(!(k in next))return false;
  return true;
 });
}
