import * as React from 'react';
import { createRoot } from 'react-dom/client';
let failed=false;
const notify=(type:string,detail='')=>{if(type==='error')failed=true;parent.postMessage({channel:'human-preview',type,detail,token:window.__TOKEN},'*');};
declare global {interface Window{__TOKEN:string;__VARIANT:string;__REACT:typeof React;__mount:(component:React.ComponentType)=>void}}
const allowed=['div','section','h1','h2','p','span','button','input','label','ul','li'];
window.__REACT={...React,createElement:(type:React.ElementType,props:Record<string,unknown>|null,...children:React.ReactNode[])=>{if(typeof type==='string'&&!allowed.includes(type))throw Error(`<${type}> is not in our tiny toolbox.`);if(props&&['dangerouslySetInnerHTML','src','srcDoc','href','action','formAction'].some(key=>key in props))throw Error('That attribute is outside the little browser toolbox.');return React.createElement(type,props,...children);}} as typeof React;
window.addEventListener('keydown',e=>{if(e.key==='F6'||e.key==='Escape'){e.preventDefault();notify('editor');}});
window.addEventListener('error',e=>notify('error',e.message));
window.addEventListener('unhandledrejection',e=>notify('error',String(e.reason)));
class Boundary extends React.Component<{children:React.ReactNode},{error:string}>{state={error:''};static getDerivedStateFromError(e:Error){return {error:e.message};}componentDidCatch(e:Error){notify('error',e.message);}render(){return this.state.error?<p>Oops. {this.state.error}</p>:this.props.children;}}
const output=(text:string)=>{const box=document.getElementById('browser-console');if(box)box.textContent=text;};
window.alert=(message)=>output('📬 '+String(message));
console.log=(...items:unknown[])=>output('BROWSER SAYS: '+items.map(String).join(' '));
window.__mount=(Component)=>{if(typeof Component!=='function'){notify('error','Export a function component so the browser knows what to display.');return;}
function Host(){const [room,setRoom]=React.useState('Break room'),[orders,setOrders]=React.useState<string[]>([]);const Preview=Component as React.ComponentType<Record<string,unknown>>;return <><Preview name="Human" room={room} onOrder={(text:string)=>setOrders(a=>[...a,text])}/>{window.__VARIANT==='6-1'&&<button onClick={()=>setRoom(r=>r==='Break room'?'Server room':'Break room')}>Change room</button>}{window.__VARIANT==='9-0'&&<p>Parent received: {orders.join(', ')||'No orders yet'}</p>}</>;}
createRoot(document.getElementById('app')!).render(<Boundary><Host/></Boundary>);setTimeout(()=>{if(failed)return;const root=document.getElementById('app')!;const count=(tag:string)=>root.querySelectorAll(tag).length;const expected:Record<string,boolean>={
 '0-0':count('h1')===1&&!!root.querySelector('h1[class]'),'0-1':count('h1')===1&&count('span')===1,
 '1-0':count('li')===1,'1-1':count('li')>=1,'2-0':count('span')===2,'2-1':count('span')===1,
 '3-0':count('h2')===1,'3-1':root.textContent?.includes('HUMAN')||false,'4-0':count('button')===1,'4-1':count('input')===1,
 '5-0':count('input')===1&&count('button')===1,'5-1':count('button')===1,'7-0':count('input')===1&&count('button')===1,
 '8-0':count('button')===1,'8-1':count('button')===2,'9-1':count('p')===2,'10-0':root.textContent?.includes('amber')||false,
 '2-2':count('h1')===1&&count('section')===1,'1-2':count('li')===1,'8-2':count('input')===1&&count('button')===1
 };notify('rendered',JSON.stringify({text:root.innerText,valid:root.children.length>0&&(expected[window.__VARIANT]??true)}));},150);};
