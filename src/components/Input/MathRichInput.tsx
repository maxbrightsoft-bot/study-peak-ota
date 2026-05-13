import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
  Animated,
  ScrollView,
  StyleProp,
  ViewStyle,
  TextInput,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import { ScaledSheet } from 'react-native-size-matters'

const { height: SCREEN_H } = Dimensions.get('window');

interface FormulaItem {
  label: string;
  latex: string;
  display: string;
}

const FORMULA_CATEGORIES = [
  {
    category: 'math_editor.fractions_roots',
    items: [
      { label: 'math_editor.fraction', latex: '\\frac{a}{b}', display: 'a/b' },
      { label: 'math_editor.square_root', latex: '\\sqrt{x}', display: '√x' },
      { label: 'math_editor.nth_root', latex: '\\sqrt[n]{x}', display: 'ⁿ√x' },
      { label: 'math_editor.mixed_fraction', latex: 'a\\frac{b}{c}', display: 'a b/c' },
    ],
  },
  {
    category: 'math_editor.exponents',
    items: [
      { label: 'math_editor.power', latex: 'x^{n}', display: 'xⁿ' },
      { label: 'math_editor.subscript', latex: 'x_{n}', display: 'xₙ' },
      { label: 'math_editor.sub_superscript', latex: 'x_{n}^{m}', display: 'xₙᵐ' },
      { label: 'math_editor.e_power', latex: 'e^{x}', display: 'eˣ' },
    ],
  },
  {
    category: 'math_editor.integrals_sums',
    items: [
      { label: 'math_editor.integral', latex: '\\int_{a}^{b} f(x)\\,dx', display: '∫f(x)dx' },
      { label: 'math_editor.summation', latex: '\\sum_{i=1}^{n} a_i', display: '∑aᵢ' },
      { label: 'math_editor.product', latex: '\\prod_{i=1}^{n} a_i', display: '∏aᵢ' },
      { label: 'math_editor.limit', latex: '\\lim_{x \\to \\infty}', display: 'lim x→∞' },
    ],
  },
  {
    category: 'math_editor.trigonometry',
    items: [
      { label: 'sin', latex: '\\sin(x)', display: 'sin(x)' },
      { label: 'cos', latex: '\\cos(x)', display: 'cos(x)' },
      { label: 'tan', latex: '\\tan(x)', display: 'tan(x)' },
      { label: 'sin²+cos²=1', latex: '\\sin^2(x)+\\cos^2(x)=1', display: 'sin²+cos²=1' },
    ],
  },
  {
    category: 'math_editor.symbols',
    items: [
      { label: 'math_editor.pi', latex: '\\pi', display: 'π' },
      { label: 'math_editor.infinity', latex: '\\infty', display: '∞' },
      { label: 'math_editor.delta', latex: '\\Delta', display: 'Δ' },
      { label: 'math_editor.alpha', latex: '\\alpha', display: 'α' },
      { label: 'math_editor.beta', latex: '\\beta', display: 'β' },
      { label: 'math_editor.theta', latex: '\\theta', display: 'θ' },
      { label: 'math_editor.lambda', latex: '\\lambda', display: 'λ' },
      { label: 'math_editor.sigma', latex: '\\Sigma', display: 'Σ' },
    ],
  },
  {
    category: 'math_editor.equations',
    items: [
      { label: 'math_editor.quadratic_eq', latex: 'ax^2+bx+c=0', display: 'ax²+bx+c=0' },
      { label: 'math_editor.quadratic_formula', latex: 'x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}', display: 'x=(-b±√Δ)/2a' },
      { label: 'math_editor.derivative', latex: "f'(x)=\\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h}", display: "f'(x)" },
      { label: 'math_editor.derivative_func', latex: '\\frac{dy}{dx}', display: 'dy/dx' },
    ],
  },
];

