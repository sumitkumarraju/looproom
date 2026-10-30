import {useSyncExternalStore} from 'react';
import {getName,setName} from '../station';

const subscribe=cb=>{addEventListener('looproom:name',cb);return()=>removeEventListener('looproom:name',cb)};

// "XYZ's station" in the top centre; tap it to rename.
export default function StationName(){
 const name=useSyncExternalStore(subscribe,getName);
 if(!name)return null;
 return <button className="station-name" title="Change name" onClick={()=>{const v=prompt('Your name',name);if(v!==null&&v.trim())setName(v)}}>{name}'s station</button>;
}
