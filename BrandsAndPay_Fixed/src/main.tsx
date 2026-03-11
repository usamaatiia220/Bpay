import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// عرض أي error على الشاشة مباشرةً
window.onerror = (msg, src, line, col, err) => {
  document.body.innerHTML = `<div style="padding:20px;font-family:monospace;background:red;color:white;font-size:14px;direction:ltr">
    <b>ERROR:</b><br>${msg}<br><br>
    <b>File:</b> ${src}<br>
    <b>Line:</b> ${line}:${col}<br><br>
    <b>Stack:</b><br>${err?.stack || 'none'}
  </div>`;
  return false;
};

window.addEventListener('unhandledrejection', (e) => {
  document.body.innerHTML = `<div style="padding:20px;font-family:monospace;background:orange;color:black;font-size:14px;direction:ltr">
    <b>PROMISE ERROR:</b><br>${e.reason}
  </div>`;
});

createRoot(document.getElementById('root')!).render(<App />)
