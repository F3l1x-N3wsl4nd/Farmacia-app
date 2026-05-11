import React, { useEffect, useState } from 'react';
import { alertService, Alerta } from '../../services/alertService';
import { FiBell, FiAlertTriangle, FiPackage, FiClock, FiX, FiCheck } from 'react-icons/fi';
import { GiHealthPill, GiMedicines } from 'react-icons/gi';

const AlertBadge: React.FC = () => {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Inscrever para receber atualizações
    const unsubscribe = alertService.subscribe(setAlertas);
    
    // Iniciar verificação de alertas
    alertService.iniciarVerificacao();
    
    return () => {
      unsubscribe();
      alertService.pararVerificacao();
    };
  }, []);

  const alertasNaoLidos = alertas.filter(a => !a.lida);
  const alertasGraves = alertasNaoLidos.filter(a => a.gravidade === 'alta');

  const getIconePorTipo = (tipo: string) => {
    switch (tipo) {
      case 'expirado':
        return <FiAlertTriangle className="w-5 h-5 text-red-500" />;
      case 'quase_expirado':
        return <FiClock className="w-5 h-5 text-yellow-500" />;
      case 'estoque_baixo':
        return <FiPackage className="w-5 h-5 text-orange-500" />;
      case 'baixa_rotatividade':
        return <GiHealthPill className="w-5 h-5 text-blue-500" />;
      default:
        return <FiBell className="w-5 h-5" />;
    }
  };

  const getCorPorGravidade = (gravidade: string) => {
    switch (gravidade) {
      case 'alta':
        return 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'media':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div className="relative">
      {/* Botão do sino */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors"
      >
        <FiBell className="w-6 h-6" />
        {alertasNaoLidos.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {alertasNaoLidos.length}
          </span>
        )}
      </button>

      {/* Dropdown de alertas */}
      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Alertas do Sistema
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {alertasNaoLidos.length} não lidos • {alertasGraves.length} críticos
                </p>
              </div>
              {alertasNaoLidos.length > 0 && (
                <button
                  onClick={() => alertService.marcarTodosLidos()}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Marcar todos como lidos
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {alertas.length === 0 ? (
                <div className="p-8 text-center">
                  <FiCheck className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">Nenhum alerta no momento</p>
                  <p className="text-sm text-gray-400 mt-1">Tudo está em ordem!</p>
                </div>
              ) : (
                alertas.map((alerta) => (
                  <div
                    key={alerta.id}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 ${getCorPorGravidade(alerta.gravidade)} ${!alerta.lida ? 'bg-opacity-100' : 'opacity-60'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {getIconePorTipo(alerta.tipo)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {alerta.mensagem}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {alerta.data.toLocaleTimeString()}
                        </p>
                        {alerta.dias_restantes && (
                          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                            {alerta.dias_restantes} dias restantes
                          </span>
                        )}
                        {alerta.quantidade !== undefined && alerta.quantidade > 0 && (
                          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 ml-2">
                            Estoque: {alerta.quantidade} un
                          </span>
                        )}
                      </div>
                      {!alerta.lida && (
                        <button
                          onClick={() => alertService.marcarComoLido(alerta.id)}
                          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 text-center border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => alertService.buscarAlertas()}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Verificar novos alertas
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AlertBadge;