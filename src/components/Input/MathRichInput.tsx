import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
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
} from 'react-native';
import { WebView } from 'react-native-webview';

const { height: SCREEN_H } = Dimensions.get('window');

const FORMULA_CATEGORIES = [
  {
    category: '분수 & 제곱근',
    items: [
      { label: '분수', latex: '\\frac{a}{b}', display: 'a/b' },
      { label: '제곱근', latex: '\\sqrt{x}', display: '√x' },
      { label: 'n제곱근', latex: '\\sqrt[n]{x}', display: 'ⁿ√x' },
      { label: '대분수', latex: 'a\\frac{b}{c}', display: 'a b/c' },
    ],
  },
  {
    category: '지수 & 첨자',
    items: [
      { label: '거듭제곱', latex: 'x^{n}', display: 'xⁿ' },
      { label: '아래 첨자', latex: 'x_{n}', display: 'xₙ' },
      { label: '위아래 첨자', latex: 'x_{n}^{m}', display: 'xₙᵐ' },
      { label: 'e의 지수', latex: 'e^{x}', display: 'eˣ' },
    ],
  },
  {
    category: '적분 & 합',
    items: [
      { label: '적분', latex: '\\int_{a}^{b} f(x)\\,dx', display: '∫ f(x)dx' },
      { label: '합산', latex: '\\sum_{i=1}^{n} a_i', display: '∑aᵢ' },
      { label: '곱', latex: '\\prod_{i=1}^{n} a_i', display: '∏aᵢ' },
      { label: '극한', latex: '\\lim_{x \\to \\infty}', display: 'lim x→∞' },
    ],
  },
  {
    category: '삼각함수',
    items: [
      { label: 'sin', latex: '\\sin(x)', display: 'sin(x)' },
      { label: 'cos', latex: '\\cos(x)', display: 'cos(x)' },
      { label: 'tan', latex: '\\tan(x)', display: 'tan(x)' },
      { label: 'sin²+cos²=1', latex: '\\sin^2(x)+\\cos^2(x)=1', display: 'sin²+cos²=1' },
    ],
  },
  {
    category: '기호',
    items: [
      { label: '파이', latex: '\\pi', display: 'π' },
      { label: '무한대', latex: '\\infty', display: '∞' },
      { label: '델타', latex: '\\Delta', display: 'Δ' },
      { label: '알파', latex: '\\alpha', display: 'α' },
      { label: '베타', latex: '\\beta', display: 'β' },
      { label: '세타', latex: '\\theta', display: 'θ' },
      { label: '람다', latex: '\\lambda', display: 'λ' },
      { label: '시그마', latex: '\\Sigma', display: 'Σ' },
    ],
  },
  {
    category: '방정식',
    items: [
      { label: '이차방정식', latex: 'ax^2+bx+c=0', display: 'ax²+bx+c=0' },
      { label: '근의 공식', latex: 'x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}', display: 'x=(-b±√Δ)/2a' },
      { label: '미분', latex: "f'(x)=\\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h}", display: "f'(x)" },
      { label: '도함수', latex: '\\frac{dy}{dx}', display: 'dy/dx' },
    ],
  },
];

const makePreviewHTML = (latex: string) => `
<!DOCTYPE html><html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <style>
    body { display:flex; align-items:center; justify-content:center;
           min-height:80px; margin:0; background:#f8f9fa; }
    #math { font-size:22px; padding:12px; }
  </style>
</head>
<body>
  <div id="math"></div>
  <script>
    try {
      katex.render(${JSON.stringify(latex)}, document.getElementById('math'),
        { throwOnError:false, displayMode:true });
    } catch(e) {
      document.getElementById('math').textContent = ${JSON.stringify(latex)};
    }
  </script>
</body></html>
`;

const EDITOR_HTML = `
<!DOCTYPE html><html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"><\/script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body {
  font-family:-apple-system,BlinkMacSystemFont,sans-serif;
  background:#fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
}
#toolbar{display:flex;align-items:center;gap:2px;padding:6px 8px;border-bottom:1px solid #dee2e6}
.tool-btn{padding:4px 8px;border:none;background:transparent;border-radius:4px;
cursor:pointer;font-size:14px;color:#343a40;min-width:30px;text-align:center}
.tool-btn.active{background:#212529;color:#fff}
.tool-btn.bold{font-weight:700}
.tool-btn.italic{font-style:italic}
.tool-btn.underline{text-decoration:underline}
.divider{width:1px;height:18px;background:#dee2e6;margin:0 4px}
#editor{min-height:80px;padding:10px 12px;font-size:15px;color:#495057;
line-height:1.8;outline:none;word-break:break-word}
#editor:empty:before{content:attr(data-placeholder);color:#adb5bd;pointer-events:none}
.math-chip{display:inline-block;vertical-align:middle;background:#f1f3f5;
border:1px solid #ced4da;border-radius:4px;padding:2px 6px;margin:0 2px}
</style>
</head>
<body>

<div id="toolbar">
  <button class="tool-btn bold"      onclick="execCmd('bold')">B</button>
  <button class="tool-btn italic"    onclick="execCmd('italic')">I</button>
  <button class="tool-btn underline" onclick="execCmd('underline')">U</button>
  <div class="divider"></div>
  <button class="tool-btn"           onclick="openPicker()">∑</button>
</div>

<div id="editor" contenteditable="true" data-placeholder="메시지 보내기"></div>

<script>
let savedRange = null;
let activeFormat = null;
const editor = document.getElementById('editor');

function renderToolbar() {
  ['bold','italic','underline'].forEach(cmd => {
    document.querySelector('.tool-btn.' + cmd)
      ?.classList.toggle('active', activeFormat === cmd);
  });
}

function restoreSelection() {
  const sel = window.getSelection();
  if (savedRange && sel) { sel.removeAllRanges(); sel.addRange(savedRange); }
}

document.addEventListener('selectionchange', () => {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount || !editor.contains(sel.anchorNode)) return;
  savedRange = sel.getRangeAt(0).cloneRange();
});

function execCmd(cmd) {
  activeFormat = activeFormat === cmd ? null : cmd;
  renderToolbar();

  editor.focus();
  restoreSelection();
  document.execCommand('styleWithCSS', false, true);

  ['bold', 'italic', 'underline'].forEach(f => {
    const isOn = document.queryCommandState(f);
    const shouldBeOn = activeFormat === f;
    if (isOn !== shouldBeOn) {
      document.execCommand(f, false, null);
    }
  });
}

function openPicker() {
  const sel = window.getSelection();
  if (sel && sel.rangeCount) savedRange = sel.getRangeAt(0).cloneRange();
  window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
    JSON.stringify({ type: 'openPicker' }));
}

window.receiveLatex = function(latex) {
  editor.focus();
  restoreSelection();

  const span = document.createElement('span');
  span.className = 'math-chip';
  span.setAttribute('data-latex', latex);
  try { katex.render(latex, span, { throwOnError: false, displayMode: false }); }
  catch(e) { span.textContent = latex; }

  const sel = window.getSelection();
  if (sel && sel.rangeCount) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const before = document.createTextNode('\u00A0');
    range.insertNode(before); range.setStartAfter(before);
    range.insertNode(span);   range.setStartAfter(span);
    const after = document.createTextNode('\u00A0');
    range.insertNode(after);  range.setStartAfter(after);
    range.collapse(true);
    sel.removeAllRanges(); sel.addRange(range);
    savedRange = range.cloneRange();
  } else {
    editor.appendChild(span);
  }

  notifyChange();
  notifyHeight();
};

function notifyChange() {
  let text = '';
  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    } else if (node.classList && node.classList.contains('math-chip')) {
      text += '$$' + node.getAttribute('data-latex') + '$$';
    } else {
      node.childNodes.forEach(walk);
    }
  }
  editor.childNodes.forEach(walk);
  window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
    JSON.stringify({ type: 'change', value: text }));
}

function notifyHeight() {
  window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
    JSON.stringify({ type: 'height', value: document.body.scrollHeight }));
}

new ResizeObserver(notifyHeight).observe(document.body);
<\/script>
</body></html>
`;

interface FormulaItem { label: string; latex: string; display: string; }

