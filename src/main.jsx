import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import '@fontsource/silkscreen/400.css';
import './style.css';

createRoot(document.getElementById('root')).render(<App/>);

// Finish the app-open intro from index.html: let it play (~1.9 s from launch), then zoom the icon
// and fade the splash away to reveal the app underneath.
const splash=document.getElementById('splash');
if(splash){
 const quick=matchMedia('(prefers-reduced-motion: reduce)').matches;
 setTimeout(()=>{splash.classList.add('is-leaving');setTimeout(()=>splash.remove(),700)},Math.max(0,(quick?400:1900)-performance.now()));
}

// Offline app shell for the installed (home screen) app; production only so dev stays uncached.
if(import.meta.env.PROD&&'serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
