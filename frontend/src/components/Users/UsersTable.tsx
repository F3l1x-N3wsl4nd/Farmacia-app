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

interface Venda {
  id: number;
  cliente: string;
  funcionario: string;
  total: number;
  metodoPagamento: string;
  createdAt: string;
}

const cores = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

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

  if (loading) return <p>Carregando vendas...</p>;

  return (
    <div className="rounded-sm border border-stroke bg-white dark:border-strokedark dark:bg-boxdark p-4">
      <h4 className="text-xl font-semibold text-black dark:text-white mb-4">
        Histórico de Vendas
      </h4>

      {/* Filtros */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          placeholder="Filtrar por cliente"
          value={filtroCliente}
          onChange={(e) => setFiltroCliente(e.target.value)}
          className="rounded border border-gray-300 p-2"
        />
        <input
          type="text"
          placeholder="Filtrar por funcionário"
          value={filtroFuncionario}
          onChange={(e) => setFiltroFuncionario(e.target.value)}
          className="rounded border border-gray-300 p-2"
        />
      </div>

      {/* Total Geral */}
      <div className="mb-6 p-3 rounded bg-green-100 dark:bg-green-700 text-green-800 dark:text-green-200 font-bold">
        Total Geral (filtrado): {totalGeral.toLocaleString("pt-AO")} Kz
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Barras */}
        <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800">
          <h5 className="font-semibold mb-2">Totais por Funcionário</h5>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dadosBarra}>
              <XAxis dataKey="funcionario" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="diário" fill="#3b82f6" />
              <Bar dataKey="semanal" fill="#22c55e" />
              <Bar dataKey="mensal" fill="#f59e0b" />
              <Bar dataKey="geral" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pizza */}
        <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800">
          <h5 className="font-semibold mb-2">Distribuição Geral</h5>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dadosPizza}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {dadosPizza.map((_, i) => (
                  <Cell key={i} fill={cores[i % cores.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white">
            <tr>
              <th className="px-2 py-2 text-left">Cliente</th>
              <th className="px-2 py-2 text-left">Funcionário</th>
              <th className="px-2 py-2 text-left">Total (Kz)</th>
              <th className="px-2 py-2 text-left">Método</th>
              <th className="px-2 py-2 text-left">Data</th>
              <th className="px-2 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {vendasFiltradas.map((venda) => (
              <tr
                key={venda.id}
                className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-2 py-2">{venda.cliente}</td>
                <td className="px-2 py-2">{venda.funcionario}</td>
                <td className="px-2 py-2">
                  {venda.total.toLocaleString("pt-AO")} Kz
                </td>
                <td className="px-2 py-2">{venda.metodoPagamento}</td>
                <td className="px-2 py-2">
                  {new Date(venda.createdAt).toLocaleDateString()}
                </td>
                <td className="px-2 py-2 text-center">
                  <button
                    onClick={() => gerarRecibo(venda.id)}
                    className="text-blue-600 dark:text-blue-400 underline hover:font-bold"
                  >
                    Recibo PDF
                  </button>
                </td>
              </tr>
            ))}
            {vendasFiltradas.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-4">
                  Nenhuma venda encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaVendas;
