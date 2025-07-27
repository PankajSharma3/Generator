import { useEffect, useRef } from 'react';

export default function Preview({ jsx, css }) {
  const iframeRef = useRef();

  useEffect(() => {
    const doc = iframeRef.current.contentDocument;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><style>${css}</style></head><body id="root"></body><script type="module" crossorigin>import React from 'https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js';import ReactDOM from 'https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js';const Component = (()=>{${jsx}\nreturn exports.default;})();ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(Component));</script></html>`);
    doc.close();
  }, [jsx, css]);

  return <iframe title="preview" ref={iframeRef} className="preview-frame" />;
}