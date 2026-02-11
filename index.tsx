
console.log('🚀 [index.tsx] Arquivo carregado!');

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('🚀 [index.tsx] Imports concluídos');
console.log('🚀 [index.tsx] Procurando elemento #root...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ [index.tsx] Elemento #root não encontrado!');
  throw new Error("Could not find root element to mount to");
}

console.log('✅ [index.tsx] Elemento #root encontrado');
console.log('🚀 [index.tsx] Criando React root...');

const root = ReactDOM.createRoot(rootElement);

console.log('✅ [index.tsx] React root criado');
console.log('🚀 [index.tsx] Renderizando App...');

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('✅ [index.tsx] App renderizado com sucesso!');
