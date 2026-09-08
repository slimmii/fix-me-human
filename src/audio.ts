let context:AudioContext|undefined;
export function sound(mute:boolean,type:'key'|'talk'|'win'='key') {
 if(mute)return;
 try{context??=new AudioContext();void context.resume();const ctx=context;
 const notes=type==='win'?[440,554,659,880]:type==='talk'?[180,260,150]:[1800];
 notes.forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=type==='key'?'triangle':'square';o.frequency.value=f;o.connect(g);g.connect(ctx.destination);const t=ctx.currentTime+i*.09;g.gain.setValueAtTime(.025,t);g.gain.exponentialRampToValueAtTime(.001,t+.075);o.start(t);o.stop(t+.08);});}catch{/* Audio is optional. */}
}
