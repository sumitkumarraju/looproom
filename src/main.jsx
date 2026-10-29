import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import '@fontsource/silkscreen/400.css';
import './style.css';
import {startPerformanceGuard} from './perf';

startPerformanceGuard();
createRoot(document.getElementById('root')).render(<App/>);

// "Tap to enter" on the intro: start the music (the tap is the gesture browsers require for
// sound), then zoom the icon and fade the splash away to reveal the app.
const splash=document.getElementById('splash');
if(splash){
 const button=document.getElementById('splash-enter');
 button.addEventListener('click',()=>{
  dispatchEvent(new Event('looproom:enter'));
  splash.classList.add('is-leaving');setTimeout(()=>splash.remove(),700);
 },{once:true});
 button.focus({preventScroll:true});
}

// Offline app shell for the installed (home screen) app; production only so dev stays uncached.
if(import.meta.env.PROD&&'serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
