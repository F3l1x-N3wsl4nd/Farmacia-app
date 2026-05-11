import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

interface Venda {
  id: number;
  total: number;
  data: string;
  ItemVendas: {
    quantidade: number;
    Medicamento?: { nome: string };
    MedicamentoId: number;
  }[];
}

interface Medicamento {
  id: number;
  nome: string;
  validade?: string;
  quantidade: number;
  status?: "ok" | "quase" | "vencido";
}

const cores = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

const Dashboard: React.FC = () => {
  const [produtosVendidos, setProdutosVendidos] = useState<any[]>([]);
  const [lucro, setLucro] = useState({ diario: 0, semanal: 0, mensal: 0 });
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [estoqueBaixo, setEstoqueBaixo] = useState<Medicamento[]>([]);
  const [medicamentosExpirados, setMedicamentosExpirados] = useState<Medicamento[]>([]);
  const [mapMedicamentos, setMapMedicamentos] = useState<Record<number, string>>({});

  // =========================
  // LUCROS
  // =========================
  const calcularTotalPorDia = (vendas: Venda[]) => {
    const hoje = new Date();
    return vendas.reduce((total, v) => {
      const d = new Date(v.data);
      if (
        d.getFullYear() === hoje.getFullYear() &&
        d.getMonth() === hoje.getMonth() &&
        d.getDate() === hoje.getDate()
      ) {
        return total + v.total;
      }
      return total;
    }, 0);
  };

  const calcularTotalPorSemana = (vendas: Venda[]) => {
    const hoje = new Date();
    const diaSemana = hoje.getDay();
    const inicio = new Date(hoje);
    inicio.setDate(hoje.getDate() - diaSemana);

    if (diaSemana !== 0) return 0;

    return vendas.reduce((total, v) => {
      const d = new Date(v.data);
      if (d >= inicio && d <= hoje) return total + v.total;
      return total;
    }, 0);
  };

  const calcularTotalPorMes = (vendas: Venda[]) => {
    const hoje = new Date();
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    if (hoje.getDate() !== ultimoDia.getDate()) return 0;

    return vendas.reduce((total, v) => {
      const d = new Date(v.data);
      if (
        d.getFullYear() === hoje.getFullYear() &&
        d.getMonth() === hoje.getMonth()
      ) {
        return total + v.total;
      }
      return total;
    }, 0);
  };

  // =========================
  // LOAD MEDICAMENTOS MAPA
  // =========================
  const carregarMedicamentos = async (headers: any) => {
    const res = await api.get("/api/medicamentos", { headers });

    const mapa: Record<number, string> = {};
    (res.data || []).forEach((m: any) => {
      mapa[m.id] = m.nome;
    });

    setMapMedicamentos(mapa);
    return res.data || [];
  };

  // =========================
  // MAIN LOAD
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    const load = async () => {
      try {
        const [vendasRes, meds] = await Promise.all([
          api.get("/api/vendas", { headers }),
          carregarMedicamentos(headers),
        ]);

        const vendas: Venda[] = vendasRes.data || [];

        setLucro({
          diario: calcularTotalPorDia(vendas),
          semanal: calcularTotalPorSemana(vendas),
          mensal: calcularTotalPorMes(vendas),
        });

        const mapa = new Map<string, number>();

        vendas.forEach((v) => {
          v.ItemVendas.forEach((item) => {
            const nome =
              item.Medicamento?.nome ||
              mapMedicamentos[item.MedicamentoId] ||
              `Produto ${item.MedicamentoId}`;

            mapa.set(nome, (mapa.get(nome) || 0) + item.quantidade);
          });
        });

        setProdutosVendidos(
          Array.from(mapa.entries())
            .map(([nome, quantidade]) => ({
              nome: nome.length > 20 ? nome.substring(0, 20) + "..." : nome,
              quantidadeVendida: quantidade,
            }))
            .sort((a, b) => b.quantidadeVendida - a.quantidadeVendida)
        );

        const hoje = new Date();

        const medic = meds.map((m: any) => {
          const validade = m.validade ? new Date(m.validade) : null;

          let status: "ok" | "quase" | "vencido" = "ok";

          if (validade) {
            const dias =
              (validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);

            if (dias < 0) status = "vencido";
            else if (dias <= 30) status = "quase";
          }

          return { ...m, status };
        });

        setMedicamentos(medic);
        setEstoqueBaixo(medic.filter((p) => p.quantidade <= 10));
        setMedicamentosExpirados(medic.filter((p) => p.status !== "ok"));
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [mapMedicamentos]);

  const produtosOk = medicamentos.filter(m => m.status === "ok").length;
  const produtosQuase = medicamentos.filter(m => m.status === "quase").length;
  const produtosVencidos = medicamentos.filter(m => m.status === "vencido").length;

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Visão geral da farmácia</p>
      </div>

      {/* Cards de Lucro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border-l-4 border-blue-500">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Lucro Diário</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {lucro.diario.toLocaleString("pt-AO")} Kz
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border-l-4 border-green-500">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Lucro Semanal</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {lucro.semanal > 0 ? lucro.semanal.toLocaleString("pt-AO") + " Kz" : "—"}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border-l-4 border-purple-500">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Lucro Mensal</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {lucro.mensal > 0 ? lucro.mensal.toLocaleString("pt-AO") + " Kz" : "—"}
          </p>
        </div>
      </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 shadow-sm">
          <p className="text-green-600 dark:text-green-400 text-sm font-medium">Produtos OK</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{produtosOk}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 shadow-sm">
          <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Quase Vencendo</p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{produtosQuase}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 shadow-sm">
          <p className="text-red-600 dark:text-red-400 text-sm font-medium">Vencidos</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">{produtosVencidos}</p>
        </div>
      </div>

      {/* Produtos Mais Vendidos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          Produtos Mais Vendidos
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={produtosVendidos} margin={{ left: 20, right: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="nome" 
              angle={-45} 
              textAnchor="end" 
              height={70}
              tick={{ fontSize: 11, fill: '#6b7280' }}
            />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
              formatter={(value) => [`${value} unidades`, 'Vendidas']}
            />
            <Legend />
            <Bar dataKey="quantidadeVendida" name="Quantidade Vendida" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Estoque Baixo e Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Estoque Baixo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Produtos com Estoque Baixo
          </h2>
          {estoqueBaixo.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-500 text-center">Nenhum produto com estoque baixo</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={estoqueBaixo}
                  dataKey="quantidade"
                  nameKey="nome"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name }) => name}
                >
                  {estoqueBaixo.map((_, i) => (
                    <Cell key={i} fill={cores[i % cores.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} unidades`, 'Estoque']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Medicamentos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Status dos Medicamentos
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Ok", value: produtosOk, color: "#22c55e" },
                  { name: "Quase Vencendo", value: produtosQuase, color: "#f59e0b" },
                  { name: "Vencido", value: produtosVencidos, color: "#ef4444" },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                <Cell fill="#22c55e" />
                <Cell fill="#f59e0b" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip formatter={(value) => [`${value} produtos`, 'Quantidade']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Evolução do Lucro */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          Evolução do Lucro
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={[
              { nome: "Diário", valor: lucro.diario },
              { nome: "Semanal", valor: lucro.semanal },
              { nome: "Mensal", valor: lucro.mensal },
            ]}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="nome" tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
              formatter={(value) => [`${Number(value).toLocaleString("pt-AO")} Kz`, 'Lucro']}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="valor" 
              name="Lucro" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;