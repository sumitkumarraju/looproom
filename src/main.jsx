import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import '@fontsource/silkscreen/400.css';
import './style.css';

createRoot(document.getElementById('root')).render(<App/>);

// Offline app shell for the installed (home screen) app; production only so dev stays uncached.
if(import.meta.env.PROD&&'serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
