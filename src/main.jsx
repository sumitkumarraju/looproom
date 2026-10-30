import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import '@fontsource/silkscreen/400.css';
import './style.css';
import {startPerformanceGuard} from './perf';
import {getName,setName} from './station';

startPerformanceGuard();
createRoot(document.getElementById('root')).render(<App/>);

// iOS ignores user-scalable=no: block pinch (gesture*) and double-tap zoom so the UI stays fixed to the screen.
for(const e of ['gesturestart','gesturechange','gestureend'])document.addEventListener(e,ev=>ev.preventDefault());
let lastTouch=0;
document.addEventListener('touchend',ev=>{const n=Date.now();if(n-lastTouch<300)ev.preventDefault();lastTouch=n},{passive:false});

// "Tap to enter" on the intro: start the music (the tap is the gesture browsers require for
// sound), then zoom the icon and fade the splash away to reveal the app.
const splash=document.getElementById('splash');
if(splash){
 const button=document.getElementById('splash-enter'),nameInput=document.getElementById('splash-name');
 // First visit on this device: ask for a name once; it is remembered and shown as "<name>'s station".
 const askName=!getName();nameInput.hidden=!askName;
 const enter=()=>{
  if(askName){if(!nameInput.value.trim()){nameInput.classList.remove('is-missing');void nameInput.offsetWidth;nameInput.classList.add('is-missing');nameInput.focus();return}setName(nameInput.value)}
  dispatchEvent(new Event('looproom:enter'));
  splash.classList.add('is-leaving');setTimeout(()=>splash.remove(),700);
 };
 button.addEventListener('click',enter);
 nameInput.addEventListener('keydown',e=>{if(e.key==='Enter')enter()});
 (askName?nameInput:button).focus({preventScroll:true});
}

// Offline app shell for the installed (home screen) app; production only so dev stays uncached.
if(import.meta.env.PROD&&'serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
