import { useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import cssLang from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import docco from 'react-syntax-highlighter/dist/esm/styles/hljs/docco';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('css', cssLang);

export default function CodeTabs({ code, css }) {
  const [tab, setTab] = useState('code');

  const downloadZip = async () => {
    const zip = new JSZip();
    zip.file('Component.jsx', code);
    zip.file('styles.css', css);
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'component.zip');
  };

  return (
    <div className="code-tabs">
      <div className="tab-buttons">
        <button onClick={() => setTab('code')} className={tab === 'code' ? 'active' : ''}>
          JSX
        </button>
        <button onClick={() => setTab('css')} className={tab === 'css' ? 'active' : ''}>
          CSS
        </button>
        <button onClick={downloadZip}>Download ZIP</button>
      </div>
      <SyntaxHighlighter language={tab === 'code' ? 'javascript' : 'css'} style={docco} wrapLongLines>
        {tab === 'code' ? code : css}
      </SyntaxHighlighter>
    </div>
  );
}