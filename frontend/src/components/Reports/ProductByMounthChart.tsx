import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import api from "../../utils/api";
import { 
  FiCalendar, 
  FiBarChart2, 
  FiTrendingUp, 
  FiDownload,
  FiRefreshCw
} from "react-icons/fi";
import { GiHealthPotion, GiMedicines } from "react-icons/gi";

type TipoVisao = "diario" | "semanal" | "mensal";

const meses = [
  "Jan","Fev","Mar","Abr","Mai","Jun",
  "Jul","Ago","Set","Out","Nov","Dez",
];

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

const ProdutosVendas = () => {
  const [visao, setVisao] = useState<TipoVisao>("mensal");
  const [series, setSeries] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [mapMedicamentos, setMapMedicamentos] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [totalVendas, setTotalVendas] = useState(0);
  const [topProduto, setTopProduto] = useState({ nome: "", quantidade: 0 });

  // CARREGAR MEDICAMENTOS
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
    return mapa;
  };

  const processar = (vendas: any[], mapaMedicamentos: any) => {
    const mapa: Record<string, Record<string, number>> = {};

    const getKey = (data: Date) => {
      if (visao === "diario") return data.toISOString().split("T")[0];
      if (visao === "semanal") return diasSemana[data.getDay()];
      return meses[data.getMonth()];
    };

    let totalGeral = 0;
    const produtoTotal: Record<string, number> = {};

    vendas.forEach((venda) => {
      const data = new Date(venda.createdAt || venda.data);
      const key = getKey(data);

      const itens = venda.ItemVendas || venda.itens || [];

      itens.forEach((item: any) => {
        const id = item.MedicamentoId;

        const nome =
          item.Medicamento?.nome ||
          mapaMedicamentos[id] ||
          `Produto ${id}`;

        const qtd = Number(item.quantidade || 0);
        totalGeral += qtd;

        if (!mapa[key]) mapa[key] = {};
        mapa[key][nome] = (mapa[key][nome] || 0) + qtd;
        
        produtoTotal[nome] = (produtoTotal[nome] || 0) + qtd;
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

    // Encontrar top produto
    let topNome = "";
    let topQtd = 0;
    Object.entries(produtoTotal).forEach(([nome, qtd]) => {
      if (qtd > topQtd) {
        topQtd = qtd;
        topNome = nome;
      }
    });

    setTotalVendas(totalGeral);
    setTopProduto({ nome: topNome, quantidade: topQtd });
    setCategorias(categorias);
    setSeries(series);
  };

  const buscarDados = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const mapaMedicamentos = await carregarMedicamentos();

      const vendasRes = await api.get("/api/vendas", {
        headers: { Authorization: `Bearer ${token}` },
      });

      await processar(vendasRes.data || [], mapaMedicamentos);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
        export: {
          csv: {
            filename: `vendas_${visao}`,
            columnDelimiter: ',',
            headerCategory: 'Período',
            headerValue: 'Quantidade',
          },
          svg: {
            filename: `grafico_vendas_${visao}`,
          },
          png: {
            filename: `grafico_vendas_${visao}`,
          },
        },
      },
      background: 'transparent',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        borderRadiusApplication: 'end',
        columnWidth: '70%',
        horizontal: false,
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: categorias,
      title: {
        text: visao === "diario" ? "Datas" : visao === "semanal" ? "Dias da Semana" : "Meses",
        style: {
          fontSize: '12px',
          fontWeight: 500,
        },
      },
      labels: {
        rotate: -45,
        rotateAlways: false,
        style: {
          fontSize: '11px',
          colors: '#64748B',
        },
      },
    },
    yaxis: {
      title: {
        text: "Quantidade Vendida",
        style: {
          fontSize: '12px',
          fontWeight: 500,
        },
      },
      labels: {
        formatter: (value) => `${Math.round(value)}`,
        style: {
          fontSize: '11px',
          colors: '#64748B',
        },
      },
    },
    title: {
      text: visao === "diario"
        ? "📊 Vendas Diárias"
        : visao === "semanal"
        ? "📊 Vendas Semanais"
        : "📊 Vendas Mensais",
      align: "center",
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#1E293B',
      },
    },
    legend: { 
      position: "top",
      horizontalAlign: "center",
      fontSize: '12px',
      markers: {
        radius: 8,
      },
    },
    colors: ['#3C50E0', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'],
    grid: {
      borderColor: '#E2E8F0',
      strokeDashArray: 5,
      position: 'back',
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (value) => `${value} unidades`,
        title: {
          formatter: (seriesName) => `📦 ${seriesName}`,
        },
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '80%',
            },
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  const handleExportar = () => {
    // Função para exportar dados via CSV
    const csvData = [
      ['Período', ...series.map(s => s.name)],
      ...categorias.map((cat, idx) => [cat, ...series.map(s => s.data[idx])])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendas_${visao}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl bg-white dark:bg-boxdark shadow-2xl border-0 overflow-hidden">
      {/* Header com gradiente */}
      <div className="relative bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-5">
        <div className="absolute right-0 top-0 opacity-10">
          <GiHealthPotion className="w-32 h-32 text-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <FiBarChart2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Análise de Vendas</h2>
                <p className="text-purple-100 text-sm mt-1">
                  Acompanhamento de vendas por período e produto
                </p>
              </div>
            </div>
            
            <button
              onClick={buscarDados}
              className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-white text-sm"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* Cards de métricas */}
      {!loading && totalVendas > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/30">
          <div className="bg-white dark:bg-boxdark rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total de Vendas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {totalVendas.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">unidades vendidas</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-3">
                <FiTrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-boxdark rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Produto Top</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1 truncate max-w-[200px]">
                  {topProduto.nome || "—"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {topProduto.quantidade.toLocaleString()} unidades
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
                <GiMedicines className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-boxdark rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Período Atual</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 capitalize">
                  {visao}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {categorias.length} {visao === "diario" ? "dias" : visao === "semanal" ? "dias" : "meses"}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
                <FiCalendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botões de visão estilizados */}
      <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setVisao("diario")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              visao === "diario"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <FiCalendar className="w-4 h-4" />
            Diário
          </button>
          <button
            onClick={() => setVisao("semanal")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              visao === "semanal"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <FiBarChart2 className="w-4 h-4" />
            Semanal
          </button>
          <button
            onClick={() => setVisao("mensal")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              visao === "mensal"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <FiTrendingUp className="w-4 h-4" />
            Mensal
          </button>
        </div>

        {series.length > 0 && (
          <button
            onClick={handleExportar}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all text-gray-700 dark:text-gray-300 text-sm"
          >
            <FiDownload className="w-4 h-4" />
            Exportar CSV
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <GiHealthPotion className="w-6 h-6 text-purple-600 animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              Carregando dados do gráfico...
            </p>
          </div>
        </div>
      )}

      {/* Gráfico */}
      {!loading && series.length > 0 && (
        <div className="p-4">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={400}
          />
        </div>
      )}

      {/* Empty state */}
      {!loading && series.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4">
            <FiBarChart2 className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Nenhum dado disponível
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
            Não foram encontradas vendas no período. Verifique a conexão com o servidor.
          </p>
        </div>
      )}

      {/* Footer com informações */}
      {!loading && series.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 py-3 px-4 bg-gray-50 dark:bg-gray-800/30">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Gráfico de barras empilhadas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>{series.length} produtos no total</span>
            </div>
            <div>
              Última atualização: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProdutosVendas;