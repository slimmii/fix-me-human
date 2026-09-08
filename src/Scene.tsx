import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { RoundedBox, Html, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { CRT, DISPLAY } from './monitor';
const mint='#91bfa5',cream='#e8d9ac',dark='#203f37';
type Props={focused:boolean;reduced:boolean;onComputer:()=>void;onProp:(s:string)=>void;celebrate:boolean;mood:'neutral'|'happy'|'confused';computer:ReactNode};
function Box({p,s,c,r=.05,...props}:{p:[number,number,number];s:[number,number,number];c:string;r?:number;onClick?:(e:ThreeEvent<MouseEvent>)=>void}) {return <RoundedBox position={p} args={s} radius={r} smoothness={2} {...props} castShadow receiveShadow><meshStandardMaterial color={c} roughness={.7}/></RoundedBox>;}
function Prop({children,onClick,reduced,position=[0,0,0]}:{children:ReactNode;onClick:()=>void;reduced:boolean;position?:[number,number,number]}){const group=useRef<THREE.Group>(null),remaining=useRef(0);useFrame((_,dt)=>{remaining.current=Math.max(0,remaining.current-dt);if(group.current)group.current.rotation.z=reduced?0:Math.sin(remaining.current*22)*remaining.current*.12;});return <group ref={group} position={position} onClick={e=>{e.stopPropagation();remaining.current=.7;onClick();}}>{children}</group>;}
function Confetti(){const group=useRef<THREE.Group>(null);useFrame((_,dt)=>{group.current?.children.forEach((c,i)=>{c.position.y-=dt*(.3+(i%4)*.15);c.rotation.z+=dt;if(c.position.y<1.3)c.position.y=5;});});return <group ref={group}>{Array.from({length:45},(_,i)=><mesh key={i} position={[Math.sin(i*12)*3,1.8+(i%9)*.35,Math.cos(i)*1.4]} rotation={[i,i*2,i]}><boxGeometry args={[.06,.13,.02]}/><meshStandardMaterial color={['#f1b650','#f37757','#81d7bd'][i%3]}/></mesh>)}</group>;}
function Robot({reduced,onProp,celebrate,mood}:Pick<Props,'reduced'|'onProp'|'celebrate'|'mood'>){const body=useRef<THREE.Group>(null);const [excited,setExcited]=useState(0);useFrame(({clock})=>{if(body.current&&!reduced){body.current.position.y=2.9+Math.sin(clock.elapsedTime*1.6)*.1;body.current.rotation.z=Math.sin(clock.elapsedTime)*.04+(excited>performance.now()/1000?.12:0);}});return <group ref={body} position={[2.1,2.9,-.3]} onClick={e=>{e.stopPropagation();setExcited(performance.now()/1000+2);onProp('B.U.G.: I generated 400 bugs today. You’re welcome for the job security.');}}>
<Box p={[0,0,0]} s={[1.2,.88,.7]} c='#edb84f' r={.17}/><Box p={[0,0,.38]} s={[1.04,.66,.08]} c={dark} r={.13}/>
{[-.24,.24].map(x=><mesh key={x} position={[x,.08,.44]}><boxGeometry args={[.13,celebrate||mood==='happy'?.05:mood==='confused'&&x<0?.08:.19,.02]}/><meshBasicMaterial color='#c5ffb4'/></mesh>)}
<Box p={[0,-.19,.44]} s={[.3,.045,.025]} c='#c5ffb4' r={.01}/><Box p={[0,.59,0]} s={[.04,.4,.04]} c={dark} r={.01}/><mesh position={[0,.82,0]}><sphereGeometry args={[.09,12,12]}/><meshStandardMaterial color='#ec6d4c'/></mesh>
{[-1,1].map(x=><group key={x}><Box p={[x*.75,-.05,0]} s={[.22,.42,.28]} c={cream}/><Box p={[x*.9,-.28,.06]} s={[.3,.18,.28]} c='#edb84f'/></group>)}
<mesh position={[0,-.55,0]} rotation={[Math.PI,0,0]}><coneGeometry args={[.25,.3,8]}/><meshStandardMaterial color='#6cc7c1' emissive='#329b94' emissiveIntensity={.5}/></mesh><Html zIndexRange={[5,0]} style={{pointerEvents:'none'}} position={[0,1.02,0]} center distanceFactor={7}><span className="robot-tag">B.U.G. / SUPERVISOR</span></Html></group>}
// Match texture and plane aspect ratios so printed lettering is never stretched.
function printTexture(canvas:HTMLCanvasElement){
 const texture=new THREE.CanvasTexture(canvas);
 texture.colorSpace=THREE.SRGBColorSpace;
 texture.anisotropy=8;
 return texture;
}
function MotivationalPoster({onClick}:{onClick:()=>void}){
 const texture=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=1024;
  const ctx=canvas.getContext('2d')!;
  ctx.fillStyle='#a77a51';ctx.fillRect(0,0,768,1024);
  ctx.fillStyle='#f5e6b4';ctx.fillRect(14,14,740,996);
  ctx.strokeStyle='#c9b987';ctx.lineWidth=2;ctx.strokeRect(36,36,696,952);
  ctx.fillStyle='#345242';ctx.textAlign='center';
  ctx.font='bold 36px sans-serif';ctx.fillText('HUMAN RESOURCES',384,94);
  ctx.fillRect(84,126,600,3);
  ctx.font='bold 142px sans-serif';ctx.fillText('HANG',384,274);
  ctx.font='bold 124px sans-serif';ctx.fillText('IN THERE.',384,406);
  // A cheerful office flower, printed in the same warm ink as the props.
  ctx.strokeStyle='#557962';ctx.lineWidth=14;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(384,626);ctx.quadraticCurveTo(370,706,405,748);ctx.stroke();
  ctx.fillStyle='#557962';ctx.beginPath();ctx.ellipse(423,697,39,16,-.55,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#e7834a';
  for(let i=0;i<8;i++){const angle=i*Math.PI/4;ctx.beginPath();ctx.ellipse(384+Math.cos(angle)*78,566+Math.sin(angle)*78,51,28,angle,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#edb84f';ctx.beginPath();ctx.arc(384,566,44,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#345242';ctx.beginPath();ctx.arc(371,559,4,0,Math.PI*2);ctx.arc(397,559,4,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#345242';ctx.lineWidth=4;ctx.beginPath();ctx.arc(384,566,15,.2,Math.PI-.2);ctx.stroke();
  ctx.fillStyle='#203f37';ctx.font='bold 43px sans-serif';
  ctx.fillText('YOU ARE NOT',384,822);
  ctx.fillText('REPLACEABLE.*',384,876);
  ctx.font='bold italic 37px sans-serif';ctx.fillText('*yet.',384,943);
  return printTexture(canvas);
 },[]);
 useEffect(()=>()=>texture.dispose(),[texture]);
 return <mesh position={[-2.05,3,-1.83]} onClick={e=>{e.stopPropagation();onClick();}}><planeGeometry args={[.78,1.04]}/><meshBasicMaterial map={texture} toneMapped={false}/></mesh>;
}
function BugCounterSign(){
 const texture=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;
  const ctx=canvas.getContext('2d')!;
  ctx.fillStyle='#345242';ctx.fillRect(0,0,1024,256);
  ctx.fillStyle='#e7ead5';ctx.fillRect(10,10,1004,236);
  ctx.strokeStyle='#9eaf91';ctx.lineWidth=2;ctx.strokeRect(22,22,980,212);
  ctx.fillStyle='#345242';ctx.textBaseline='middle';
  ctx.font='bold 76px sans-serif';ctx.fillText('DAYS WITHOUT',48,91);
  ctx.fillText('A BUG',48,181);
  ctx.fillStyle='#345242';ctx.fillRect(764,35,210,186);
  ctx.fillStyle='#f5f0d3';ctx.fillRect(770,41,198,174);
  ctx.fillStyle='#345242';ctx.font='bold 140px monospace';ctx.textAlign='center';ctx.fillText('0',869,135);
  return printTexture(canvas);
 },[]);
 useEffect(()=>()=>texture.dispose(),[texture]);
 return <mesh position={[.2,3.45,-1.8]}><planeGeometry args={[1.72,.43]}/><meshBasicMaterial map={texture} toneMapped={false}/></mesh>;
}
function MonitorDisplay({focused,computer,onComputer}:Pick<Props,'focused'|'computer'|'onComputer'>){
 const glass=useMemo(()=>{const w=CRT.width/2,h=CRT.height/2,r=CRT.radius;const shape=new THREE.Shape();shape.moveTo(-w+r,-h);shape.lineTo(w-r,-h);shape.quadraticCurveTo(w,-h,w,-h+r);shape.lineTo(w,h-r);shape.quadraticCurveTo(w,h,w-r,h);shape.lineTo(-w+r,h);shape.quadraticCurveTo(-w,h,-w,h-r);shape.lineTo(-w,-h+r);shape.quadraticCurveTo(-w,-h,-w+r,-h);return shape;},[]);
 const size={'--display-width':`${DISPLAY.width}px`,'--display-height':`${DISPLAY.height}px`,'--display-radius':`${DISPLAY.radius}px`} as CSSProperties;
 return <group position={[0,CRT.centerY,CRT.surfaceZ]}>
  <mesh position={[0,0,-.001]}><shapeGeometry args={[glass,24]}/><meshBasicMaterial color="#101f19"/></mesh>
  <Html transform distanceFactor={DISPLAY.distanceFactor} zIndexRange={[20,10]}>
   <div className="crt-display" data-surface="crt-glass" style={size} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();if(!focused)onComputer();}}>
    <div className="crt-contents" inert={!focused}>{computer}</div>
    <div className="crt-glass-finish" aria-hidden="true"/>
   </div>
  </Html>
 </group>;
}
function World(props:Props&{posterFocused:boolean;onPoster:()=>void;onDesk:()=>void;posterClick:React.MutableRefObject<((pointer:THREE.Vector2,event:{stopPropagation:()=>void})=>void)|null>}){const {focused,reduced,onComputer,onProp,celebrate}=props;const fan=useRef<THREE.Group>(null);const mug=useRef<THREE.Group>(null);const paper=useRef<THREE.Mesh>(null);const [pulse,setPulse]=useState(0);const [fanOn,setFanOn]=useState(true);const drag=useRef({down:false,x:0,y:0,yaw:0,pitch:0});
useFrame(({camera,clock,size},dt)=>{props.posterClick.current=(pointer,event)=>{const ray=new THREE.Raycaster();ray.setFromCamera(pointer,camera);const hit=ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,0,1),1.83),new THREE.Vector3());if(!hit||Math.abs(hit.x+2.05)>.39||Math.abs(hit.y-3)>.52){event.stopPropagation();props.onDesk();}};// Keep the seated viewing direction fixed throughout zooms. Changing the
// look-at point while translating caused the scene to sweep around the player.
const deskPosition=new THREE.Vector3(drag.current.yaw,3.45+drag.current.pitch,6.8);
const direction=new THREE.Vector3(0,1.9,-.45).sub(deskPosition).normalize();
const target=deskPosition.clone();
if(props.posterFocused||focused){
 const width=props.posterFocused?.78:CRT.width;
 const height=props.posterFocused?1.04:CRT.height;
 const distance=Math.max(height/(2*Math.tan(Math.PI*44/360)*.72),width/(2*Math.tan(Math.PI*44/360)*(size.width/size.height)*.8));
 const center=props.posterFocused?new THREE.Vector3(-2.05,3,-1.83):new THREE.Vector3(0,CRT.centerY,CRT.surfaceZ);
 target.copy(center).addScaledVector(direction,-distance);
}
camera.position.lerp(target,reduced?1:1-Math.exp(-dt*6));
if(camera.position.distanceTo(target)<.01)camera.position.copy(target);
camera.lookAt(camera.position.clone().add(direction));
if(fan.current&&!reduced&&fanOn)fan.current.rotation.z+=dt*10;if(mug.current)mug.current.rotation.z=reduced?0:Math.sin(clock.elapsedTime*14)*Math.max(0,pulse-performance.now()/1000)*.1;if(paper.current)paper.current.position.y=THREE.MathUtils.lerp(paper.current.position.y,.15+(celebrate?.45:0),reduced?1:Math.min(1,dt*3));});
return <group onPointerDown={e=>{drag.current.down=true;drag.current.x=e.clientX;drag.current.y=e.clientY;}} onPointerUp={()=>drag.current.down=false} onPointerLeave={()=>drag.current.down=false} onPointerMove={e=>{if(drag.current.down&&!focused&&!props.posterFocused){drag.current.yaw=THREE.MathUtils.clamp(drag.current.yaw+(drag.current.x-e.clientX)*.008,-1.1,1.1);drag.current.pitch=THREE.MathUtils.clamp(drag.current.pitch+(e.clientY-drag.current.y)*.005,-.3,.5);drag.current.x=e.clientX;drag.current.y=e.clientY;}}}>
<color attach="background" args={['#a4c7b4']}/><fog attach="fog" args={['#a4c7b4',10,23]}/><ambientLight intensity={1.5}/><directionalLight position={[-3,8,6]} intensity={2.5} castShadow shadow-mapSize={[1024,1024]}/><pointLight position={[0,2.6,1]} color='#b8ff9b' intensity={2}/>
<Box p={[0,-.1,0]} s={[18,.2,18]} c='#779888'/><Box p={[0,2,-2]} s={[8,4,.2]} c={mint}/><Box p={[-4,2,0]} s={[.2,4,4]} c='#79a38c'/><Box p={[4,2,0]} s={[.2,4,4]} c='#79a38c'/>
{[-3.9,0,3.9].map(x=><Box key={x} p={[x,2,-1.84]} s={[.05,4,.07]} c='#527e68' r={.01}/>)}<Box p={[0,4,-2]} s={[8.1,.14,.35]} c={dark}/>
<Box p={[0,1.26,0]} s={[7.2,.25,3.6]} c='#d39c66'/><Box p={[0,1.39,0]} s={[7.18,.035,3.57]} c='#efca8f' r={.01}/>{[-2.9,2.9].map(x=><Box key={x} p={[x,.55,.4]} s={[.22,1.4,2.3]} c={dark}/>)}
<group onClick={e=>{e.stopPropagation();onComputer();}}><Box p={[0,1.59,-.55]} s={[1.3,.38,.95]} c={cream}/><Box p={[0,2.28,-.62]} s={[2.45,1.7,1.35]} c={cream} r={.19}/><Box p={[0,2.35,.085]} s={[2.13,1.3,.1]} c='#ae9f77' r={.13}/><Box p={[0,2.35,.15]} s={[1.94,1.12,.07]} c='#163c31' r={.1}/><MonitorDisplay focused={focused} computer={props.computer} onComputer={onComputer}/><Box p={[.85,1.6,.105]} s={[.09,.05,.03]} c='#96ed88' r={.01}/></group>
<group rotation={[-.08,0,0]}><Box p={[0,1.52,1.02]} s={[2.45,.17,.82]} c={cream}/>{Array.from({length:4},(_,row)=>Array.from({length:12},(_,col)=><Box key={`${row}-${col}`} p={[-1.07+col*.19,1.635,.72+row*.17]} s={[.155,.07,.13]} c={col===11?'#db8157':'#f5e9c8'} r={.017} onClick={()=>onProp('Keyboard: CLACK. A highly productive noise.')}/>))}</group>
<Box p={[1.78,1.49,1]} s={[.68,.04,.8]} c='#447b68'/><Box p={[1.8,1.59,1.04]} s={[.3,.2,.43]} c={cream} r={.12}/>
<group ref={mug} position={[-1.9,1.7,.65]} onClick={e=>{e.stopPropagation();setPulse(performance.now()/1000+1);onProp('Coffee: 98% caffeine. 2% unresolved promises.');}}><mesh castShadow><cylinderGeometry args={[.26,.23,.55,24]}/><meshStandardMaterial color='#f7eee0'/></mesh><mesh position={[0,.282,0]}><cylinderGeometry args={[.215,.215,.015,24]}/><meshStandardMaterial color='#56392b'/></mesh><mesh position={[.28,0,0]}><torusGeometry args={[.17,.055,8,16]}/><meshStandardMaterial color='#f7eee0'/></mesh><Html zIndexRange={[5,0]} style={{pointerEvents:'none'}} position={[0,0,.25]} transform distanceFactor={1.8}><b className="mug-label">I ♥<br/>BUGS</b></Html></group>
<group position={[-2.75,1.65,-.9]} onClick={e=>{e.stopPropagation();setFanOn(!fanOn);onProp(fanOn?'Fan: cooling budget has been suspended.':'Fan: spinning up another sprint.');}}><Box p={[0,-.13,0]} s={[.65,.12,.5]} c='#ed9f68'/><Box p={[0,.24,0]} s={[.12,.65,.12]} c={cream}/><mesh position={[0,.65,0]}><torusGeometry args={[.43,.035,8,32]}/><meshStandardMaterial color={dark}/></mesh><group ref={fan} position={[0,.65,.01]}>{[0,1,2].map(i=><group key={i} rotation={[0,0,i*Math.PI*2/3]}><Box p={[0,.2,0]} s={[.2,.34,.06]} c='#ed9f68' r={.08}/></group>)}</group><mesh position={[0,.65,.08]}><sphereGeometry args={[.1,12,12]}/><meshStandardMaterial color={cream}/></mesh></group>
<Prop reduced={reduced} position={[2.7,1.6,.2]} onClick={()=>{onProp(celebrate?'Printer: promotion approved. Salary unchanged.':'Printer: PC LOAD EXISTENTIAL DREAD.');}}><Box p={[0,0,0]} s={[1.05,.45,.82]} c={cream}/><Box p={[0,.25,-.1]} s={[.85,.08,.5]} c='#859f83'/><Box p={[0,-.02,.43]} s={[.8,.08,.03]} c={dark}/><mesh ref={paper} position={[0,.15,.6]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.68,.85]}/><meshStandardMaterial color='#fff6db' side={THREE.DoubleSide}/></mesh></Prop>
<Prop reduced={reduced} onClick={()=>{onProp('Floppy disk: 1.44 MB. Somehow still holds the entire company strategy.');}}><Box p={[-.8,1.48,-1.25]} s={[1,.15,.5]} c={cream}/><Box p={[-.8,1.49,-.99]} s={[.73,.045,.02]} c={dark}/></Prop>
<MotivationalPoster onClick={props.onPoster}/>
<BugCounterSign/><Robot reduced={reduced} onProp={onProp} celebrate={celebrate} mood={props.mood}/>
<ContactShadows frames={1} resolution={256} position={[0,.01,0]} opacity={.3} scale={15} blur={2} far={5}/>
{celebrate&&!reduced&&<Confetti/>}
</group>}
export default function Scene(props:Props){const [posterFocused,setPosterFocused]=useState(false);const posterClick=useRef<((pointer:THREE.Vector2,event:{stopPropagation:()=>void})=>void)|null>(null);useEffect(()=>{if(props.focused)setPosterFocused(false);},[props.focused]);useEffect(()=>{const exit=(e:KeyboardEvent)=>{if(e.key==='Escape')setPosterFocused(false);};window.addEventListener('keydown',exit);return()=>window.removeEventListener('keydown',exit);},[]);const [idle,setIdle]=useState(false);useEffect(()=>{setIdle(false);if(!props.reduced)return;const timer=setTimeout(()=>setIdle(true),900);return()=>clearTimeout(timer);},[props.reduced]);const [webgl]=useState(()=>{try{const c=document.createElement('canvas');return !!(c.getContext('webgl2')||c.getContext('webgl'));}catch{return false;}});return webgl?<Canvas onPointerMissed={()=>setPosterFocused(false)} onClickCapture={e=>{if(!posterFocused)return;const rect=e.currentTarget.getBoundingClientRect();const pointer=new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);posterClick.current?.(pointer,e);}} frameloop={props.reduced&&idle?'demand':'always'} gl={{antialias:false,powerPreference:'high-performance'}} shadows camera={{position:[0,3.45,6.8],fov:44}} dpr={[1,1.25]}><Suspense fallback={null}><World {...props} posterFocused={posterFocused} onPoster={()=>setPosterFocused(true)} onDesk={()=>setPosterFocused(false)} posterClick={posterClick}/></Suspense></Canvas>:<div className="webgl-fallback"><h2>Your browser cannot start WebGL.</h2><p>You can still type React and use the little browser.</p><button onClick={props.onComputer}>Start</button>{props.focused&&<div className="fallback-computer">{props.computer}</div>}</div>}
