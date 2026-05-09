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
  quantidade: number;
  validade: string;
}

const cores = {
  expirado: "#ef4444", // vermelho
  quase: "#f59e0b", // amarelo
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
    return <p>Carregando produtos...</p>;
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

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {/* BLOCO 1: Tabela */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-4">
        <h4 className="text-xl font-semibold text-black dark:text-white mb-4">
          Produtos Expirados ou Próximos da Validade
        </h4>

        <input
          type="text"
          placeholder="Filtrar por nome do produto"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
          className="mb-4 w-full rounded border border-gray-300 p-2"
        />

        {/* Cabeçalho */}
        <div className="grid grid-cols-3 border-t border-stroke py-2 px-2 font-medium text-black dark:text-white bg-gray-100 dark:bg-gray-800">
          <p>Nome</p>
          <p>Quantidade</p>
          <p>Validade</p>
        </div>

        {/* Linhas */}
        {produtosCriticos.map((produto) => {
          const bg =
            produto.status === "expirado"
              ? "bg-red-200 dark:bg-red-700 font-bold"
              : "bg-yellow-200 dark:bg-yellow-700 font-bold";

          return (
            <div
              key={produto.id}
              className={`grid grid-cols-3 border-t border-stroke py-2 px-2 text-sm text-black dark:text-white ${bg}`}
            >
              <p>{produto.nome}</p>
              <p>{produto.quantidade}</p>
              <p>{produto.validade.toLocaleDateString()}</p>
            </div>
          );
        })}

        {produtosCriticos.length === 0 && (
          <p className="text-center text-gray-500 mt-4">
            Nenhum produto expirado ou próximo da validade.
          </p>
        )}
      </div>

      {/* BLOCO 2: Charts */}
      <div className="grid grid-cols-1 gap-4">
        {/* Gráfico de Status */}
        <div className="bg-white p-4 rounded shadow dark:bg-boxdark">
          <h2 className="font-bold mb-2">Distribuição</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={contagem}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {contagem.map((entry, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={entry.name === "Expirados" ? cores.expirado : cores.quase}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de produtos mais críticos */}
        <div className="bg-white p-4 rounded shadow dark:bg-boxdark">
          <h2 className="font-bold mb-2">Top 10 Produtos Críticos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCriticos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantidade" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProdutosQuaseExpirar;
