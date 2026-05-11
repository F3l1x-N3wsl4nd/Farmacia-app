import { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { FiSearch, FiAlertTriangle, FiClock, FiPackage, FiCalendar } from "react-icons/fi";

interface Produto {
  id: number;
  nome: string;
  quantidade: number;
  validade: string;
}

const cores = {
  expirado: "#ef4444",
  quase: "#f59e0b",
};

const ProdutosQuaseExpirar = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroNome, setFiltroNome] = useState("");

  useEffect(() => {
    const buscarProdutos = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/api/medicamentos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProdutos(response.data || []);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setLoading(false);
      }
    };

    buscarProdutos();
  }, []);

  const hoje = new Date();
  const trintaDias = new Date();
  trintaDias.setDate(hoje.getDate() + 30);

  // Filtra produtos expirados ou quase a expirar
  const produtosCriticos = produtos
    .map((p) => {
      const validade = new Date(p.validade);
      let status: "expirado" | "quase" = "quase";
      if (validade < hoje) status = "expirado";
      return { ...p, validade, status };
    })
    .filter((p) => p.validade < trintaDias)
    .filter((p) =>
      p.nome.toLowerCase().includes(filtroNome.toLowerCase())
    );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  // Dados para PieChart
  const contagem = [
    { name: "Expirados", value: produtosCriticos.filter((p) => p.status === "expirado").length },
    { name: "Quase a expirar", value: produtosCriticos.filter((p) => p.status === "quase").length },
  ];

  // Top 10 mais críticos (validade mais próxima)
  const topCriticos = [...produtosCriticos]
    .sort((a, b) => a.validade.getTime() - b.validade.getTime())
    .slice(0, 10);

  const totalCriticos = produtosCriticos.length;
  const totalExpirados = produtosCriticos.filter(p => p.status === "expirado").length;
  const totalQuase = produtosCriticos.filter(p => p.status === "quase").length;

  return (
    <div className="p-4">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-6 py-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <FiAlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Produtos com Validade Próxima</h2>
            <p className="text-orange-100 text-sm mt-1">
              Acompanhe medicamentos expirados ou que vencem nos próximos 30 dias
            </p>
          </div>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-boxdark rounded-lg p-4 shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Críticos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCriticos}</p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full p-3">
              <FiAlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-boxdark rounded-lg p-4 shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Expirados</p>
              <p className="text-2xl font-bold text-red-600">{totalExpirados}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3">
              <FiClock className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-boxdark rounded-lg p-4 shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Quase Vencendo</p>
              <p className="text-2xl font-bold text-yellow-600">{totalQuase}</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-full p-3">
              <FiCalendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* BLOCO 1: Tabela */}
        <div className="rounded-xl bg-white shadow-xl dark:bg-boxdark border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-boxdark p-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-black dark:text-white">
              Produtos Expirados ou Próximos da Validade
            </h4>
            
            <div className="relative mt-3">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Filtrar por nome do produto..."
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Legenda */}
          <div className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Expirado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Quase a expirar (30 dias)</span>
            </div>
          </div>

          {/* Cabeçalho */}
          <div className="grid grid-cols-3 border-b border-gray-200 dark:border-gray-700 py-3 px-4 bg-gray-50 dark:bg-gray-800">
            <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Nome</p>
            <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Quantidade</p>
            <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Validade</p>
          </div>

          {/* Linhas */}
          <div className="max-h-[500px] overflow-y-auto">
            {produtosCriticos.map((produto) => {
              const bgClass = produto.status === "expirado"
                ? "bg-red-50 dark:bg-red-900/20"
                : "bg-yellow-50 dark:bg-yellow-900/20";
              
              const diasRestantes = Math.ceil(
                (produto.validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={produto.id}
                  className={`grid grid-cols-3 border-b border-gray-100 dark:border-gray-800 py-3 px-4 text-sm transition-colors ${bgClass}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      produto.status === "expirado" ? "bg-red-500" : "bg-yellow-500"
                    }`}></div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {produto.nome}
                    </span>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      produto.quantidade === 0 ? "bg-red-100 text-red-700" :
                      produto.quantidade <= 10 ? "bg-yellow-100 text-yellow-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {produto.quantidade} und
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${
                      produto.status === "expirado" ? "text-red-600" : "text-yellow-600"
                    }`}>
                      {produto.validade.toLocaleDateString()}
                    </span>
                    {produto.status === "quase" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                        {diasRestantes} dias
                      </span>
                    )}
                    {produto.status === "expirado" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        Expirado
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {produtosCriticos.length === 0 && (
            <div className="text-center py-8">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-full p-4 inline-flex mb-3">
                <FiPackage className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-gray-500">Nenhum produto expirado ou próximo da validade.</p>
              <p className="text-gray-400 text-sm mt-1">Todos os produtos estão com validade em dia!</p>
            </div>
          )}
        </div>

        {/* BLOCO 2: Charts */}
        <div className="grid grid-cols-1 gap-6">
          {/* Gráfico de Status */}
          <div className="rounded-xl bg-white shadow-xl dark:bg-boxdark border-0 overflow-hidden p-4">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
              Distribuição por Status
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contagem}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {contagem.map((entry, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={entry.name === "Expirados" ? cores.expirado : cores.quase}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de produtos mais críticos */}
          <div className="rounded-xl bg-white shadow-xl dark:bg-boxdark border-0 overflow-hidden p-4">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-red-500 rounded-full"></div>
              Top 10 Produtos Mais Críticos
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCriticos} margin={{ left: 20, right: 20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="nome" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tick={{ fontSize: 11 }}
                />
                <YAxis />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${value} unidades`, 'Quantidade']}
                />
                <Legend />
                <Bar 
                  dataKey="quantidade" 
                  name="Quantidade em Estoque"
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProdutosQuaseExpirar;