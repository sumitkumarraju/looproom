// The listener's name, asked once on the intro and kept on this device.
const KEY='looproom-name';
export const clean=v=>String(v||'').replace(/\s+/g,' ').trim().slice(0,24);
export function getName(){try{return clean(localStorage.getItem(KEY))}catch{return ''}}
export function setName(v){const name=clean(v);try{name?localStorage.setItem(KEY,name):localStorage.removeItem(KEY)}catch{}dispatchEvent(new Event('looproom:name'));return name}
