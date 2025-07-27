import { useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx.min';
import 'prismjs/themes/prism.css';

export default function CodeTabs({ jsx, css }) {
  const [tab, setTab] = useState('JSX');
  const code = tab === 'JSX' ? jsx : css;

  const copy = () => navigator.clipboard.writeText(code);
  const download = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `component.${tab.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="code-tabs">
      <div className="tab-buttons">
        {['JSX', 'CSS'].map((t) => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
        <button onClick={copy}>Copy</button>
        <button onClick={download}>Download</button>
      </div>
      <pre className="code-block" dangerouslySetInnerHTML={{ __html: Prism.highlight(code, Prism.languages.jsx, 'jsx') }} />
    </div>
  );
}