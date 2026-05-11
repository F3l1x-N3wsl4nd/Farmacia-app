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
import { FiSearch, FiStar, FiUsers } from "react-icons/fi";

interface BestCustomer {
  nome_cliente: string;
  quantidade_compras: number;
  nome_sucursal?: string;
}

const BestCustomerTable = () => {
  const [data, setData] = useState<BestCustomer[]>([]);
  const [filteredData, setFilteredData] = useState<BestCustomer[]>([]);
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

      const res = await api.get(url, { headers });

      const vendas = res.data || [];

      const mapa = new Map<
        string,
        {
          total: number;
          sucursal: string;
        }
      >();

      vendas.forEach((venda: any) => {
        const nomeCliente =
          venda.nome_cliente ||
          venda.cliente_nome ||
          venda.cliente ||
          venda.Cliente?.nome ||
          venda.Cliente?.name ||
          venda.usuario?.nome ||
          venda.Usuario?.nome ||
          venda.User?.name ||
          venda.user?.name ||
          "Cliente Balcão";

        const sucursal =
          venda.nome_sucursal ||
          venda.sucursal_nome ||
          venda.Sucursal?.nome ||
          venda.sucursal?.nome ||
          "Farmácia";

        const cliente = String(nomeCliente).trim();

        if (!mapa.has(cliente)) {
          mapa.set(cliente, {
            total: 1,
            sucursal,
          });
        } else {
          mapa.get(cliente)!.total += 1;
        }
      });

      const resultado: BestCustomer[] = Array.from(mapa.entries())
        .map(([nome_cliente, info]) => ({
          nome_cliente,
          quantidade_compras: info.total,
          nome_sucursal: info.sucursal,
        }))
        .filter((item) => item.quantidade_compras > 1)
        .sort((a, b) => b.quantidade_compras - a.quantidade_compras);

      setData(resultado);
      setFilteredData(resultado);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedAgency);
  }, [selectedAgency]);

  useEffect(() => {
    const texto = search.toLowerCase();
    const filtrado = data.filter((item) =>
      item.nome_cliente.toLowerCase().includes(texto)
    );
    setFilteredData(filtrado);
  }, [search, data]);

  // Estatísticas apenas para exibição
  const totalClientes = filteredData.length;
  const totalCompras = filteredData.reduce((sum, item) => sum + item.quantidade_compras, 0);

  return (
    <div className="rounded-xl bg-white shadow-xl dark:bg-boxdark border-0 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-amber-600 px-6 py-4">
        <div className="flex items-center gap-2">
          <FiStar className="w-5 h-5 text-white" />
          <h2 className="text-lg font-semibold text-white">Clientes Estrela</h2>
        </div>
        <p className="text-yellow-100 text-xs mt-1">Clientes com maior frequência de compras</p>
      </div>

      {/* Filtros */}
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
              placeholder="Pesquisar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiSearch className="text-gray-400 w-4 h-4" />
                  </InputAdornment>
                ),
              }}
            />
          </div>
        </Stack>
      </Box>

      {/* Cards de estatísticas */}
      {!loading && filteredData.length > 0 && (
        <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-800/30">
          <div className="bg-white dark:bg-boxdark rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-500">Total Clientes</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{totalClientes}</p>
          </div>
          <div className="bg-white dark:bg-boxdark rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-500">Total Compras</p>
            <p className="text-xl font-bold text-amber-600">{totalCompras}</p>
          </div>
        </div>
      )}

      {/* Header da tabela */}
      <div className="grid grid-cols-3 border-b border-gray-200 dark:border-gray-700 py-3 px-4 bg-gray-50 dark:bg-gray-800">
        <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">Cliente</p>
        <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">Total Compras</p>
        <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">Sucursal</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-10">
          <CircularProgress size={40} />
        </div>
      )}

      {/* Lista */}
      {!loading && filteredData.length > 0 && (
        <div>
          {filteredData.map((item, index) => (
            <div
              key={index}
              className={`grid grid-cols-3 border-b border-gray-100 dark:border-gray-800 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                index === 0 ? "bg-gradient-to-r from-yellow-50/30 to-transparent" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                {index === 0 && <span className="text-yellow-500">🥇</span>}
                {index === 1 && <span className="text-gray-400">🥈</span>}
                {index === 2 && <span className="text-amber-600">🥉</span>}
                {index > 2 && <span className="text-gray-400 text-xs w-5">#{index + 1}</span>}
                <span className="text-gray-800 dark:text-gray-200 text-sm truncate">
                  {item.nome_cliente}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-amber-600 text-sm">
                  {item.quantidade_compras}
                </span>
                <span className="text-xs text-gray-500">compras</span>
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {item.nome_sucursal}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filteredData.length === 0 && (
        <div className="flex flex-col items-center py-10">
          <FiUsers className="w-10 h-10 text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm">Nenhum cliente encontrado</p>
        </div>
      )}
    </div>
  );
};

export default BestCustomerTable;