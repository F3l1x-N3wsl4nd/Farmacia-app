import { useEffect, useState } from 'react';
import api from '../../utils/api';
import SelectGroupAgencyAndMonth from './Filters/SelectGroupAgencyAndMonths';
import { Dialog, DialogContent, Stack, Box } from '@mui/material';
import { 
  FiPackage, 
  FiAlertCircle, 
  FiDollarSign, 
  FiCalendar, 
  FiTrendingDown,
  FiShoppingBag,
  FiClock,
  FiHash,
  FiTag
} from 'react-icons/fi';
import { GiHealthPotion, GiMedicines, GiPill, GiSyringe } from 'react-icons/gi';

interface UnboughtProduct {
  id: number;
  nome_produto: string;
  codigo: string;
  categoria: string;
  estoque_atual: number;
  preco: number;
  ultima_venda?: string;
  dias_sem_venda: number;
  laboratorio?: string;
  validade?: string;
}

const ProductByMonthAndAgencyTable = () => {
  const [unboughtProducts, setUnboughtProducts] = useState<UnboughtProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<number | string>(0);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<UnboughtProduct | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchUnboughtProducts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        let url = '/api/vendas/produtos-nao-vendidos';
        
        const params = new URLSearchParams();
        
        if (selectedAgency && selectedAgency !== 0 && selectedAgency !== -1) {
          params.append('agencyId', selectedAgency.toString());
        }
        
        if (selectedMonth) {
          params.append('month', selectedMonth);
        }
        
        const finalUrl = params.toString() 
          ? `${url}?${params.toString()}`
          : url;
        
        const response = await api.get(finalUrl, { headers });
        setUnboughtProducts(response.data);
      } catch (error) {
        console.error('Erro ao buscar produtos não vendidos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnboughtProducts();
  }, [selectedAgency, selectedMonth]);

  const handleAgencyChange = (agency: number | string) => {
    setSelectedAgency(agency);
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  const getRiskLevel = (days: number) => {
    if (days > 60) return { label: 'Crítico', color: 'bg-red-500', textColor: 'text-red-600', icon: <FiAlertCircle className="w-4 h-4" /> };
    if (days > 30) return { label: 'Alto', color: 'bg-orange-500', textColor: 'text-orange-600', icon: <FiTrendingDown className="w-4 h-4" /> };
    if (days > 15) return { label: 'Médio', color: 'bg-yellow-500', textColor: 'text-yellow-600', icon: <FiClock className="w-4 h-4" /> };
    return { label: 'Baixo', color: 'bg-green-500', textColor: 'text-green-600', icon: <FiPackage className="w-4 h-4" /> };
  };

  const totalStockValue = unboughtProducts.reduce((sum, p) => sum + (p.estoque_atual * p.preco), 0);
  const averageDays = unboughtProducts.length > 0 
    ? Math.round(unboughtProducts.reduce((sum, p) => sum + p.dias_sem_venda, 0) / unboughtProducts.length)
    : 0;

  return (
    <>
      <div className="rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-boxdark dark:to-boxdark-2 shadow-2xl border-0 overflow-hidden">
        
        {/* Header com gradiente e ícone */}
        <div className="relative bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-800 dark:to-emerald-900 px-6 py-6">
          <div className="absolute right-0 top-0 opacity-10">
            <GiHealthPotion className="w-32 h-32 text-white" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <GiMedicines className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Produtos com Baixa Rotatividade</h2>
            </div>
            <p className="text-emerald-100 text-sm">
              Produtos que não apresentam vendas no período selecionado. Atenção ao estoque parado!
            </p>
          </div>
        </div>

        {/* Filtros estilizados */}
        <Box sx={{ p: 4, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filtrar por Farmácia e Período
              </label>
              <SelectGroupAgencyAndMonth 
                onChange={handleAgencyChange} 
                onMonthChange={handleMonthChange}
              />
            </div>
            
            {/* Cards de estatísticas rápidas */}
            {unboughtProducts.length > 0 && (
              <div className="flex gap-3">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-2 border border-red-200 dark:border-red-800">
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">⚠️ Críticos</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {unboughtProducts.filter(p => p.dias_sem_venda > 60).length}
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-4 py-2 border border-yellow-200 dark:border-yellow-800">
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">⚡ Atenção</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    {unboughtProducts.filter(p => p.dias_sem_venda > 30 && p.dias_sem_venda <= 60).length}
                  </p>
                </div>
              </div>
            )}
          </Stack>
        </Box>

        {/* Loading aprimorado */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <GiPill className="w-6 h-6 text-emerald-600 animate-pulse" />
                </div>
              </div>
              <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                Carregando produtos...
              </p>
            </div>
          </div>
        ) : unboughtProducts.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center max-w-md">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-full p-6 inline-flex mb-4">
                <FiShoppingBag className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Nenhum produto parado!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Todos os produtos estão com boa rotatividade no período selecionado. 
                Continue acompanhando as vendas!
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Cards de resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-boxdark">
              <div className="bg-white dark:bg-boxdark rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total de Produtos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {unboughtProducts.length}
                    </p>
                  </div>
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-3">
                    <FiPackage className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-boxdark rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Capital Parado</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                      {new Intl.NumberFormat('pt-AO', { 
                        style: 'currency', 
                        currency: 'AOA',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(totalStockValue)}
                    </p>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3">
                    <FiDollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-boxdark rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Média sem Vendas</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {averageDays} dias
                    </p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
                    <FiCalendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela moderna com cards responsivos */}
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <th className="py-4 px-6 text-left">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        <GiPill className="w-4 h-4" />
                        Produto
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        <FiHash className="w-4 h-4" />
                        Código
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        <FiTag className="w-4 h-4" />
                        Categoria
                      </div>
                    </th>
                    <th className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        <FiPackage className="w-4 h-4" />
                        Estoque
                      </div>
                    </th>
                    <th className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        <FiDollarSign className="w-4 h-4" />
                        Preço
                      </div>
                    </th>
                    <th className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        <FiClock className="w-4 h-4" />
                        Risco
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {unboughtProducts.map((product, index) => {
                    const risk = getRiskLevel(product.dias_sem_venda);
                    return (
                      <tr 
                        key={index}
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowDetails(true);
                        }}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer group"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                              <GiSyringe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-sm">
                                {product.nome_produto}
                              </p>
                              {product.laboratorio && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {product.laboratorio}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                            {product.codigo}
                          </code>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {product.categoria}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-1 font-semibold ${
                            product.estoque_atual > 50 
                              ? 'text-red-600 dark:text-red-400' 
                              : product.estoque_atual > 20
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-yellow-600 dark:text-yellow-400'
                          }`}>
                            <FiPackage className="w-3 h-3" />
                            {product.estoque_atual} un.
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {new Intl.NumberFormat('pt-AO', { 
                              style: 'currency', 
                              currency: 'AOA',
                              minimumFractionDigits: 0
                            }).format(product.preco)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${risk.textColor} bg-opacity-10 bg-${risk.color.replace('bg-', '')}`}>
                              {risk.icon}
                              {product.dias_sem_venda} dias
                            </div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${risk.textColor} bg-opacity-10`}>
                              {risk.label}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer com recomendações */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 p-4 border-t border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="bg-yellow-500 rounded-full p-2">
                    <FiAlertCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-1">
                    Recomendações da Farmácia
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-500">
                    • Considere promover descontos para produtos com mais de 30 dias sem venda.<br />
                    • Verifique a validade dos produtos críticos (acima de 60 dias).<br />
                    • Analise a possibilidade de transferência entre filiais.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de detalhes do produto */}
      <Dialog 
        open={showDetails} 
        onClose={() => setShowDetails(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedProduct && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-xl">
                    <GiMedicines className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedProduct.nome_produto}
                  </h3>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3 mt-6">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Código</span>
                  <span className="font-mono text-sm font-semibold">{selectedProduct.codigo}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Categoria</span>
                  <span className="text-sm font-semibold">{selectedProduct.categoria}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Estoque Atual</span>
                  <span className="text-sm font-semibold text-orange-600">{selectedProduct.estoque_atual} unidades</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Preço Unitário</span>
                  <span className="text-sm font-semibold">
                    {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(selectedProduct.preco)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-500">Dias sem Venda</span>
                  <span className={`text-sm font-bold ${getRiskLevel(selectedProduct.dias_sem_venda).textColor}`}>
                    {selectedProduct.dias_sem_venda} dias
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductByMonthAndAgencyTable;