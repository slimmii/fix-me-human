import { compileCode } from './typed-engine';
self.onmessage=e=>{try{self.postMessage({id:e.data.id,result:compileCode(e.data.source,e.data.exercise)});}catch(error){self.postMessage({id:e.data.id,result:{code:'',errors:[String(error)],checks:[],entry:'default'}});}};
