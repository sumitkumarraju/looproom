let credentials=null,refreshing=null;
export const redirectUri=()=>location.origin+'/';
const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,'0')).join('');
export async function authorize(clientId){
 if(!/^[a-f0-9]{32}$/i.test(clientId.trim()))throw Error('Enter the 32-character Client ID from your Spotify app.');
 const verifier=random(),state=random();
 const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier));
 const challenge=btoa(String.fromCharCode(...new Uint8Array(hash))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
 sessionStorage.setItem('looproom-oauth',JSON.stringify({verifier,state,clientId:clientId.trim(),redirect:redirectUri()}));
 localStorage.setItem('looproom-client',clientId.trim());
 const params=new URLSearchParams({client_id:clientId.trim(),response_type:'code',redirect_uri:redirectUri(),code_challenge_method:'S256',code_challenge:challenge,state,scope:'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state'});
 location.assign('https://accounts.spotify.com/authorize?'+params);
}
async function exchange(body){const r=await fetch('https://accounts.spotify.com/api/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(body),signal:AbortSignal.timeout(15000)});const data=await r.json();if(!r.ok)throw Error(data.error_description||'Spotify sign-in failed. Please reconnect.');return data}
export async function finishAuth(){
 const params=new URLSearchParams(location.search);if(!params.has('code')&&!params.has('error'))return false;
 const raw=sessionStorage.getItem('looproom-oauth');sessionStorage.removeItem('looproom-oauth');history.replaceState({},'',location.pathname);
 if(params.has('error'))throw Error('Spotify connection was cancelled. You can try again.');
 const saved=raw?JSON.parse(raw):null;
 if(!saved||saved.state!==params.get('state'))throw Error('Sign-in could not be verified. Connect Spotify again.');
 const data=await exchange({grant_type:'authorization_code',code:params.get('code'),redirect_uri:saved.redirect,client_id:saved.clientId,code_verifier:saved.verifier});
 credentials={...data,clientId:saved.clientId,expires:Date.now()+data.expires_in*1000};return true;
}
export async function token(){
 if(!credentials)throw Error('Connect Spotify to continue.');
 if(Date.now()<credentials.expires-60000)return credentials.access_token;
 if(!refreshing)refreshing=exchange({grant_type:'refresh_token',refresh_token:credentials.refresh_token,client_id:credentials.clientId}).then(d=>{credentials={...credentials,...d,expires:Date.now()+d.expires_in*1000};return credentials.access_token}).finally(()=>{refreshing=null});
 return refreshing;
}
export async function api(path,method='GET',body){
 const r=await fetch('https://api.spotify.com/v1'+path,{method,headers:{Authorization:'Bearer '+await token(),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});
 if(!r.ok){let message=await r.json().catch(()=>({}));if(r.status===429)throw Error(`Spotify is busy. Try again in ${r.headers.get('Retry-After')||30} seconds.`);if(r.status===403)throw Error('Spotify denied access. Check Premium, app permissions, and your app’s user allowlist.');throw Error(message.error?.message||`Spotify request failed (${r.status}).`)}
 return r.status===204?null:r.json();
}
export function disconnect(){credentials=null;}
export async function connectPlayer(onState,onError,onReady){
 if(!window.Spotify){await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Spotify player did not load. Check your connection or browser blockers.')),20000);window.onSpotifyWebPlaybackSDKReady=()=>{clearTimeout(timer);resolve()};let script=document.querySelector('#spotify-sdk');if(!script){script=document.createElement('script');script.id='spotify-sdk';script.src='https://sdk.scdn.co/spotify-player.js';script.onerror=()=>{clearTimeout(timer);script.remove();reject(Error('Could not load the Spotify player.'))};document.head.append(script)}})}
 const player=new window.Spotify.Player({name:'Looproom',getOAuthToken:cb=>token().then(cb).catch(onError),volume:.65});
 for(const event of ['initialization_error','authentication_error','account_error','playback_error'])player.addListener(event,({message})=>onError(Error(message)));
 player.addListener('autoplay_failed',()=>onError(Error('Tap play to enable audio in this browser.')));
 player.addListener('player_state_changed',onState);
 player.addListener('ready',({device_id})=>onReady(device_id));
 player.addListener('not_ready',()=>onError(Error('Spotify device disconnected. Reconnect to continue.')));
 await Promise.race([player.connect(),new Promise((_,reject)=>setTimeout(()=>reject(Error('Spotify connection timed out. Try reconnecting.')),20000))]).catch(e=>{player.disconnect();throw e});return player;
}
export function mapTrack(t,mood){return {id:t.id,title:t.name,artist:t.artists.map(a=>a.name).join(', '),album:t.album.name,cover:t.album.images?.[0]?.url,src:null,uri:t.uri,url:t.external_urls?.spotify,seconds:t.duration_ms/1000,genre:'Spotify',moods:[mood],spotify:true}}
