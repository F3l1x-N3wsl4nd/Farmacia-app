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
import { FiSearch, FiPackage, FiAlertTriangle, FiCheckCircle, FiClock } from "react-icons/fi";

interface Produto {
  id: number;
  nome: string;
  quantidade: number;
  validade?: string;
  status?: "ok" | "quase" | "vencido";
}

const coresStatus: Record<string, string> = {
  vencido: "#ef4444",
  quase: "#f59e0b",
  ok: "#22c55e",
};

const coresBar = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f97316"];

const Estoque = () => {
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

        const hoje = new Date();
        const produtosComStatus = (response.data || []).map((p: Produto) => {
          let status: "ok" | "quase" | "vencido" = "ok";
          if (p.validade) {
            const validade = new Date(p.validade);
            const diasRestantes =
              (validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);
            if (diasRestantes < 0) status = "vencido";
            else if (diasRestantes <= 30) status = "quase";
          }
          return { ...p, status };
        });

        type Status = "vencido" | "quase" | "ok";

        produtosComStatus.sort(
          (a: { status?: Status }, b: { status?: Status }) => {
            const ordem: Record<Status, number> = {
              vencido: 0,
              quase: 1,
              ok: 2,
            };
            return ordem[a.status ?? "ok"] - ordem[b.status ?? "ok"];
          }
        );

        setProdutos(produtosComStatus);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setLoading(false);
      }
    };

    buscarProdutos();
  }, []);

  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(filtroNome.toLowerCase())
  );

  // Contagem por status
  const contagemStatus = [
    { name: "Vencido", value: produtos.filter((p) => p.status === "vencido").length },
    { name: "Quase vencendo", value: produtos.filter((p) => p.status === "quase").length },
    { name: "Ok", value: produtos.filter((p) => p.status === "ok").length },
  ];

  // Top 10 com menor estoque
  const topBaixoEstoque = [...produtos]
    .sort((a, b) => a.quantidade - b.quantidade)
    .slice(0, 10);

  const totalProdutos = produtos.length;
  const produtosVencidos = produtos.filter(p => p.status === "vencido").length;
  const produtosQuase = produtos.filter(p => p.status === "quase").length;
  const produtosOk = produtos.filter(p => p.status === "ok").length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando estoque...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <FiPackage className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Controle de Estoque</h2>
            <p className="text-emerald-100 text-sm mt-1">
              Monitore a validade e quantidade dos medicamentos
            </p>
          </div>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-boxdark rounded-lg p-4 shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Produtos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalProdutos}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
              <FiPackage className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-boxdark rounded-lg p-4 shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Vencidos</p>
              <p className="text-2xl font-bold text-red-600">{produtosVencidos}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3">
              <FiAlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-boxdark rounded-lg p-4 shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Quase Vencendo</p>
              <p className="text-2xl font-bold text-yellow-600">{produtosQuase}</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-full p-3">
              <FiClock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-boxdark rounded-lg p-4 shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ok</p>
              <p className="text-2xl font-bold text-green-600">{produtosOk}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* BLOCO 1: Tabela */}
        <div className="rounded-xl bg-white shadow-xl dark:bg-boxdark border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-boxdark p-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-black dark:text-white">
              Produtos em Estoque
            </h4>
            
            <div className="relative mt-3">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Filtrar por nome do produto..."
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Legenda melhorada */}
          <div className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Vencido</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Quase vencendo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Ok</span>
            </div>
          </div>

          {/* Cabeçalho da tabela */}
          <div className="grid grid-cols-3 border-b border-gray-200 dark:border-gray-700 py-3 px-4 bg-gray-50 dark:bg-gray-800">
            <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Nome</p>
            <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Quantidade</p>
            <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Validade</p>
          </div>

          {/* Linhas de produtos */}
          <div className="max-h-[500px] overflow-y-auto">
            {produtosFiltrados.map((produto) => {
              let bgClass = "";
              let statusText = "";
              if (produto.status === "vencido") {
                bgClass = "bg-red-50 dark:bg-red-900/20";
                statusText = "Vencido";
              } else if (produto.status === "quase") {
                bgClass = "bg-yellow-50 dark:bg-yellow-900/20";
                statusText = "Quase vencendo";
              } else {
                bgClass = "hover:bg-gray-50 dark:hover:bg-gray-800/50";
              }

              return (
                <div
                  key={produto.id}
                  className={`grid grid-cols-3 border-b border-gray-100 dark:border-gray-800 py-3 px-4 text-sm transition-colors ${bgClass}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      produto.status === "vencido" ? "bg-red-500" :
                      produto.status === "quase" ? "bg-yellow-500" : "bg-green-500"
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
                  <div className="text-gray-600 dark:text-gray-400">
                    {produto.validade
                      ? new Date(produto.validade).toLocaleDateString()
                      : "-"}
                    {statusText && (
                      <span className="ml-2 text-xs px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700">
                        {statusText}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {produtosFiltrados.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum produto encontrado.</p>
            </div>
          )}
        </div>

        {/* BLOCO 2: Charts */}
        <div className="grid grid-cols-1 gap-6">
          {/* Gráfico de Status */}
          <div className="rounded-xl bg-white shadow-xl dark:bg-boxdark border-0 overflow-hidden p-4">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-green-500 rounded-full"></div>
              Distribuição por Status
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contagemStatus}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {contagemStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={coresStatus[entry.name.toLowerCase()] || "#ccc"} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Estoque Baixo */}
          <div className="rounded-xl bg-white shadow-xl dark:bg-boxdark border-0 overflow-hidden p-4">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              Top 10 Produtos com Menor Estoque
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topBaixoEstoque} margin={{ left: 20, right: 20, bottom: 50 }}>
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
                <Bar dataKey="quantidade" name="Quantidade em Estoque" radius={[4, 4, 0, 0]}>
                  {topBaixoEstoque.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={coresBar[index % coresBar.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estoque;