function FormulaBottomSheet({
  visible, onClose, onSelect,
}: { visible: boolean; onClose: () => void; onSelect: (i: FormulaItem) => void; }) {
  const [selected, setSelected] = useState<FormulaItem | null>(null);
  const [activeCat, setActiveCat] = useState(0);
  const slide = useRef(new Animated.Value(SCREEN_H)).current;

  React.useEffect(() => {
    if (visible) {
      setSelected(null);
      Animated.spring(slide, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
    } else {
      Animated.timing(slide, { toValue: SCREEN_H, duration: 240, useNativeDriver: true }).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />

      <Animated.View style={[s.sheet, { transform: [{ translateY: slide }] }]}>
        <View style={s.handle} />
        <Text style={s.sheetTitle}>수식 선택</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0, marginBottom: 10 }}
          contentContainerStyle={{ paddingHorizontal: 14, gap: 8 }}>
          {FORMULA_CATEGORIES.map((cat, i) => (
            <TouchableOpacity key={i}
              onPress={() => { setActiveCat(i); setSelected(null); }}
              style={[s.catTab, activeCat === i && s.catTabActive]}>
              <Text style={[s.catTabText, activeCat === i && s.catTabTextActive]}>
                {cat.category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          data={FORMULA_CATEGORIES[activeCat].items}
          keyExtractor={(_, i) => String(i)}
          numColumns={2}
          style={{ maxHeight: 200 }}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 4 }}
          renderItem={({ item }) => {
            const isSel = selected?.latex === item.latex;
            return (
              <TouchableOpacity
                style={[s.card, isSel && s.cardSelected]}
                onPress={() => setSelected(item)}
                activeOpacity={0.7}>
                <Text style={s.cardDisplay}>{item.display}</Text>
                <Text style={s.cardLabel}>{item.label}</Text>
              </TouchableOpacity>
            );
          }}
        />

        {selected && (
          <View style={s.previewBox}>
            <Text style={s.previewLabel}>미리보기</Text>
            <WebView
              source={{ html: makePreviewHTML(selected.latex) }}
              style={{ height: 80, backgroundColor: 'transparent' }}
              scrollEnabled={false}
              originWhitelist={['*']}
            />
            <Text style={s.previewLatex}>{selected.latex}</Text>
          </View>
        )}

        <View style={s.actions}>
          <TouchableOpacity style={s.btnCancel} onPress={onClose}>
            <Text style={s.btnCancelTxt}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.btnConfirm, !selected && s.btnDisabled]}
            onPress={() => { if (selected) { onSelect(selected); onClose(); } }}
            disabled={!selected}>
            <Text style={s.btnConfirmTxt}>삽입</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

export interface MathRichInputRef {
  clear: () => void;
}

const MathRichInput = forwardRef<MathRichInputRef, {
  onChange?: (v: string) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}>(({ onChange, disabled, style }, ref) => {

  const webviewRef = useRef<WebView>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleMessage = (e: any) => {
    try {
      const data = JSON.parse(e.nativeEvent.data);
      if (data.type === 'openPicker') setPickerOpen(true);
      else if (data.type === 'change') onChange?.(data.value);
    } catch { }
  };

  const handleSelect = (item: FormulaItem) => {
    webviewRef.current?.injectJavaScript(
      `window.receiveLatex(${JSON.stringify(item.latex)}); true;`
    );
  };

   useImperativeHandle(ref, () => ({
    clear: () => {
      webviewRef.current?.injectJavaScript(`
        document.getElementById('editor').innerHTML = '';
        notifyChange();
        true;
      `);
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
        />
      </View>

      <FormulaBottomSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelect}
      />
    </>
  );
});

export default MathRichInput;

const s = StyleSheet.create({
  container: {
  flex: 1,
  borderRadius: 8,
  backgroundColor: '#fff',
},
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    maxHeight: SCREEN_H * 0.88,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#dee2e6', alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  sheetTitle: {
    fontSize: 16, fontWeight: '700', color: '#212529',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  catTab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f1f3f5' },
  catTabActive: { backgroundColor: '#212529' },
  catTabText: { fontSize: 12, color: '#495057' },
  catTabTextActive: { color: '#fff', fontWeight: '600' },
  card: {
    flex: 1, margin: 4, paddingVertical: 12, paddingHorizontal: 8,
    borderRadius: 10, backgroundColor: '#f8f9fa',
    borderWidth: 1.5, borderColor: '#e9ecef', alignItems: 'center',
  },
  cardSelected: { borderColor: '#212529', backgroundColor: '#f1f3f5' },
  cardDisplay: { fontSize: 18, color: '#212529', marginBottom: 4 },
  cardLabel: { fontSize: 11, color: '#868e96' },
  previewBox: {
    marginHorizontal: 16, marginTop: 10,
    borderRadius: 10, overflow: 'hidden',
    borderWidth: 1, borderColor: '#dee2e6', backgroundColor: '#f8f9fa',
  },
  previewLabel: {
    fontSize: 11, fontWeight: '600', color: '#868e96',
    paddingHorizontal: 12, paddingTop: 8,
  },
  previewLatex: {
    fontSize: 11, color: '#adb5bd',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    paddingHorizontal: 12, paddingBottom: 8,
  },
  actions: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 14 },
  btnCancel: {
    flex: 1, paddingVertical: 13, borderRadius: 10,
    backgroundColor: '#f1f3f5', alignItems: 'center',
  },
  btnCancelTxt: { fontSize: 15, color: '#495057', fontWeight: '500' },
  btnConfirm: {
    flex: 2, paddingVertical: 13, borderRadius: 10,
    backgroundColor: '#212529', alignItems: 'center',
  },
  btnDisabled: { backgroundColor: '#ced4da' },
  btnConfirmTxt: { fontSize: 15, color: '#fff', fontWeight: '600' },
});