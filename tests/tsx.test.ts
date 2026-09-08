import { expect, it } from 'vitest';
import ts from 'typescript';
import { lessons, finale, generate, sourceFor, type Exercise } from '../src/content';
it('all authored solutions and generated families compile as real TSX',()=>{
 const generated:Exercise[]=[];for(let t=0;t<11;t++)for(let seed=1;seed<5;seed++)generated.push(generate(seed*7919,t,3));
 const all=[...lessons.flatMap(l=>l.exercises),...finale,...generated];
 const files=new Map(all.map((e,i)=>[`${process.cwd()}/src/solution-${i}.tsx`,sourceFor(e,Object.fromEntries(e.slots.map(s=>[s.name,s.answer])))]));
 const options:ts.CompilerOptions={target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,moduleResolution:ts.ModuleResolutionKind.Bundler,jsx:ts.JsxEmit.ReactJSX,strict:true,skipLibCheck:true,noEmit:true};
 const host=ts.createCompilerHost(options),original=host.getSourceFile;
 host.getSourceFile=(file,language,onError,shouldCreate)=>files.has(file)?ts.createSourceFile(file,files.get(file)!,language,true,ts.ScriptKind.TSX):original(file,language,onError,shouldCreate);
 const program=ts.createProgram([...files.keys()],options,host);
 const diagnostics=ts.getPreEmitDiagnostics(program).map(d=>`${d.file?.fileName}: ${ts.flattenDiagnosticMessageText(d.messageText,' ')}`);
 expect(diagnostics).toEqual([]);
});
