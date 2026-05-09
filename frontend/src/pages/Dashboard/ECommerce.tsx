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

        // lucros
        setLucro({
          diario: calcularTotalPorDia(vendas),
          semanal: calcularTotalPorSemana(vendas),
          mensal: calcularTotalPorMes(vendas),
        });

        // =========================
        // PRODUTOS MAIS VENDIDOS (FIXADO)
        // =========================
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
              nome,
              quantidadeVendida: quantidade,
            }))
            .sort((a, b) => b.quantidadeVendida - a.quantidadeVendida)
        );

        // =========================
        // MEDICAMENTOS
        // =========================
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

  // =========================
  // UI
  // =========================
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

      {/* LUCROS */}
      <div className="bg-white p-4 rounded shadow">
        <h2>Lucro Diário</h2>
        <p>{lucro.diario.toLocaleString("pt-AO")} Kz</p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2>Lucro Semanal</h2>
        <p>{lucro.semanal > 0 ? lucro.semanal + " Kz" : "Não fechado"}</p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2>Lucro Mensal</h2>
        <p>{lucro.mensal > 0 ? lucro.mensal + " Kz" : "Não fechado"}</p>
      </div>

      {/* MAIS VENDIDOS */}
      <div className="col-span-3 bg-white p-4 rounded shadow">
        <h2>Produtos Mais Vendidos</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={produtosVendidos}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nome" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantidadeVendida" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ESTOQUE BAIXO */}
      <div className="col-span-3 bg-white p-4 rounded shadow">
        <h2>Estoque Baixo</h2>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={estoqueBaixo} dataKey="quantidade" nameKey="nome" outerRadius={120}>
              {estoqueBaixo.map((_, i) => (
                <Cell key={i} fill={cores[i % cores.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* STATUS */}
      <div className="col-span-3 bg-white p-4 rounded shadow">
        <h2>Status Medicamentos</h2>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={[
                { name: "Ok", value: medicamentos.filter(m => m.status === "ok").length },
                { name: "Quase", value: medicamentos.filter(m => m.status === "quase").length },
                { name: "Vencido", value: medicamentos.filter(m => m.status === "vencido").length },
              ]}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
            >
              <Cell fill="#22c55e" />
              <Cell fill="#f59e0b" />
              <Cell fill="#ef4444" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* EVOLUÇÃO */}
      <div className="col-span-3 bg-white p-4 rounded shadow">
        <h2>Evolução Lucro</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={[
              { nome: "Dia", valor: lucro.diario },
              { nome: "Semana", valor: lucro.semanal },
              { nome: "Mês", valor: lucro.mensal },
            ]}
          >
            <XAxis dataKey="nome" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="valor" stroke="#3b82f6" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;