const EDITOR_HTML = `<!DOCTYPE html><html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"><\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:sans-serif;font-size:15px;color:#212529;background:#fff}
#toolbar{display:flex;align-items:center;gap:6px;padding:6px 10px;border-bottom:1px solid #dee2e6;flex-wrap:wrap}
.fmt-bold{font-weight:700;min-width:28px;height:28px;border:1px solid #ced4da;border-radius:6px;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px}
.fmt-italic{font-style:italic;min-width:28px;height:28px;border:1px solid #ced4da;border-radius:6px;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px}
.fmt-underline{text-decoration:underline;min-width:28px;height:28px;border:1px solid #ced4da;border-radius:6px;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px}
.fmt-btn-active{background:#212529!important;color:#fff!important;border-color:#212529!important}
#sigmaBtn{min-width:28px;height:28px;border:1px solid #ced4da;border-radius:6px;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px}
#editor{min-height:60px;padding:8px 10px;outline:none;line-height:1.8;word-break:break-word}
.math-chip{display:inline-block;background:#f0f4ff;border:1px solid #c7d2fe;border-radius:6px;padding:1px 6px;margin:0 2px;cursor:default;user-select:none;vertical-align:middle}
</style>
</head>
<body>
<div id="toolbar">
  <button id="sigmaBtn" onclick="openPicker()">∑</button>
</div>
<div id="editor" contenteditable="true" spellcheck="false"></div>
<script>
var editor=document.getElementById('editor');
var chipCounter=0;
function fmt(cmd){document.execCommand(cmd,false,null);updateToolbar();}
function updateToolbar(){
  document.getElementById('btnB').classList.toggle('fmt-btn-active',document.queryCommandState('bold'));
  document.getElementById('btnI').classList.toggle('fmt-btn-active',document.queryCommandState('italic'));
  document.getElementById('btnU').classList.toggle('fmt-btn-active',document.queryCommandState('underline'));
}
function openPicker(){window.ReactNativeWebView.postMessage(JSON.stringify({type:'openPicker'}));}
function notifyChange(){
  var out='';
  function walk(node){
    if(node.nodeType===3){out+=node.textContent.replace(/\u200B/g,'');}
    else if(node.classList&&node.classList.contains('math-chip')){out+='$$'+node.getAttribute('data-latex')+'$$';}
    else{
      var t=node.nodeName;
      if(t==='B'||t==='STRONG')out+='<b>';
      else if(t==='I'||t==='EM')out+='<i>';
      else if(t==='U')out+='<u>';
      node.childNodes.forEach(walk);
      if(t==='B'||t==='STRONG')out+='</b>';
      else if(t==='I'||t==='EM')out+='</i>';
      else if(t==='U')out+='</u>';
    }
  }
  editor.childNodes.forEach(walk);
  window.ReactNativeWebView.postMessage(JSON.stringify({type:'change',value:out}));
}

// Click on existing chip to edit
document.addEventListener('click', function(e){
  var target = e.target;
  while(target && target !== editor){
    if(target.classList && target.classList.contains('math-chip')){
      var id = target.getAttribute('id');
      var latex = target.getAttribute('data-latex');
      window.ReactNativeWebView.postMessage(JSON.stringify({type:'editChip',id:id,latex:latex}));
      return;
    }
    target = target.parentNode;
  }
});

window.receiveLatex=function(latex, idToEdit){
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
  
  chip.setAttribute('data-latex',latex);
  try{katex.render(latex,chip,{throwOnError:false,displayMode:false});}
  catch(e){chip.textContent=latex;}

  if(!idToEdit){
    var sel=window.getSelection();
    if(sel&&sel.rangeCount){
      var r=sel.getRangeAt(0);r.deleteContents();r.insertNode(chip);
      r.setStartAfter(chip);r.setEndAfter(chip);sel.removeAllRanges();sel.addRange(r);
    } else {editor.appendChild(chip);}
  }
  notifyChange();
};
window.setEditorValue=function(val){
  if(!val){editor.innerHTML='';return;}
  var parts=val.split('$$');
  var html='';
  for(var i=0;i<parts.length;i++){
    if(i%2===1){
      var latex=parts[i];
      var id='chip_'+(++chipCounter);
      html+='<span class="math-chip" id="'+id+'" data-latex="'+latex.replace(/"/g,'&quot;')+'" contenteditable="false"></span>';
    }else{
      html+=parts[i];
    }
  }
  editor.innerHTML=html;
  var chips=editor.querySelectorAll('.math-chip');
  chips.forEach(function(chip){
    var ltx=chip.getAttribute('data-latex');
    try{katex.render(ltx,chip,{throwOnError:false,displayMode:false});}
    catch(e){chip.textContent=ltx;}
  });
};
editor.addEventListener('input',notifyChange);
editor.addEventListener('keyup',updateToolbar);
editor.addEventListener('mouseup',updateToolbar);
<\/script>
</body></html>`;

const makePreviewHTML = (latex: string) => `<!DOCTYPE html><html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"><\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{display:flex;align-items:center;justify-content:center;min-height:130px;background:#f8f9fa;font-family:sans-serif}
#math{font-size:22px;padding:12px;text-align:center;max-width:100%;overflow-x:auto}
#hint{font-size:12px;color:#adb5bd;padding:12px}
</style>
</head>
<body>
<div id="math"></div>
<div id="hint">${!latex.trim() ? '수식을 입력하거나 템플릿을 선택하세요' : ''}</div>
<script>
if (${JSON.stringify(!!latex.trim())}) {
  try { katex.render(${JSON.stringify(latex)}, document.getElementById('math'), {throwOnError:false,displayMode:true}); }
  catch(e) { document.getElementById('hint').textContent = e.message||'Error'; }
}
<\/script>
</body></html>`;

