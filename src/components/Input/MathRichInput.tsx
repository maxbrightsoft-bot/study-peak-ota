import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
  Keyboard,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { ScaledSheet } from 'react-native-size-matters'
import HandwritingInput from './HandwritingInput'

const EDITOR_HTML = `<!DOCTYPE html><html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"><\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%;background:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
body{display:flex;flex-direction:column}
#toolbar{display:flex;align-items:center;padding:6px 10px;background:#f8fafc;border-bottom:1px solid #e2e8f0;flex-shrink:0;gap:8px}
#sigmaBtn,#hwBtn{-webkit-appearance:none;appearance:none;width:34px;height:34px;min-width:34px;min-height:34px;padding:0;margin:0;border:1px solid #cbd5e1;border-radius:8px;background:#fff;color:#334155;font-size:18px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;outline:none;-webkit-tap-highlight-color:transparent}
#sigmaBtn:active,#hwBtn:active{background:#e2e8f0;color:#0f172a}
#hwBtn{border-color:#a5b4fc;color:#4f46e5;font-size:16px;}
#editor{flex:1;min-height:100px;padding:10px 12px;outline:none;font-size:16px;line-height:1.6;color:#1e293b;word-break:break-word;-webkit-user-select:text;user-select:text;-webkit-tap-highlight-color:transparent}
.math-chip{display:inline-block;background:#eef2ff;border:1.5px solid #a5b4fc;border-radius:8px;padding:4px 10px;margin:3px 4px;cursor:pointer;-webkit-user-select:none;user-select:none;vertical-align:middle;font-size:16px;line-height:normal}
</style>
</head>
<body>
<div id="toolbar">
  <button id="hwBtn" type="button" onclick="openHandwriting()" title="Viết tay">✍️</button>
</div>
<div id="editor" contenteditable="true" spellcheck="false"></div>
<script>
var editor=document.getElementById('editor');
var chipCounter=0;

var _blurTimer = null;
editor.addEventListener('focus',function(){
  if (_blurTimer) { clearTimeout(_blurTimer); _blurTimer = null; }
  window.ReactNativeWebView.postMessage(JSON.stringify({type:'focus'}));
});
editor.addEventListener('blur',function(){
  if (_blurTimer) clearTimeout(_blurTimer);
  _blurTimer = setTimeout(function(){
    if (document.activeElement !== editor) {
      window.ReactNativeWebView.postMessage(JSON.stringify({type:'blur'}));
    }
  }, 150);
});
function fmt(cmd){document.execCommand(cmd,false,null);updateToolbar();}
function updateToolbar(){
  document.getElementById('btnB').classList.toggle('fmt-btn-active',document.queryCommandState('bold'));
  document.getElementById('btnI').classList.toggle('fmt-btn-active',document.queryCommandState('italic'));
  document.getElementById('btnU').classList.toggle('fmt-btn-active',document.queryCommandState('underline'));
}
function openPicker(){window.ReactNativeWebView.postMessage(JSON.stringify({type:'openPicker'}));}
function openHandwriting(){window.ReactNativeWebView.postMessage(JSON.stringify({type:'openHandwriting'}));}
function notifyChange(){
  var clone = editor.cloneNode(true);
  var chips = clone.querySelectorAll('.math-chip');
  chips.forEach(function(chip){
    var mathEl = chip.querySelector('math');
    if(mathEl){
      chip.parentNode.replaceChild(mathEl, chip);
    } else if(chip.innerHTML && chip.innerHTML.indexOf('<math') !== -1) {
      var tmp = document.createElement('div');
      tmp.innerHTML = chip.innerHTML;
      var m = tmp.querySelector('math');
      if(m) chip.parentNode.replaceChild(m, chip);
    }
  });
  
  var out = clone.innerHTML;
  if(out.trim().length > 0 && !/^<(p|div|h[1-6]|ul|ol|li|blockquote|table)/i.test(out.trim())) {
    out = '<p>' + out + '</p>';
  }
  
  window.ReactNativeWebView.postMessage(JSON.stringify({type:'change',value:out}));
}

// Click on existing chip to edit
document.addEventListener('click', function(e){
  var target = e.target;
  while(target && target !== editor){
    if(target.classList && target.classList.contains('math-chip')){
      var id = target.getAttribute('id');
      var latex = target.getAttribute('data-latex') || target.innerHTML;
      window.ReactNativeWebView.postMessage(JSON.stringify({type:'editChip',id:id,latex:latex}));
      return;
    }
    target = target.parentNode;
  }
});

window.receiveLatex=function(latex, idToEdit){
  if(!latex) return;

  var chip;
  if(idToEdit) {
    chip = document.getElementById(idToEdit);
  }
  if(!chip) {
    chip=document.createElement('span');
    chip.className='math-chip';
    chip.id='chip_'+(++chipCounter);
    chip.setAttribute('contenteditable','false');
  }

  chip.setAttribute('data-latex', latex);
  chip.innerHTML = latex;

  if(!idToEdit){
    var zwSpace = document.createTextNode('\u200B');
    var sel=window.getSelection();
    var hasValidSelection = sel && sel.rangeCount > 0;
    if(hasValidSelection){
      try{
        var r=sel.getRangeAt(0);
        r.deleteContents();
        r.insertNode(chip);
        if(chip.nextSibling){
          chip.parentNode.insertBefore(zwSpace, chip.nextSibling);
        } else {
          chip.parentNode.appendChild(zwSpace);
        }
        r.setStartAfter(zwSpace);
        r.setEndAfter(zwSpace);
        sel.removeAllRanges();
        sel.addRange(r);
      }catch(_){
        editor.appendChild(chip);
        editor.appendChild(zwSpace);
      }
    } else {
      editor.appendChild(chip);
      editor.appendChild(zwSpace);
    }
  }
  notifyChange();
};
window.setEditorValue=function(val){
  if(!val){editor.innerHTML='';return;}
  // Legacy $$...$$ format
  if(val.indexOf('$$')!==-1){
    var parts=val.split('$$');
    var html='';
    for(var i=0;i<parts.length;i++){
      if(i%2===1){
        var latex=parts[i];
        var id='chip_'+(++chipCounter);
        html+='<span class="math-chip" id="'+id+'" data-latex="'+latex.replace(/"/g,'&quot;')+'" contenteditable="false"></span>';
      }else{html+=parts[i];}
    }
    editor.innerHTML=html;
    editor.querySelectorAll('.math-chip').forEach(function(chip){
      var ltx=chip.getAttribute('data-latex');
      try{katex.render(ltx,chip,{throwOnError:false,displayMode:false,output:'htmlAndMathml'});}
      catch(e){chip.textContent=ltx;}
    });
    return;
  }
  // MathML format: keep raw MathML 100% untouched
  var tmp=document.createElement('div');
  tmp.innerHTML=val;
  tmp.querySelectorAll('math').forEach(function(mathEl){
    var id='chip_'+(++chipCounter);
    var chip=document.createElement('span');
    chip.className='math-chip';
    chip.id=id;
    chip.setAttribute('contenteditable','false');
    chip.setAttribute('data-latex', mathEl.outerHTML);
    chip.innerHTML = mathEl.outerHTML;
    if(mathEl.parentNode)mathEl.parentNode.replaceChild(chip,mathEl);
  });
  editor.innerHTML=tmp.innerHTML;
};
var hiddenInput = document.createElement('input');
hiddenInput.setAttribute('type','text');
hiddenInput.setAttribute('autocomplete','off');
hiddenInput.setAttribute('autocorrect','off');
hiddenInput.setAttribute('autocapitalize','off');
hiddenInput.setAttribute('spellcheck','false');
hiddenInput.style.cssText='position:fixed;opacity:0.01;width:1px;height:1px;top:0;left:0;z-index:-1;pointer-events:none;';
document.body.appendChild(hiddenInput);

var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

if (isIOS) {
  var hiddenInput = document.createElement('input');
  hiddenInput.setAttribute('type','text');
  hiddenInput.setAttribute('autocomplete','off');
  hiddenInput.setAttribute('autocorrect','off');
  hiddenInput.setAttribute('autocapitalize','off');
  hiddenInput.setAttribute('spellcheck','false');
  hiddenInput.style.cssText='position:fixed;opacity:0.01;width:1px;height:1px;top:0;left:0;z-index:-1;pointer-events:none;';
  document.body.appendChild(hiddenInput);

  var _savedRange=null;
  function saveSelection(){
    var sel=window.getSelection();
    if(sel&&sel.rangeCount){
      try{var r=sel.getRangeAt(0);
        if(editor.contains(r.commonAncestorContainer)||r.commonAncestorContainer===editor)
          _savedRange=r.cloneRange();
      }catch(e){}
    }
  }
  document.addEventListener('selectionchange',function(){
    if(document.activeElement===editor)saveSelection();
  });

  window.blurEditor = function() {
    if (document.activeElement) {
      try { document.activeElement.blur(); } catch(e){}
    }
    if (editor) {
      try { editor.blur(); } catch(e){}
    }
    if (hiddenInput) {
      try { hiddenInput.blur(); } catch(e){}
    }
    var sel = window.getSelection();
    if (sel) {
      try { sel.removeAllRanges(); } catch(e){}
    }
  };

  function relayFocusToEditor(){
    hiddenInput.focus();
    requestAnimationFrame(function(){
      editor.focus();
      if(_savedRange){
        try{
          var sel=window.getSelection();
          sel.removeAllRanges();
          sel.addRange(_savedRange);
        }catch(e){}
      }
    });
  }

  editor.addEventListener('touchend',function(e){
    e.stopPropagation();
    var tapRange=null;
    var sel=window.getSelection();
    if(sel&&sel.rangeCount){
      try{
        var r=sel.getRangeAt(0);
        if(editor.contains(r.commonAncestorContainer)||r.commonAncestorContainer===editor)
          tapRange=r.cloneRange();
      }catch(ex){}
    }
    hiddenInput.focus();
    requestAnimationFrame(function(){
      editor.focus();
      if(tapRange){
        try{
          var s=window.getSelection();
          s.removeAllRanges();
          s.addRange(tapRange);
        }catch(ex){}
      }
    });
  },true);

  document.addEventListener('touchend', function(e) {
    var target = e.target;
    if (target !== hiddenInput && target !== editor && (!editor.contains || !editor.contains(target))) {
      relayFocusToEditor();
    }
  });
} else {
  window.blurEditor = function() {
    if (document.activeElement) {
      try { document.activeElement.blur(); } catch(e){}
    }
    if (editor) {
      try { editor.blur(); } catch(e){}
    }
  };
}

function getChipBeforeCursor(){
  var sel=window.getSelection();
  if(!sel||!sel.rangeCount)return null;
  var range=sel.getRangeAt(0);
  if(!range.collapsed)return null;
  var node=range.startContainer;
  var offset=range.startOffset;

  if(node.nodeType===Node.TEXT_NODE){
    var textBefore = node.textContent.substring(0, offset).replace(/\u200B/g, '');
    if(textBefore.length === 0){
      var prev = node.previousSibling;
      while(prev && prev.nodeType===Node.TEXT_NODE && prev.textContent.replace(/\u200B/g, '').length === 0){
        prev = prev.previousSibling;
      }
      if(prev && prev.nodeType===Node.ELEMENT_NODE && prev.classList && prev.classList.contains('math-chip')){
        return prev;
      }
    }
  }

  if(node.nodeType===Node.ELEMENT_NODE){
    if(offset > 0){
      var prevChild = node.childNodes[offset - 1];
      if(prevChild && prevChild.nodeType===Node.ELEMENT_NODE && prevChild.classList && prevChild.classList.contains('math-chip')){
        return prevChild;
      }
      if(prevChild && prevChild.nodeType===Node.TEXT_NODE && prevChild.textContent.replace(/\u200B/g, '').length === 0){
        var p = prevChild.previousSibling;
        if(p && p.nodeType===Node.ELEMENT_NODE && p.classList && p.classList.contains('math-chip')){
          return p;
        }
      }
    }
  }

  var curr = node;
  while(curr && curr !== editor){
    var prevSib = curr.previousSibling;
    while(prevSib && prevSib.nodeType===Node.TEXT_NODE && prevSib.textContent.replace(/\u200B/g, '').length === 0){
      prevSib = prevSib.previousSibling;
    }
    if(prevSib && prevSib.nodeType===Node.ELEMENT_NODE && prevSib.classList && prevSib.classList.contains('math-chip')){
      return prevSib;
    }
    curr = curr.parentNode;
  }

  var chips = editor.querySelectorAll('.math-chip');
  if(chips.length > 0){
    var editorText = editor.textContent.replace(/\u200B/g, '').trim();
    if(editorText.length === 0 && chips.length === 1){
      return chips[0];
    }
  }

  return null;
}
function removeChipAndMaintainFocus(chip){
  if(!chip) return;
  var parent = chip.parentNode;
  var next = chip.nextSibling;

  // Safely move selection away from chip BEFORE removing from DOM to prevent Chromium blur
  try {
    var zw = document.createTextNode('\u200B');
    if (next) {
      parent.insertBefore(zw, next);
    } else {
      parent.appendChild(zw);
    }
    var sel = window.getSelection();
    if (sel) {
      var r = document.createRange();
      r.setStartAfter(zw);
      r.setEndAfter(zw);
      sel.removeAllRanges();
      sel.addRange(r);
    }
  } catch(e) {}

  if(next && next.nodeType===Node.TEXT_NODE && next.textContent.indexOf('\u200B')!==-1){
    try { parent.removeChild(next); } catch(e){}
  }
  try { parent.removeChild(chip); } catch(e){}
  notifyChange();

  requestAnimationFrame(function(){
    editor.focus();
  });
}
editor.addEventListener('beforeinput',function(e){
  if(e.inputType==='deleteContentBackward'){
    var chip=getChipBeforeCursor();
    if(chip){
      e.preventDefault();
      removeChipAndMaintainFocus(chip);
    }
  }
});
editor.addEventListener('keydown',function(e){
  if(e.key==='Backspace'){
    var chip=getChipBeforeCursor();
    if(chip){
      e.preventDefault();
      removeChipAndMaintainFocus(chip);
    }
  }
});
editor.addEventListener('input',notifyChange);
editor.addEventListener('keyup',updateToolbar);
editor.addEventListener('mouseup',updateToolbar);
editor.addEventListener('selectionchange',saveSelection);
<\/script>
</body></html>`;



export interface MathRichInputRef {
  clear: () => void;
}

const MathRichInput = forwardRef<MathRichInputRef, {
  initialValue?: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}>(({ initialValue, onChange, disabled, style }, ref) => {
  const webviewRef = useRef<WebView>(null);
  const initialValueRef = useRef(initialValue);
  const [handwritingOpen, setHandwritingOpen] = useState(false);
  const [isHandwritingMode, setIsHandwritingMode] = useState(false);
  const editingChipIdRef = useRef<string | null>(null);

  const handleDismissKeyboard = useCallback(() => {
    webviewRef.current?.injectJavaScript(`if(window.blurEditor) window.blurEditor(); true;`);
    Keyboard.dismiss();
  }, []);

  const handleMessage = (e: any) => {
    try {
      const data = JSON.parse(e.nativeEvent.data);
      if (data.type === 'openPicker') {
        editingChipIdRef.current = null;
        setIsHandwritingMode(false);
        setHandwritingOpen(true);
      }
      else if (data.type === 'openHandwriting') {
        editingChipIdRef.current = null;
        setIsHandwritingMode(true);
        setHandwritingOpen(true);
      }
      else if (data.type === 'editChip') {
        editingChipIdRef.current = data.id;
        setIsHandwritingMode(false);
        setHandwritingOpen(true);
      }
      else if (data.type === 'change') {
        onChange?.(data.value);
      }
    } catch { }
  };

  useEffect(() => {
    if (Platform.OS === 'ios') {
      const hideSub = Keyboard.addListener('keyboardWillHide', () => {
        webviewRef.current?.injectJavaScript(`if(window.blurEditor) window.blurEditor(); true;`);
      });
      return () => hideSub.remove();
    }
  }, []);

  useImperativeHandle(ref, () => ({
    clear: () => {
      webviewRef.current?.injectJavaScript(
        `document.getElementById('editor').innerHTML=''; notifyChange(); true;`
      );
    },
    blur: handleDismissKeyboard,
  }));

  return (
    <>
      <View pointerEvents={disabled ? 'none' : 'auto'} style={[s.container, style]}>
        <WebView
          ref={webviewRef}
          source={{ html: EDITOR_HTML }}
          onMessage={handleMessage}
          scrollEnabled={false}
          style={{ flex: 1, backgroundColor: 'transparent' }}
          originWhitelist={['*']}
          javaScriptEnabled
          keyboardDisplayRequiresUserAction={false}
          hideKeyboardAccessoryView={false}
          androidLayerType="software"
          nestedScrollEnabled
          onLoadEnd={() => {
            if (initialValueRef.current) {
              webviewRef.current?.injectJavaScript(
                `if(window.setEditorValue) window.setEditorValue(${JSON.stringify(initialValueRef.current)}); true;`
              );
            }
          }}
        />
      </View>

      <HandwritingInput
        visible={handwritingOpen}
        initialHandwriting={isHandwritingMode}
        onClose={() => setHandwritingOpen(false)}
        onInsert={(value, mode) => {
          if (mode === 'math') {
            webviewRef.current?.injectJavaScript(
              `window.receiveLatex(${JSON.stringify(value)}, ${JSON.stringify(editingChipIdRef.current)}); true;`
            );
            editingChipIdRef.current = null;
          } else {
            webviewRef.current?.injectJavaScript(`
              (function(){
                var editor=document.getElementById('editor');
                editor.focus();
                document.execCommand('insertText', false, ${JSON.stringify(value)});
                notifyChange();
              })();
              true;
            `);
          }
          setHandwritingOpen(false);
        }}
      />
    </>
  );
});

