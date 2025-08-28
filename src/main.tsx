// Buffer polyfill for browser (gray-matter needs it)
import { Buffer } from 'buffer';
;(window as any).Buffer = (window as any).Buffer || Buffer;
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
