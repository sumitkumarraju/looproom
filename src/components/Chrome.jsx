import {Info,X} from '@phosphor-icons/react';

export function Footer({setModal}){
 return <footer className="site-footer">
  <p className="wordmark" aria-hidden="true">looproom</p>
  <p className="footer-pitch"><span className="hl">press play</span> and let the afternoon take the long way home — <span className="w">made for listening, not scrolling.</span></p>
  <div className="footer-links"><div><button onClick={()=>setModal('about')}>about</button><button onClick={()=>setModal('spotify')}>spotify setup</button><span>space · play / pause</span></div><a href="#top">back to top</a></div>
 </footer>
}
export function Toast({message,onDismiss}){
 return message&&<div className="toast" role="status"><Info size={18}/><span>{message}</span><button aria-label="Dismiss message" onClick={onDismiss}><X size={16}/></button></div>
}