const MATHLIVE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
<script defer src="https://unpkg.com/mathlive@0.98.6/dist/mathlive.min.js"></script>
<style>
  body { margin: 0; padding: 12px; box-sizing: border-box; display: flex; justify-content: center; align-items: flex-start; height: 100vh; overflow: hidden; background: #fafafa; font-family: sans-serif; }
  math-field {
    width: 100%;
    min-height: 85px;
    font-size: 42px;
    padding: 12px 16px;
    border-radius: 10px;
    border: 1.5px solid #6c63ff;
    background: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    outline: none;
  }
  math-field:focus-within {
    border-color: #7c3aed;
    box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
  }
  /* Hide keyboard toggle inside the input field */
  math-field::part(virtual-keyboard-toggle) { display: none !important; }
  math-field::part(menu-toggle) { display: none !important; }
  /* Hide close button to keep keyboard always visible */
  math-virtual-keyboard::part(close-toggle) { display: none !important; }
  /* Hide custom MathLive context menu */
  .ML__menu, [part="menu"], [role="menu"] { display: none !important; opacity: 0 !important; pointer-events: none !important; }
</style>
</head>
<body>
  <math-field id="mf"></math-field>
  <script>
    const mf = document.getElementById('mf');
    
    // Intercept and kill contextmenu events before MathLive can show its menu
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, { capture: true, passive: false });
    
    mf.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, { capture: true, passive: false });
    
    // MutationObserver to kill any menu elements MathLive might try to attach to the body
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && (node.className?.includes?.('ML__menu') || node.getAttribute?.('role') === 'menu' || node.tagName === 'MATH-CONTEXT-MENU')) {
            node.remove();
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Wait for the custom element to upgrade before modifying its properties/methods
    customElements.whenDefined('math-field').then(() => {
      // Disable MathLive's custom context menu completely
      mf.menuItems = [];
      mf.showMenu = function() { return false; }; // Overwrite internal method
      
      mf.addEventListener('input', (ev) => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'change', value: mf.value }));
      });

      mf.addEventListener('focusout', () => {
        setTimeout(() => window.mathVirtualKeyboard.show(), 10);
      });

      // Always show keyboard and prevent closing
      window.mathVirtualKeyboard.show();
    });

    window.setLatex = function(latex) {
      customElements.whenDefined('math-field').then(() => {
        if (typeof latex === 'string' && mf.value !== latex) {
          mf.value = latex;
        }
      });
    };
    
    if (typeof window.__pendingLatex !== 'undefined') {
      window.setLatex(window.__pendingLatex);
    }
    
    window.insertLatex = function(latex) {
      mf.insert(latex);
      mf.focus();
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'change', value: mf.value }));
    };
    
    window.addEventListener('load', () => {
      setTimeout(() => { 
        mf.focus(); 
        window.mathVirtualKeyboard.show();
      }, 150);
    });
  </script>
