import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

export interface HandwritingInputProps {
  visible: boolean;
  onClose: () => void;
  onInsert: (value: string, mode: 'math' | 'text') => void;
  initialHandwriting?: boolean;
}

export interface HandwritingInputRef {
  reset: () => void;
}

const WIRIS_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <script src="https://www.wiris.net/demo/editor/editor"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #eef2f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    #modalWrapper {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #eef2f5;
    }
    #editorArea {
      flex: 1;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #fff;
    }
    #editorContainer {
      flex: 1;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .wrs_editor, .wrs_container, .wrs_contentArea {
      width: 100% !important;
      height: 100% !important;
      flex: 1 !important;
      border: none !important;
      display: flex !important;
      flex-direction: column !important;
    }
    .wrs_panel {
      flex: 1 !important;
      height: 100% !important;
      min-height: 260px !important;
    }
    .wrs_contentFieldContainer, .wrs_handwritingContainer {
      flex: 1 !important;
      height: 100% !important;
    }
    body {
      touch-action: pan-x pan-y;
    }
    .wrs_toolbar, .wrs_panelTabContainer, .wrs_tabContainer, .wrs_panel, .wrs_scroll {
      overflow-x: auto !important;
      overflow-y: hidden !important;
      -webkit-overflow-scrolling: touch !important;
      touch-action: pan-x !important;
      flex-shrink: 0 !important;
    }
    .wrs_toolbar *, .wrs_panelTabContainer *, .wrs_panel * {
      touch-action: pan-x !important;
    }
    #footerBar {
      height: 54px;
      flex-shrink: 0;
      background: #eef2f5;
      border-top: 1px solid #cbd5e1;
      display: flex;
      align-items: center;
      padding: 0 14px;
      gap: 10px;
    }
    .btn-action-insert {
      height: 36px;
      padding: 0 22px;
      background: #648299;
      color: #ffffff;
      border: none;
      border-radius: 4px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    }
    .btn-action-insert:active {
      background: #4d667b;
    }
    .btn-action-cancel {
      height: 36px;
      padding: 0 18px;
      background: #e0e6ed;
      color: #334155;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-action-cancel:active {
      background: #cbd5e1;
    }
  </style>
</head>
<body>
  <div id="modalWrapper">
    <div id="editorArea">
      <div id="editorContainer"></div>
    </div>
    <div id="footerBar">
      <button type="button" class="btn-action-insert" onclick="sendInsert()">Insert</button>
      <button type="button" class="btn-action-cancel" onclick="sendCancel()">Cancel</button>
    </div>
  </div>
  <script>
    var editor;
    window.lastLatex = '';
    window.lastMathML = '';

    function captureData() {
      try {
        if (editor) {
          if (typeof editor.getLatex === 'function') window.lastLatex = editor.getLatex() || window.lastLatex || '';
          if (typeof editor.getMathML === 'function') window.lastMathML = editor.getMathML() || window.lastMathML || '';
        }
      } catch(e) {}
    }

    window.setWirisHandwritingMode = function(isHw) {
      try {
        if (editor && typeof editor.setIsHandwriting === 'function') {
          editor.setIsHandwriting(!!isHw);
        }
      } catch(e1) {}
    };

    function enableDragScroll() {
      try {
        var targets = document.querySelectorAll('.wrs_toolbar, .wrs_panelTabContainer, .wrs_tabCenter, .wrs_panel, div[class*="wrs_"]');
        targets.forEach(function(el) {
          if (el.dataset && el.dataset.dragEnabled) return;
          if (el.dataset) el.dataset.dragEnabled = 'true';

          el.style.overflowX = 'auto';
          el.style.webkitOverflowScrolling = 'touch';

          var startX = 0, scrollLeft = 0, isTouch = false;

          el.addEventListener('touchstart', function(e) {
            if (e.touches && e.touches.length === 1) {
              isTouch = true;
              startX = e.touches[0].pageX - el.offsetLeft;
              scrollLeft = el.scrollLeft;
            }
          }, { passive: true });

          el.addEventListener('touchmove', function(e) {
            if (!isTouch || !e.touches || e.touches.length !== 1) return;
            var x = e.touches[0].pageX - el.offsetLeft;
            var walk = (x - startX) * 1.8;
            el.scrollLeft = scrollLeft - walk;
          }, { passive: true });

          el.addEventListener('touchend', function() {
            isTouch = false;
          }, { passive: true });
        });
      } catch(e) {}
    }

    setInterval(enableDragScroll, 400);

    function initEditor() {
      try {
        if (typeof com !== 'undefined' && com.wiris && com.wiris.jsEditor) {
          var isHw = __INITIAL_HANDWRITING__;
          editor = com.wiris.jsEditor.JsEditor.newInstance({
            'language': 'en',
            'toolbar': 'main'
          });

          editor.insertInto(document.getElementById('editorContainer'));

          function applyTargetMode() {
            try {
              if (editor && typeof editor.setIsHandwriting === 'function') {
                editor.setIsHandwriting(!!isHw);
              }
            } catch(e) {}

            try {
              var container = document.getElementById('editorContainer');
              if (container) {
                if (!isHw) {
                  var kbBtn = container.querySelector('.wrs_keyboardButton, .wrs_layoutButton, [title*="keyboard" i], [title*="bàn phím" i], [title*="Keyboard" i]');
                  if (!kbBtn) {
                    var btns = Array.from(container.querySelectorAll('button, div[role="button"]'));
                    kbBtn = btns.find(function(b) {
                      var t = (b.getAttribute('title') || b.getAttribute('aria-label') || b.className || '').toLowerCase();
                      return t.indexOf('keyboard') !== -1 || t.indexOf('bàn phím') !== -1 || t.indexOf('key') !== -1;
                    });
                  }
                  if (kbBtn) kbBtn.click();
                } else {
                  var hwBtn = container.querySelector('.wrs_handwritingButton, .wrs_handwritingTab, [title*="handwriting" i], [title*="viết tay" i]');
                  if (hwBtn) hwBtn.click();
                }
              }
            } catch(e2) {}
          }

          applyTargetMode();
          setTimeout(applyTargetMode, 100);
          setTimeout(applyTargetMode, 300);
          setTimeout(applyTargetMode, 600);

          editor.addListener({
            contentChanged: function() {
              captureData();
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'wirisResult',
                latex: window.lastLatex,
                mathml: window.lastMathML
              }));
            }
          });

          var edBox = document.getElementById('editorContainer');
          if (edBox) {
            edBox.addEventListener('keyup', captureData);
            edBox.addEventListener('pointerup', captureData);
            edBox.addEventListener('touchend', captureData);
          }
        }
      } catch(err) {
        console.log('Wiris Editor init error:', err);
      }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      initEditor();
    } else {
      window.addEventListener('DOMContentLoaded', initEditor);
    }

    window.clearWirisEditor = function() {
      try {
        if (editor && typeof editor.setMathML === 'function') {
          editor.setMathML('<math xmlns="http://www.w3.org/1998/Math/MathML"></math>');
        }
      } catch(e) {}
      window.lastLatex = '';
      window.lastMathML = '';
    };

    function sendInsert() {
      captureData();
      var latex = window.lastLatex || '';
      var mathml = window.lastMathML || '';

      try {
        if (editor) {
          if (typeof editor.getMathML === 'function') {
            var m = editor.getMathML();
            if (m) mathml = m;
          }
          if (typeof editor.getLatex === 'function') {
            var l = editor.getLatex();
            if (l) latex = l;
          }
        }
      } catch(err) {}

      if (!latex && !mathml) {
        try {
          var box = document.getElementById('editorContainer');
          if (box) {
            var mathEl = box.querySelector('math');
            if (mathEl) mathml = mathEl.outerHTML || '';
            var ann = box.querySelector('annotation[encoding="application/x-tex"]');
            if (ann) latex = ann.textContent.trim() || '';
          }
        } catch(err) {}
      }

      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'insert',
        latex: latex,
        mathml: mathml
      }));
    }

    function sendCancel() {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'cancel'
      }));
    }
  </script>
</body>
</html>`;

const HandwritingInput = forwardRef<HandwritingInputRef, HandwritingInputProps>(
  ({ visible, onClose, onInsert, initialHandwriting = false }, ref) => {
    const wvRef = useRef<WebView>(null);

    const handleClose = () => {
      wvRef.current?.injectJavaScript(`if(window.clearWirisEditor) window.clearWirisEditor(); true;`);
      onClose();
    };

    useImperativeHandle(ref, () => ({
      reset: () => {
        wvRef.current?.injectJavaScript(`if(window.clearWirisEditor) window.clearWirisEditor(); true;`);
      },
    }));

    const wirisHtmlSource = useMemo(() => {
      return WIRIS_HTML.replace('__INITIAL_HANDWRITING__', initialHandwriting ? 'true' : 'false');
    }, [initialHandwriting]);

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <View style={ss.overlay}>
          <TouchableOpacity style={ss.backdrop} activeOpacity={1} onPress={handleClose} />

          <View style={ss.pureSheet}>
            <WebView
              key={`wiris-wv-${initialHandwriting}-${visible}`}
              ref={wvRef}
              source={{ html: wirisHtmlSource, baseUrl: 'https://www.wiris.net' }}
              originWhitelist={['*']}
              mixedContentMode="always"
              javaScriptEnabled
              scrollEnabled={true}
              overScrollMode="always"
              style={{ flex: 1, backgroundColor: '#eef2f5' }}
              onMessage={(event) => {
                try {
                  const data = JSON.parse(event.nativeEvent.data);
                  if (data.type === 'insert') {
                    let finalVal = data.latex || data.mathml || '';
                    if (finalVal) {
                      onInsert(finalVal, 'math');
                    }
                    wvRef.current?.injectJavaScript(`if(window.clearWirisEditor) window.clearWirisEditor(); true;`);
                    onClose();
                  } else if (data.type === 'cancel') {
                    wvRef.current?.injectJavaScript(`if(window.clearWirisEditor) window.clearWirisEditor(); true;`);
                    onClose();
                  }
                } catch (_) {}
              }}
            />
          </View>
        </View>
      </Modal>
    );
  }
);

export default HandwritingInput;

const ss = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#eef2f5' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'transparent' },
  pureSheet: {
    backgroundColor: '#eef2f5',
    width: '100%',
    height: '100%',
    flex: 1,
    overflow: 'hidden',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 44,
  },
});
