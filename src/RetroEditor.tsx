import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, drawSelection, highlightActiveLine } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { defaultKeymap, history, historyKeymap, indentWithTab, undo, redo, selectAll } from '@codemirror/commands';
import { openSearchPanel, searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { syntaxHighlighting, HighlightStyle, bracketMatching, indentUnit } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { tags } from '@lezer/highlight';
export type RetroEditorHandle={focus:()=>void;undo:()=>void;redo:()=>void;find:()=>void;selectAll:()=>void};
type Props={initialSource:string;onChange:(source:string)=>void;onRun:()=>void;onHelp:()=>void;onCursor:(line:number,column:number)=>void};
const colors=HighlightStyle.define([
 {tag:[tags.keyword,tags.controlKeyword,tags.operatorKeyword],color:'#ffffff',fontWeight:'bold'},
 {tag:[tags.string,tags.attributeValue],color:'#ffff55'},
 {tag:[tags.tagName,tags.typeName],color:'#55ffff'},
 {tag:[tags.attributeName,tags.propertyName],color:'#aaaaaa'},
 {tag:[tags.number,tags.bool,tags.null],color:'#ff55ff'},
 {tag:tags.comment,color:'#55aaaa'},
 {tag:[tags.punctuation,tags.operator],color:'#ffffff'},
]);
export default forwardRef<RetroEditorHandle,Props>(function RetroEditor(props,ref){
 const host=useRef<HTMLDivElement>(null),view=useRef<EditorView|null>(null),callbacks=useRef(props);callbacks.current=props;
 useImperativeHandle(ref,()=>({focus:()=>view.current?.focus(),undo:()=>{if(view.current)undo(view.current);},redo:()=>{if(view.current)redo(view.current);},find:()=>{if(view.current)openSearchPanel(view.current);},selectAll:()=>{if(view.current){selectAll(view.current);view.current.focus();}}}),[]);
 useEffect(()=>{if(!host.current)return;const editor=new EditorView({parent:host.current,state:EditorState.create({doc:callbacks.current.initialSource,extensions:[
 lineNumbers(),highlightActiveLineGutter(),history(),drawSelection(),highlightActiveLine(),bracketMatching(),closeBrackets(),highlightSelectionMatches(),indentUnit.of('  '),javascript({jsx:true,typescript:true}),syntaxHighlighting(colors),
 EditorView.contentAttributes.of({'aria-label':'Your React code','spellcheck':'false','autocapitalize':'off'}),
 keymap.of([{key:'F5',run:()=>{callbacks.current.onRun();return true;}},{key:'Mod-Enter',run:()=>{callbacks.current.onRun();return true;}},{key:'F1',run:()=>{callbacks.current.onHelp();return true;}},indentWithTab,...closeBracketsKeymap,...defaultKeymap,...historyKeymap,...searchKeymap]),
 EditorView.updateListener.of(update=>{if(update.docChanged)callbacks.current.onChange(update.state.doc.toString());if(update.docChanged||update.selectionSet){const pos=update.state.selection.main.head,line=update.state.doc.lineAt(pos);callbacks.current.onCursor(line.number,pos-line.from+1);}}),
 EditorView.theme({
 '&':{height:'100%',backgroundColor:'#000080',color:'#aaaaaa',fontSize:'17px'},'&.cm-focused':{outline:'none'},
 '.cm-scroller':{fontFamily:'"Courier New", monospace',lineHeight:'1.45',overflow:'auto'},'.cm-content':{padding:'8px 0',caretColor:'#ffff55'},'.cm-line':{padding:'0 12px'},
 '.cm-cursor, .cm-dropCursor':{borderLeft:'9px solid #ffff5599'},'.cm-gutters':{backgroundColor:'#000080',color:'#5555aa',borderRight:'1px solid #5555aa'},'.cm-gutterElement':{padding:'0 9px 0 8px'},'.cm-activeLineGutter':{backgroundColor:'#000080',color:'#ffff55'},'.cm-activeLine':{backgroundColor:'#ffffff08'},
 '.cm-selectionBackground, &.cm-focused .cm-selectionBackground':{backgroundColor:'#5555aa!important'},'.cm-matchingBracket':{backgroundColor:'#00aaaa',color:'#000080'},
 '.cm-panels':{backgroundColor:'#aaaaaa',color:'#000000',fontFamily:'"Courier New", monospace',fontSize:'15px'},'.cm-textfield':{borderRadius:'0',backgroundColor:'#000080',color:'#ffff55',border:'1px solid #ffffff'},'.cm-button':{backgroundImage:'none',backgroundColor:'#aaaaaa',color:'#000000',borderRadius:'0',border:'2px outset #dddddd',fontFamily:'inherit'},'.cm-searchMatch':{backgroundColor:'#aa5500',outline:'1px solid #ffff55'},
 }),
 ]})});view.current=editor;return()=>{editor.destroy();view.current=null;};},[]);
 return <div className="qbasic-editor" ref={host}/>;
});
