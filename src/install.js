import {useEffect,useState} from 'react';

// Home-screen install support. Android/desktop Chrome fire beforeinstallprompt (captured at
// load so the app can show its own button); iPhone Safari has no prompt, so the UI explains
// Share → Add to Home Screen instead.
let deferred=null;
const listeners=new Set();
const notify=()=>listeners.forEach(f=>f());
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;notify()});
addEventListener('appinstalled',()=>{deferred=null;notify()});

export const isStandalone=()=>matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches||navigator.standalone===true;
export const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);

export function useInstall(){
 const [,rerender]=useState(0);
 useEffect(()=>{const f=()=>rerender(n=>n+1);listeners.add(f);return()=>listeners.delete(f)},[]);
 return {canPrompt:!!deferred,async prompt(){if(!deferred)return;deferred.prompt();await deferred.userChoice;deferred=null;notify()}};
}
