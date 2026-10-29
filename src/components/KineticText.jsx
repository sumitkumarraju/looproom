// Words rise out of a blur one after another. Remount (change `key`) to replay.
export default function KineticText({text,as:Tag='span',className='',stagger=.06,delay=0}){
 const words=String(text).split(/\s+/);
 return <Tag className={'kinetic '+className}><span className="sr-only">{text}</span><span aria-hidden="true">{words.map((w,i)=><span key={i}>{i>0&&' '}<span className="kinetic-word" style={{animationDelay:`${delay+i*stagger}s`}}>{w}</span></span>)}</span></Tag>
}
