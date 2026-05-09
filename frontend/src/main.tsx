import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
import App from './App';
import './css/style.css';
import './css/satoshi.css';
import 'jsvectormap/dist/jsvectormap.css';
import 'flatpickr/dist/flatpickr.min.css';
import { AuthProvider } from './utils/AuthContext';

console.log(" O React foi carregado pelo Electron!");

const rootElement = document.getElementById('root');

if (!rootElement) {
  alert("Erro fatal: Elemento root não encontrado no HTML!");
} else {
  ReactDOM.createRoot(rootElement as HTMLElement).render(
    // REMOVEMOS O STRICT MODE PARA TESTE
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  );
}
