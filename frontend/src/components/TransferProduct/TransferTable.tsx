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

interface Produto {
  id: number;
  nome: string;
  quantidade: number; // quantidade em estoque
  validade?: string; // data de validade
  status?: "ok" | "quase" | "vencido"; // calculado
}

const coresStatus: Record<string, string> = {
  vencido: "#ef4444", // vermelho
  quase: "#f59e0b", // amarelo
  ok: "#22c55e", // verde
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

  // Ordenar: vencidos primeiro, depois quase vencendo, depois ok
  type Status = "vencido" | "quase" | "ok";

 produtosComStatus.sort(
  (
    a: { status?: Status },
    b: { status?: Status }
  ) => {
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

  if (loading) {
    return <p>Carregando produtos...</p>;
  }

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

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {/* BLOCO 1: Tabela */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-4">
        <h4 className="text-xl font-semibold text-black dark:text-white mb-4">
          Estoque de Produtos
        </h4>

        <input
          type="text"
          placeholder="Filtrar por nome do produto"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
          className="mb-4 w-full rounded border border-gray-300 p-2"
        />

        {/* Legenda */}
        <div className="flex gap-4 mb-4 text-sm">
          <span className="px-2 py-1 rounded bg-red-300 dark:bg-red-700">
            Vencido
          </span>
          <span className="px-2 py-1 rounded bg-yellow-300 dark:bg-yellow-600">
            Quase vencendo
          </span>
          <span className="px-2 py-1 rounded bg-green-300 dark:bg-green-700">
            Ok
          </span>
        </div>

        {/* Cabeçalho da tabela */}
        <div className="grid grid-cols-3 border-t border-stroke py-2 px-2 font-medium text-black dark:text-white bg-gray-100 dark:bg-gray-800">
          <p>Nome</p>
          <p>Quantidade</p>
          <p>Validade</p>
        </div>

        {/* Linhas de produtos */}
        {produtosFiltrados.map((produto) => {
          let bg = "";
          if (produto.status === "vencido") bg = "bg-red-300 dark:bg-red-700";
          else if (produto.quantidade >= 100) bg = "bg-green-200 dark:bg-green-700";
          else if (produto.status === "quase") bg = "bg-yellow-200 dark:bg-yellow-600";
          else if (produto.quantidade <= 90) bg = "bg-orange-200 dark:bg-orange-600";

          return (
            <div
              key={produto.id}
              className={`grid grid-cols-3 border-t border-stroke py-2 px-2 text-sm text-black dark:text-white ${bg}`}
            >
              <p>{produto.nome}</p>
              <p>{produto.quantidade}</p>
              <p>
                {produto.validade
                  ? new Date(produto.validade).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          );
        })}

        {produtosFiltrados.length === 0 && (
          <p className="text-center text-gray-500 mt-4">
            Nenhum produto encontrado.
          </p>
        )}
      </div>

      {/* BLOCO 2: Charts */}
      <div className="grid grid-cols-1 gap-4">
        {/* Gráfico de Status */}
        <div className="bg-white p-4 rounded shadow dark:bg-boxdark">
          <h2 className="font-bold mb-2">Distribuição por Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={contagemStatus}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
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
        <div className="bg-white p-4 rounded shadow dark:bg-boxdark">
          <h2 className="font-bold mb-2">Top 10 Estoques Mais Baixos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topBaixoEstoque}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantidade">
                {topBaixoEstoque.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={coresBar[index % coresBar.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Estoque;
