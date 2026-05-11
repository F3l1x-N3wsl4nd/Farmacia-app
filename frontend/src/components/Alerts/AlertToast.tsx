import React, { useEffect, useState } from 'react';
import { alertService, Alerta } from '../../services/alertService';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const AlertToast: React.FC = () => {
  const [alertasRecentes, setAlertasRecentes] = useState<Alerta[]>([]);

  useEffect(() => {
    let ultimosIds = new Set<string>();

    const unsubscribe = alertService.subscribe((alertas) => {
      // Verificar novos alertas não lidos
      const novos = alertas.filter(a => !a.lida && !ultimosIds.has(a.id));
      
      if (novos.length > 0) {
        setAlertasRecentes(prev => [...novos, ...prev].slice(0, 3));
        
        // Adicionar aos IDs processados
        novos.forEach(a => ultimosIds.add(a.id));
        
        // Remover após 8 segundos
        setTimeout(() => {
          setAlertasRecentes(prev => prev.filter(a => !novos.includes(a)));
        }, 8000);
      }
    });

    return () => unsubscribe();
  }, []);

  const getCorAlerta = (gravidade: string) => {
    switch (gravidade) {
      case 'alta':
        return 'bg-red-500 border-l-4 border-l-red-700';
      case 'media':
        return 'bg-yellow-500 border-l-4 border-l-yellow-700';
      default:
        return 'bg-blue-500 border-l-4 border-l-blue-700';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {alertasRecentes.map((alerta) => (
        <div
          key={alerta.id}
          className={`${getCorAlerta(alerta.gravidade)} text-white rounded-lg shadow-lg p-4 min-w-[300px] max-w-md animate-slide-in`}
        >
          <div className="flex items-start gap-3">
            <FiAlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">{alerta.mensagem}</p>
              <p className="text-xs opacity-90 mt-1">
                {alerta.data.toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => setAlertasRecentes(prev => prev.filter(a => a.id !== alerta.id))}
              className="flex-shrink-0 hover:opacity-70"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertToast;