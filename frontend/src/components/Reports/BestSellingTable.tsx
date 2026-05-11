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
import { FiSearch, FiPackage, FiTrendingUp } from "react-icons/fi";
import { GiMedicines } from "react-icons/gi";

interface Product {
  id: number;
  nome: string;
  total_vendido: number;
}

type ViewMode = "general" | "sucursal";

const BestSellingTable = () => {
  const [data, setData] = useState<Product[]>([]);
  const [filteredData, setFilteredData] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("general");
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

      // BUSCAR DADOS
      const [vendasRes, medsRes] = await Promise.all([
        api.get(url, { headers }),
        api.get("/api/medicamentos", {
          headers,
        }),
      ]);

      const vendas = vendasRes.data || [];
      const medicamentos = medsRes.data || [];

      //  MAPA ID -> NOME
      const medMap = new Map<number, string>();

      medicamentos.forEach((m: any) => {
        medMap.set(m.id, m.nome);
      });

      //  CONTAR VENDAS
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

      //  ARRAY
      const resultado: Product[] = Array.from(mapa.entries())
        .map(([nome, total], index) => ({
          id: index + 1,
          nome,
          total_vendido: total,
        }))
        .sort((a, b) => b.total_vendido - a.total_vendido);

      setData(resultado);
      setFilteredData(resultado);

      setViewMode(agencyId === 0 ? "general" : "sucursal");
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedAgency);
  }, [selectedAgency]);

  //  FILTRAR POR NOME
  useEffect(() => {
    const texto = search.toLowerCase();
    const filtrado = data.filter((item) => item.nome.toLowerCase().includes(texto));
    setFilteredData(filtrado);
  }, [search, data]);

  // Calcular total de vendas
  const totalVendas = filteredData.reduce((sum, item) => sum + item.total_vendido, 0);

  return (
    <div className="rounded-xl bg-white shadow-xl dark:bg-boxdark border-0 overflow-hidden">
      {/* Header estilizado */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <GiMedicines className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Produtos Mais Vendidos</h2>
            <p className="text-emerald-100 text-sm mt-1">
              Ranking dos medicamentos com maior saída
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

      {/* Cards de estatísticas */}
      {!loading && filteredData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/30">
          <div className="bg-white dark:bg-boxdark rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total de Produtos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredData.length}
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
                <p className="text-xs text-gray-500 dark:text-gray-400">Total de Unidades</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {totalVendas.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2">
                <FiTrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER DA TABELA */}
      <div className="grid grid-cols-3 border-b border-gray-200 dark:border-gray-700 py-3 px-4 bg-gray-50 dark:bg-gray-800">
        <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Produto</p>
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

      {/* LISTA DE PRODUTOS */}
      {!loading && filteredData.length > 0 && (
        <div>
          {filteredData.map((product, index) => (
            <div
              key={product.id}
              className={`grid grid-cols-3 border-b border-gray-100 dark:border-gray-800 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                index === 0 ? "bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/10" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                {index === 0 && (
                  <span className="text-yellow-500 text-lg">🏆</span>
                )}
                {index === 1 && (
                  <span className="text-gray-400 text-lg">🥈</span>
                )}
                {index === 2 && (
                  <span className="text-amber-600 text-lg">🥉</span>
                )}
                <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">
                  {product.nome}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-green-600 dark:text-green-400 font-bold text-sm">
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
          <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum produto encontrado</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
            Tente ajustar os filtros de busca
          </p>
        </div>
      )}

      {/* Footer com informação */}
      {!loading && filteredData.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 py-3 px-4 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Top 3 produtos representam{" "}
            {((filteredData.slice(0, 3).reduce((sum, p) => sum + p.total_vendido, 0) / totalVendas) * 100).toFixed(1)}% 
            {" "}das vendas totais
          </p>
        </div>
      )}
    </div>
  );
};

export default BestSellingTable;