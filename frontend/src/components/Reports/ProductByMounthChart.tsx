import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import api from "../../utils/api";

type TipoVisao = "diario" | "semanal" | "mensal";

const meses = [
  "Jan","Fev","Mar","Abr","Mai","Jun",
  "Jul","Ago","Set","Out","Nov","Dez",
];

const ProdutosVendas = () => {
  const [visao, setVisao] = useState<TipoVisao>("mensal");
  const [series, setSeries] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [mapMedicamentos, setMapMedicamentos] = useState<any>({});

  //  CARREGAR MEDICAMENTOS (CORRIGIDO)
  const carregarMedicamentos = async () => {
    const token = localStorage.getItem("token");

    const res = await api.get("/api/medicamentos", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const mapa: any = {};

    (res.data || []).forEach((m: any) => {
      mapa[m.id] = m.nome;
    });

    setMapMedicamentos(mapa);

    return mapa; //  IMPORTANTE
  };

  const processar = (vendas: any[], mapaMedicamentos: any) => {
    const mapa: Record<string, Record<string, number>> = {};

    const getKey = (data: Date) => {
      if (visao === "diario") return data.toISOString().split("T")[0];
      if (visao === "semanal") return `Semana ${Math.ceil(data.getDate() / 7)}`;
      return meses[data.getMonth()];
    };

    vendas.forEach((venda) => {
      const data = new Date(venda.createdAt || venda.data);
      const key = getKey(data);

      const itens = venda.ItemVendas || venda.itens || [];

      itens.forEach((item: any) => {
        const id = item.MedicamentoId;

        const nome =
          item.Medicamento?.nome ||
          mapaMedicamentos[id] || //  AGORA GARANTIDO
          `Produto ${id}`;

        const qtd = Number(item.quantidade || 0);

        if (!mapa[key]) mapa[key] = {};
        mapa[key][nome] = (mapa[key][nome] || 0) + qtd;
      });
    });

    const categorias = Object.keys(mapa).sort();

    const produtos = new Set<string>();
    categorias.forEach((c) => {
      Object.keys(mapa[c]).forEach((p) => produtos.add(p));
    });

    const series = Array.from(produtos).map((produto) => ({
      name: produto,
      data: categorias.map((c) => mapa[c]?.[produto] || 0),
    }));

    setCategorias(categorias);
    setSeries(series);
  };

  const buscarDados = async () => {
    try {
      const token = localStorage.getItem("token");

      //  1. primeiro medicamentos
      const mapaMedicamentos = await carregarMedicamentos();

      //  2. depois vendas
      const vendasRes = await api.get("/api/vendas", {
        headers: { Authorization: `Bearer ${token}` },
      });

      //  3. processar com mapa garantido
      processar(vendasRes.data || [], mapaMedicamentos);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    buscarDados();
  }, []);

  useEffect(() => {
    buscarDados();
  }, [visao]);

  const options: ApexOptions = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: {
        show: true, //  mantém PNG / CSV / SVG
      },
    },
    xaxis: {
      categories: categorias,
    },
    title: {
      text:
        visao === "diario"
          ? " Vendas Diárias"
          : visao === "semanal"
          ? " Vendas Semanais"
          : " Vendas Mensais",
      align: "center",
    },
    legend: { position: "top" },
    dataLabels: { enabled: false },
    colors: ["#3C50E0", "#10B981", "#F59E0B", "#EF4444"],
    plotOptions: {
      bar: { borderRadius: 4 },
    },
  };

  return (
    <div style={{ background: "#fff", padding: 20, borderRadius: 10 }}>
      <div style={{ marginBottom: 15 }}>
        <button onClick={() => setVisao("diario")}> Diário</button>
        <button onClick={() => setVisao("semanal")} style={{ marginLeft: 10 }}>
           Semanal
        </button>
        <button onClick={() => setVisao("mensal")} style={{ marginLeft: 10 }}>
           Mensal
        </button>
      </div>

      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={380}
      />
    </div>
  );
};

export default ProdutosVendas;