import { useEffect, useRef } from 'react';

export default function Preview({ code, css }) {
  const ref = useRef();

  useEffect(() => {
    const doc = ref.current.contentDocument;
    doc.open();
    doc.write(`<!DOCTYPE html>
<html><head><style>${css}</style></head><body><div id="root"></div><script type="module">
      import React from 'https://esm.sh/react@18';
      import ReactDOM from 'https://esm.sh/react-dom@18';
      ${code}
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(App ? React.createElement(App) : React.createElement('div', null, 'Missing App'));
    <\/script></body></html>`);
    doc.close();
  }, [code, css]);

  return <iframe ref={ref} className="preview-iframe" title="Preview" />;
}