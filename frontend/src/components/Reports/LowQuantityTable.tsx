import { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  Box,
  Stack,
  CircularProgress,
  TextField,
  InputAdornment,
} from "@mui/material";
import SelectGroupAgency from "./Filters/SelectGroupAgency";
import { FiSearch, FiPackage, FiTrendingDown, FiAlertCircle } from "react-icons/fi";
import { GiMedicines, GiHealthPotion } from "react-icons/gi";

interface Product {
  id: number;
  nome: string;
  total_vendido: number;
}

const LessSellingTable = () => {
  const [data, setData] = useState<Product[]>([]);
  const [filteredData, setFilteredData] = useState<Product[]>([]);
  const [selectedAgency, setSelectedAgency] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async (agencyId: number) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const url =
        agencyId === 0
          ? "/api/vendas"
          : `/api/vendas/${agencyId}`;

      //  buscar vendas + medicamentos
      const [vendasRes, medsRes] = await Promise.all([
        api.get(url, { headers }),
        api.get("/api/medicamentos", { headers }),
      ]);

      const vendas = vendasRes.data || [];
      const medicamentos = medsRes.data || [];

      //  mapa id -> nome
      const medMap = new Map<number, string>();

      medicamentos.forEach((m: any) => {
        medMap.set(m.id, m.nome);
      });

      //  contar vendas
      const mapa = new Map<string, number>();

      vendas.forEach((venda: any) => {
        (venda.ItemVendas || []).forEach((item: any) => {
          const nome =
            medMap.get(item.MedicamentoId) ||
            `Produto ${item.MedicamentoId}`;

          const qtd = Number(item.quantidade || 0);

          mapa.set(nome, (mapa.get(nome) || 0) + qtd);
        });
      });

      const resultado: Product[] = Array.from(
        mapa.entries()
      )
        .map(([nome, total], index) => ({
          id: index + 1,
          nome,
          total_vendido: total,
        }))
        // 🔥 MENOS VENDIDOS
        .sort(
          (a, b) =>
            a.total_vendido - b.total_vendido
        );

      setData(resultado);
      setFilteredData(resultado);
    } catch (error) {
      console.error(error);
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedAgency);
  }, [selectedAgency]);

  //  filtro por nome
  useEffect(() => {
    const texto = search.toLowerCase();

    const filtrado = data.filter((item) =>
      item.nome.toLowerCase().includes(texto)
    );

    setFilteredData(filtrado);
  }, [search, data]);

  // Calcular estatísticas
  const totalProdutos = filteredData.length;
  const totalVendas = filteredData.reduce((sum, item) => sum + item.total_vendido, 0);
  const mediaVendas = totalProdutos > 0 ? (totalVendas / totalProdutos).toFixed(1) : 0;
  const produtosZerados = filteredData.filter(p => p.total_vendido === 0).length;

  return (
    <div className="rounded-xl bg-white shadow-xl dark:bg-boxdark border-0 overflow-hidden">
      {/* Header estilizado - Cor laranja/vermelho para chamar atenção */}
      <div className="bg-gradient-to-r from-orange-600 to-red-700 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <FiTrendingDown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Produtos Menos Vendidos</h2>
            <p className="text-orange-100 text-sm mt-1">
              Medicamentos com baixa rotatividade - Atenção ao estoque parado
            </p>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <div className="flex-1">
            <SelectGroupAgency 
              value={selectedAgency}
              onChange={(value) => setSelectedAgency(Number(value))}
            />
          </div>

          <div className="flex-1">
            <TextField
              fullWidth
              size="small"
              placeholder="Pesquisar medicamento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiSearch className="text-gray-400" />
                  </InputAdornment>
                ),
              }}
            />
          </div>
        </Stack>
      </Box>

      {/* Cards de estatísticas - Foco em alerta */}
      {!loading && filteredData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/30">
          <div className="bg-white dark:bg-boxdark rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total de Produtos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalProdutos}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2">
                <FiPackage className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-boxdark rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Média de Vendas</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {mediaVendas}
                </p>
                <p className="text-xs text-gray-400">unidades por produto</p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full p-2">
                <GiHealthPotion className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-boxdark rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Produtos sem Venda</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {produtosZerados}
                </p>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-2">
                <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER DA TABELA */}
      <div className="grid grid-cols-3 border-b border-gray-200 dark:border-gray-700 py-3 px-4 bg-gray-50 dark:bg-gray-800">
        <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Medicamento</p>
        <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Total Vendido</p>
        <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Ranking</p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-10">
          <div className="text-center">
            <CircularProgress size={40} />
            <p className="mt-2 text-sm text-gray-500">Carregando...</p>
          </div>
        </div>
      )}

      {/* LISTA DE PRODUTOS - MENOS VENDIDOS */}
      {!loading && filteredData.length > 0 && (
        <div>
          {filteredData.map((product, index) => (
            <div
              key={product.id}
              className={`grid grid-cols-3 border-b border-gray-100 dark:border-gray-800 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                product.total_vendido === 0 
                  ? "bg-red-50/30 dark:bg-red-900/5" 
                  : index < 3 
                  ? "bg-orange-50/30 dark:bg-orange-900/5"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2">
                {product.total_vendido === 0 && (
                  <span className="text-red-500 text-lg" title="Sem vendas">⚠️</span>
                )}
                {product.total_vendido > 0 && product.total_vendido <= 5 && (
                  <span className="text-orange-500 text-lg" title="Baixa venda">📉</span>
                )}
                {product.total_vendido > 5 && (
                  <span className="text-yellow-500 text-lg" title="Venda moderada">⚠️</span>
                )}
                <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">
                  {product.nome}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`font-bold text-sm ${
                  product.total_vendido === 0 
                    ? "text-red-600 dark:text-red-400" 
                    : product.total_vendido <= 5
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-yellow-600 dark:text-yellow-400"
                }`}>
                  {product.total_vendido}
                </span>
                <span className="text-xs text-gray-500">unidades</span>
              </div>

              <div className="flex items-center">
                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold">
                  {product.id}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filteredData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-3">
            <FiPackage className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum medicamento encontrado</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
            Tente ajustar os filtros de busca
          </p>
        </div>
      )}

      {/* Footer com alerta e recomendações */}
      {!loading && filteredData.length > 0 && produtosZerados > 0 && (
        <div className="border-t border-red-200 dark:border-red-800 py-3 px-4 bg-red-50 dark:bg-red-900/10">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="text-red-600 dark:text-red-400 w-4 h-4" />
            <p className="text-xs text-red-700 dark:text-red-400">
              ⚠️ Atenção: {produtosZerados} produto(s) não tiveram nenhuma venda no período selecionado.
              Recomenda-se verificar estoque e considerar promoções.
            </p>
          </div>
        </div>
      )}

      {!loading && filteredData.length > 0 && produtosZerados === 0 && (
        <div className="border-t border-orange-200 dark:border-orange-800 py-3 px-4 bg-orange-50 dark:bg-orange-900/10">
          <div className="flex items-center gap-2">
            <FiTrendingDown className="text-orange-600 dark:text-orange-400 w-4 h-4" />
            <p className="text-xs text-orange-700 dark:text-orange-400">
              📊 Os produtos listados têm baixa rotatividade. Considere ações para impulsionar as vendas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessSellingTable;