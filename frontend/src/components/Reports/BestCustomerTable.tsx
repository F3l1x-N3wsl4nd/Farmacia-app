import { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  Box,
  Stack,
  CircularProgress,
  TextField,
} from "@mui/material";
import SelectGroupAgency from "./Filters/SelectGroupAgency";

interface BestCustomer {
  nome_cliente: string;
  quantidade_compras: number;
  nome_sucursal?: string;
}

const BestCustomerTable = () => {
  const [data, setData] = useState<BestCustomer[]>([]);
  const [filteredData, setFilteredData] = useState<
    BestCustomer[]
  >([]);
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

      const resultado: BestCustomer[] = Array.from(
        mapa.entries()
      )
        .map(([nome_cliente, info]) => ({
          nome_cliente,
          quantidade_compras: info.total,
          nome_sucursal: info.sucursal,
        }))
        .filter((item) => item.quantidade_compras > 1)
        .sort(
          (a, b) =>
            b.quantidade_compras - a.quantidade_compras
        );

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

  //  FILTRO POR NOME
  useEffect(() => {
    const texto = search.toLowerCase();

    const filtrado = data.filter((item) =>
      item.nome_cliente
        .toLowerCase()
        .includes(texto)
    );

    setFilteredData(filtrado);
  }, [search, data]);

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default">
      {/* FILTROS */}
      <Box sx={{ p: 3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
        >
        

          <TextField
            fullWidth
            size="small"
            label="Filtrar por nome do cliente"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </Stack>
      </Box>

      {/* HEADER */}
      <div className="grid grid-cols-3 border-t py-4 px-4 font-semibold">
        <p>Cliente</p>
        <p>Total Compras</p>
        <p>Sucursal</p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-10">
          <CircularProgress />
        </div>
      )}

      {/* LISTA */}
      {!loading &&
        filteredData.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-3 border-t py-4 px-4"
          >
            <div>{item.nome_cliente}</div>
            <div>{item.quantidade_compras}</div>
            <div>{item.nome_sucursal}</div>
          </div>
        ))}

      {/* EMPTY */}
      {!loading &&
        filteredData.length === 0 && (
          <p className="p-5 text-center text-gray-500">
            Nenhum cliente encontrado
          </p>
        )}
    </div>
  );
};

export default BestCustomerTable;