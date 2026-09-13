import type { RuntimeRule } from "../validation/types";
import type { Compiled } from "../typed-engine";
import { PREVIEW_SOURCE_URL } from "./source-location";
import runtime from "./runtime.generated.js?raw";
import terminalControls from "../terminal-controls.css?inline";
import previewStyles from "./preview.css?inline";
import { DEFAULT_SCREEN_FONT_SIZE, isScreenFontSize } from "../screen-font";
import { previewThemes, type PreviewTheme } from "./themes";
const css = terminalControls + previewStyles;

export function browserDocument(
  compiled: Compiled,
  token: string,
  rules: RuntimeRule[],
  reduced: boolean,
  fontSize = DEFAULT_SCREEN_FONT_SIZE,
  previewTheme?: PreviewTheme,
) {
  const theme = previewTheme ? previewThemes[previewTheme] : undefined;
  const screenFontSize = isScreenFontSize(fontSize)
    ? fontSize
    : DEFAULT_SCREEN_FONT_SIZE;
  const safe = (code: string) => code.replace(/<\/script/gi, "<\\/script");
  const prefix =
    "try {window.React=window.__REACT;const exports={};const module={exports};const require=name=>{if(name==='react')return window.__REACT;throw Error('Only React is available.');};\n";
  const program = `${prefix}${compiled.code}\nwindow.__mount(exports[${JSON.stringify(compiled.entry)}]);}catch(e){window.__reportError(e);}\n//# sourceURL=${PREVIEW_SOURCE_URL}\n`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'"><style>${css}${theme?.css ?? ""}${reduced ? "*{transition:none!important;transform:none!important}" : ""}</style></head><body class="machine-screen" style="--screen-font-size:${screenFontSize}px"><div id="app" class="${theme?.className ?? ""}"></div><div id="browser-console" role="status"></div><script>window.__TOKEN=${JSON.stringify(token)};window.__RULES=${safe(JSON.stringify(rules))};window.__SOURCES=${safe(JSON.stringify(compiled.sources ?? []))};window.__SCRIPT_OFFSET=${prefix.split("\n").length - 1};${safe(runtime)}</script><script>${safe(program)}</script></body></html>`;
}
