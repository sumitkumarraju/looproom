import {useEffect} from 'react';
import {setTabIcon} from './icon';

const root=document.documentElement.style;
// The accent also tints the phone's browser bar / installed app status bar.
function setAccent(color){root.setProperty('--accent',color);document.querySelector('meta[name="theme-color"]')?.setAttribute('content',color)}

// Samples the cover art and publishes album colors as CSS variables. Tracks with a designed
// palette (the demo catalog) keep its accent; others (Spotify, open music) derive the accent,
// which drives the background, from the cover. Until such a cover loads the previous colors stay.
// The browser-tab icon is redrawn in the same colours.
export function useAlbumColors(cover,palette){
 useEffect(()=>{
  if(palette){root.setProperty('--desktop',palette[0]);root.setProperty('--album',palette[1]);setAccent(palette[2]);root.setProperty('--album-vivid',palette[1]);setTabIcon(palette[2],palette[1])}
  if(!cover)return;
  let cancelled=false;
  const img=new Image();img.crossOrigin='anonymous';
  img.onload=()=>{
   if(cancelled)return;
   try{
    const canvas=document.createElement('canvas');canvas.width=canvas.height=16;
    const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,16,16);
    const data=ctx.getImageData(0,0,16,16).data;
    let sums=[0,0,0],count=0;
    for(let i=0;i<data.length;i+=4){if(data[i+3]<128)continue;sums[0]+=data[i];sums[1]+=data[i+1];sums[2]+=data[i+2];count++}
    if(!count)return;
    const rgb=sums.map(x=>Math.round(x/count));
    let vivid=rgb,best=0;
    for(let i=0;i<data.length;i+=4){const c=[data[i],data[i+1],data[i+2]],spread=Math.max(...c)-Math.min(...c),light=(Math.max(...c)+Math.min(...c))/2;if(data[i+3]>128&&light>65&&light<220&&spread>best){vivid=c;best=spread}}
    root.setProperty('--album-vivid',`rgb(${vivid})`);
    root.setProperty('--desktop',`rgb(${rgb.map(x=>Math.round(x*.35+245*.65))})`);
    root.setProperty('--album',`rgb(${rgb})`);
    const accent=palette?palette[2]:`rgb(${vivid.map((v,i)=>Math.round(v*.42+rgb[i]*.18))})`;
    if(!palette)setAccent(accent);
    setTabIcon(accent,`rgb(${vivid})`);
   }catch{/* Cross-origin covers without CORS keep the previous colors. */}
  };
  img.src=cover;
  return()=>{cancelled=true};
 },[cover]);
}
