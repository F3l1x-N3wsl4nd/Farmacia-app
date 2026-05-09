import { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  Box,
  Stack,
  CircularProgress,
  TextField,
} from "@mui/material";
import SelectGroupAgency from "./Filters/SelectGroupAgency";

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

  return (
    <div className="rounded-sm border bg-white shadow">
      {/* FILTROS */}
      <Box sx={{ p: 3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
        >
          

          <TextField
            fullWidth
            size="small"
            label="Filtrar medicamento"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </Stack>
      </Box>

      {/* HEADER */}
      <div className="grid grid-cols-3 border-t py-3 px-4 font-semibold">
        <p>Medicamento</p>
        <p>Total Vendido</p>
        <p>ID</p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-10">
          <CircularProgress />
        </div>
      )}

      {/* LISTA */}
      {!loading &&
        filteredData.map((product) => (
          <div
            key={product.id}
            className="grid grid-cols-3 border-t py-3 px-4"
          >
            <div>{product.nome}</div>
            <div>{product.total_vendido}</div>
            <div>{product.id}</div>
          </div>
        ))}

      {/* EMPTY */}
      {!loading &&
        filteredData.length === 0 && (
          <p className="p-5 text-center text-gray-500">
            Nenhum medicamento encontrado
          </p>
        )}
    </div>
  );
};

export default LessSellingTable;