export default MathRichInput;

const s = ScaledSheet.create({
  container: {
    flex: 1,
    borderRadius: '8@ms',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  fullscreenBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.01)',
  },
  sheet: {
    position: 'absolute',
    top: '40@ms', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: '20@ms',
    borderTopRightRadius: '20@ms',
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: '10@ms',
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: '16@ms', paddingVertical: '12@ms',
  },
  headerBtn: {
    padding: '8@ms',
  },
  headerBtnCancelTxt: {
    fontSize: '16@ms', color: '#495057', fontWeight: '500',
  },
  headerBtnConfirmTxt: {
    fontSize: '16@ms', color: '#6c63ff', fontWeight: '600',
  },
  sheetTitle: {
    fontSize: '17@ms', fontWeight: '700', color: '#212529',
  },
  mathLiveBox: {
    backgroundColor: '#fff',
  },
  mathLiveLabel: {
    fontSize: '10@ms', fontWeight: '600', color: '#868e96',
    paddingHorizontal: '10@ms', paddingTop: '6@ms',
  }, templateTitle: {
    fontSize: '11@ms', fontWeight: '600', color: '#868e96',
    paddingHorizontal: '16@ms', marginBottom: '6@ms',
  },
  catTab: {
    paddingHorizontal: '14@ms', paddingVertical: '6@ms',
    borderRadius: '20@ms', backgroundColor: '#f1f3f5',
  },
  catTabActive: { backgroundColor: '#212529' },
  catTabText: { fontSize: '12@ms', color: '#495057' },
  catTabTextActive: { color: '#fff', fontWeight: '600' },
  card: {
    flex: 1, margin: '4@ms', paddingVertical: '10@ms', paddingHorizontal: '8@ms',
    borderRadius: '10@ms', backgroundColor: '#f8f9fa',
    borderWidth: '1.5@ms', borderColor: '#e9ecef', alignItems: 'center',
  },
  cardDisplay: { fontSize: '16@ms', color: '#212529', marginBottom: '2@ms' },
  cardLabel: { fontSize: '11@ms', color: '#868e96' },
  actions: {
    flexDirection: 'row', gap: '10@ms',
    paddingHorizontal: '16@ms', paddingTop: '8@ms',
  },
  btnCancel: {
    flex: 1, paddingVertical: '13@ms', borderRadius: '10@ms',
    backgroundColor: '#f1f3f5', alignItems: 'center',
  },
  btnCancelTxt: { fontSize: '15@ms', color: '#495057', fontWeight: '500' },
  btnConfirm: {
    flex: 2, paddingVertical: '13@ms', borderRadius: '10@ms',
    backgroundColor: '#212529', alignItems: 'center',
  },
  btnDisabled: { backgroundColor: '#ced4da' },
  btnConfirmTxt: { fontSize: '15@ms', color: '#fff', fontWeight: '600' },
}) as any;