</body>
</html>`;


function FormulaBottomSheet({
  visible, onClose, onSelect, initialLatex = '',
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: FormulaItem) => void;
  initialLatex?: string;
}) {
  const { t } = useTranslation();

  const [activeCat, setActiveCat] = useState(0);
  const [latexInput, setLatexInput] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const mathLiveRef = useRef<WebView>(null);
  const slideY = useRef(new Animated.Value(SCREEN_H)).current;

  React.useEffect(() => {
    if (visible) {
      setLatexInput(initialLatex);
      Animated.spring(slideY, {
        toValue: 0, useNativeDriver: true, tension: 68, friction: 12,
      }).start();
      const safeInject = `
        if (typeof window.setLatex === 'function') {
          window.setLatex(${JSON.stringify(initialLatex)});
        } else {
          window.__pendingLatex = ${JSON.stringify(initialLatex)};
        }
        true;
      `;
      mathLiveRef.current?.injectJavaScript(safeInject);
    } else {
      Animated.timing(slideY, {
        toValue: SCREEN_H, duration: 220, useNativeDriver: true,
      }).start();
    }
  }, [visible, initialLatex]);

  const handleSelectTemplate = useCallback((item: FormulaItem) => {
    mathLiveRef.current?.injectJavaScript(`window.insertLatex(${JSON.stringify(item.latex)}); true;`);
  }, []);

  const handleInsert = useCallback(() => {
    const latex = latexInput.trim();
    if (!latex) return;
    onSelect({ label: 'custom', latex, display: latex });
    onClose();
  }, [latexInput, onSelect, onClose]);

  const handleClose = useCallback(() => {
    setLatexInput('');
    onClose();
  }, [onClose]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={s.backdrop}
        activeOpacity={1}
        onPress={handleClose}
      />

      <Animated.View style={[s.sheet, { transform: [{ translateY: slideY }] }]}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={handleClose} style={s.headerBtn}>
            <Text style={s.headerBtnCancelTxt}>{t('cancel')}</Text>
          </TouchableOpacity>
          <Text style={s.sheetTitle}>{t('math_editor.input')}</Text>
          <TouchableOpacity
            onPress={handleInsert}
            disabled={!latexInput.trim()}
            style={s.headerBtn}
          >
            <Text style={[s.headerBtnConfirmTxt, !latexInput.trim() && s.btnDisabled]}>{t('math_editor.insert')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0, marginTop: 8, marginBottom: 8 }}
          contentContainerStyle={{ paddingHorizontal: 14, gap: 8 }}
          keyboardShouldPersistTaps="handled"
        >
          {FORMULA_CATEGORIES.map((cat, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setActiveCat(i)}
              style={[s.catTab, activeCat === i && s.catTabActive]}
            >
              <Text style={[s.catTabText, activeCat === i && s.catTabTextActive]}>
                {cat.category.startsWith('math_') ? t(cat.category) : cat.category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          data={FORMULA_CATEGORIES[activeCat].items}
          keyExtractor={(_, i) => String(i)}
          numColumns={2}
          style={{ maxHeight: 150, flexGrow: 0 }}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 4 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.card}
              onPress={() => handleSelectTemplate(item)}
              activeOpacity={0.7}
            >
              <Text style={s.cardDisplay}>{item.display}</Text>
              <Text style={s.cardLabel}>{item.label.startsWith('math_') ? t(item.label) : item.label}</Text>
            </TouchableOpacity>
          )}
        />

        <View style={[s.mathLiveBox, { flex: 1, borderTopWidth: 1, borderTopColor: '#eee', borderRadius: 0, marginHorizontal: 0, marginBottom: 0 }]}>
          <WebView
            ref={mathLiveRef}
            source={{ html: MATHLIVE_HTML }}
            style={{ flex: 1, backgroundColor: 'transparent' }}
            scrollEnabled={false}
            originWhitelist={['*']}
            javaScriptEnabled
            onMessage={(e) => {
              try {
                const data = JSON.parse(e.nativeEvent.data);
                if (data.type === 'change') {
                  setLatexInput(data.value);
                }
              } catch (err) { }
            }}
            onLoadEnd={() => {
              const safeInject = `
                if (typeof window.setLatex === 'function') {
                  window.setLatex(${JSON.stringify(initialLatex)});
                } else {
                  window.__pendingLatex = ${JSON.stringify(initialLatex)};
                }
                true;
              `;
              mathLiveRef.current?.injectJavaScript(safeInject);
            }}
          />
        </View>
      </Animated.View>
    </Modal>
  );
}

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
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingLatex, setEditingLatex] = useState('');
  const editingChipIdRef = useRef<string | null>(null);

  const handleMessage = (e: any) => {
    try {
      const data = JSON.parse(e.nativeEvent.data);
      if (data.type === 'openPicker') {
        setEditingLatex('');
        editingChipIdRef.current = null;
        setPickerOpen(true);
      }
      else if (data.type === 'editChip') {
        setEditingLatex(data.latex);
        editingChipIdRef.current = data.id;
        setPickerOpen(true);
      }
      else if (data.type === 'change') {
        onChange?.(data.value);
      }
    } catch { }
  };

  const handleSelect = (item: FormulaItem) => {
    webviewRef.current?.injectJavaScript(
      `window.receiveLatex(${JSON.stringify(item.latex)}, ${JSON.stringify(editingChipIdRef.current)}); true;`
    );
    editingChipIdRef.current = null;
  };

  useImperativeHandle(ref, () => ({
    clear: () => {
      webviewRef.current?.injectJavaScript(
        `document.getElementById('editor').innerHTML=''; notifyChange(); true;`
      );
    },
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
          onLoadEnd={() => {
            if (initialValue) {
              webviewRef.current?.injectJavaScript(
                `if(window.setEditorValue) window.setEditorValue(${JSON.stringify(initialValue)}); true;`
              );
            }
          }}
        />
      </View>

      <FormulaBottomSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelect}
        initialLatex={editingLatex}
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    top: '40@ms', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: '20@ms',
    borderTopRightRadius: '20@ms',
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
    elevation: '20@ms',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: '-4@ms' },
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
});