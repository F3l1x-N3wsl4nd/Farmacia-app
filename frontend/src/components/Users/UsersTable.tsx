import { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { 
  FiSearch, 
  FiUser, 
  FiUsers, 
  FiDollarSign, 
  FiCreditCard, 
  FiCalendar,
  FiDownload,
  FiBarChart2,
  FiPieChart
} from "react-icons/fi";
import { FaReceipt } from "react-icons/fa";

interface Venda {
  id: number;
  cliente: string;
  funcionario: string;
  total: number;
  metodoPagamento: string;
  createdAt: string;
}

const cores = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

const ListaVendas = () => {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroFuncionario, setFiltroFuncionario] = useState("");

  useEffect(() => {
    const buscarVendas = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/api/vendas", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setVendas(response.data);
      } catch (error) {
        console.error("Erro ao buscar vendas:", error);
      } finally {
        setLoading(false);
      }
    };

    buscarVendas();
  }, []);

  // Filtros
  const vendasFiltradas = vendas.filter(
    (venda) =>
      venda.cliente.toLowerCase().includes(filtroCliente.toLowerCase()) &&
      venda.funcionario.toLowerCase().includes(filtroFuncionario.toLowerCase())
  );

  // Funções auxiliares de data
  const isHoje = (d: Date) => {
    const hoje = new Date();
    return (
      d.getDate() === hoje.getDate() &&
      d.getMonth() === hoje.getMonth() &&
      d.getFullYear() === hoje.getFullYear()
    );
  };
  const isEstaSemana = (d: Date) => {
    const hoje = new Date();
    const primeiroDia = new Date(hoje);
    primeiroDia.setDate(hoje.getDate() - hoje.getDay());
    const ultimoDia = new Date(primeiroDia);
    ultimoDia.setDate(primeiroDia.getDate() + 6);
    return d >= primeiroDia && d <= ultimoDia;
  };
  const isEsteMes = (d: Date) => {
    const hoje = new Date();
    return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
  };

  // Totais por funcionário
  const totaisPorFuncionario = vendas.reduce((acc, venda) => {
    const f = venda.funcionario || "Desconhecido";
    const dataVenda = new Date(venda.createdAt);
    if (!acc[f]) acc[f] = { diario: 0, semanal: 0, mensal: 0, geral: 0 };
    acc[f].geral += venda.total;
    if (isHoje(dataVenda)) acc[f].diario += venda.total;
    if (isEstaSemana(dataVenda)) acc[f].semanal += venda.total;
    if (isEsteMes(dataVenda)) acc[f].mensal += venda.total;
    return acc;
  }, {} as Record<string, { diario: number; semanal: number; mensal: number; geral: number }>);

  // Dados para gráficos
  const dadosBarra = Object.entries(totaisPorFuncionario).map(([funcionario, t]) => ({
    funcionario,
    diário: t.diario,
    semanal: t.semanal,
    mensal: t.mensal,
    geral: t.geral,
  }));
  const dadosPizza = Object.entries(totaisPorFuncionario).map(([funcionario, t]) => ({
    name: funcionario,
    value: t.geral,
  }));

  // Total Geral filtrado
  const totalGeral = vendasFiltradas.reduce((acc, v) => acc + v.total, 0);

  // Estatísticas adicionais
  const totalVendas = vendasFiltradas.length;
  const ticketMedio = totalVendas > 0 ? totalGeral / totalVendas : 0;
  const metodoPagamentoStats = vendasFiltradas.reduce((acc, v) => {
    acc[v.metodoPagamento] = (acc[v.metodoPagamento] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const gerarRecibo = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/api/vendas/${id}/recibo`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `recibo-venda-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao gerar recibo:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando vendas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <FiBarChart2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Histórico de Vendas</h2>
            <p className="text-blue-100 text-sm mt-1">
              Acompanhe todas as transações realizadas na farmácia
            </p>
          </div>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-boxdark rounded-lg p-4 shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total de Vendas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalVendas}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
              <FiDollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-boxdark rounded-lg p-4 shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Valor Total</p>
              <p className="text-2xl font-bold text-green-600">
                {totalGeral.toLocaleString("pt-AO")} Kz
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
              <FiDollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-boxdark rounded-lg p-4 shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ticket Médio</p>
              <p className="text-2xl font-bold text-purple-600">
                {ticketMedio.toLocaleString("pt-AO")} Kz
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-3">
              <FiCreditCard className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark rounded-lg p-4 shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Método Mais Usado</p>
              <p className="text-lg font-bold text-orange-600 truncate">
                {Object.entries(metodoPagamentoStats).sort((a,b) => b[1] - a[1])[0]?.[0] || '-'}
              </p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full p-3">
              <FiCreditCard className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-boxdark rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <FiSearch className="w-4 h-4" />
          Filtros de Busca
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Filtrar por cliente..."
              value={filtroCliente}
              onChange={(e) => setFiltroCliente(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Filtrar por funcionário..."
              value={filtroFuncionario}
              onChange={(e) => setFiltroFuncionario(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfico de Barras */}
        <div className="bg-white dark:bg-boxdark rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
            Totais por Funcionário
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosBarra}>
              <XAxis dataKey="funcionario" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                formatter={(value) => [`${Number(value).toLocaleString("pt-AO")} Kz`, '']}
              />
              <Legend />
              <Bar dataKey="diário" fill="#3b82f6" name="Diário" radius={[4, 4, 0, 0]} />
              <Bar dataKey="semanal" fill="#22c55e" name="Semanal" radius={[4, 4, 0, 0]} />
              <Bar dataKey="mensal" fill="#f59e0b" name="Mensal" radius={[4, 4, 0, 0]} />
              <Bar dataKey="geral" fill="#8b5cf6" name="Geral" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Pizza */}
        <div className="bg-white dark:bg-boxdark rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
            Distribuição por Funcionário
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosPizza}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {dadosPizza.map((_, i) => (
                  <Cell key={i} fill={cores[i % cores.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none' }}
                formatter={(value) => [`${Number(value).toLocaleString("pt-AO")} Kz`, 'Total']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela de Vendas */}
      <div className="bg-white dark:bg-boxdark rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-boxdark px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FiCalendar className="w-4 h-4" />
            Lista de Transações
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Funcionário</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Método</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Data</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {vendasFiltradas.map((venda, index) => (
                <tr
                  key={venda.id}
                  className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                    index % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-gray-50/50 dark:bg-gray-800/30'
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <FiUser className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{venda.cliente}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{venda.funcionario}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {venda.total.toLocaleString("pt-AO")} Kz
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      {venda.metodoPagamento}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {new Date(venda.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => gerarRecibo(venda.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-all text-xs font-medium"
                    >
                      <FaReceipt className="w-3 h-3" />
                      Recibo PDF
                    </button>
                  </td>
                </tr>
              ))}
              {vendasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <FiSearch className="w-12 h-12 text-gray-300 mb-2" />
                      <p className="text-gray-500">Nenhuma venda encontrada</p>
                      <p className="text-gray-400 text-sm mt-1">Tente ajustar os filtros de busca</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListaVendas;