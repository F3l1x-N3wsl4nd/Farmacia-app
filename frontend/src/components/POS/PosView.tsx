import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Stack,
  Button,
  Typography,
  Divider,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
} from "@mui/material";
import Snackbar, { SnackbarOrigin } from "@mui/material/Snackbar";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from "recharts";
import axios from "axios";
import jsPDF from "jspdf";
import { 
  FiSearch, 
  FiUser, 
  FiShoppingCart, 
  FiTrash2, 
  FiPlus, 
  FiMinus,
  FiCreditCard,
  FiDollarSign,
  FiPrinter,
  FiPackage,
  FiTrendingUp
} from "react-icons/fi";
import { FaReceipt, FaRegCreditCard } from "react-icons/fa";

// --- Axios com token ---
const api = axios.create({ baseURL: "http://localhost:5000" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tipos
type Produto = {
  id: number;
  nome: string;
  fracionavel: string;
  restricoes: string;
  precoVenda: number;
  codigo?: string;
  controlado?: boolean;
  stock?: number;
};
type ItemCarrinho = Produto & { quantidade: number };
type Venda = {
  id: number;
  cliente: string;
  funcionario: string;
  total: number;
  metodoPagamento: string;
  data: string;
  itens?: ItemCarrinho[];
  pago?: boolean;
};

export function PosView() {
  const [clienteNome, setClienteNome] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"dinheiro" | "cartao">(
    "dinheiro"
  );
  const [allProds, setAllProds] = useState<Produto[]>([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [ultimasVendas, setUltimasVendas] = useState<Venda[]>([]);
  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    sev: "success" | "error" | "info";
  }>({ open: false, msg: "", sev: "info" });

  const moedaAOA = (v: number) =>
    v.toLocaleString("pt-AO", { style: "currency", currency: "AOA" });

  const total = useMemo(
    () => itens.reduce((sum, p) => sum + (p.precoVenda || 0) * p.quantidade, 0),
    [itens]
  );

  // --- Buscar produtos ---
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/medicamentos");
        const lista: Produto[] = (res.data || []).map((x: any) => ({
          id: x.id ?? x.id_producto ?? x.codigo ?? 0,
          nome: x.nome ?? x.name ?? "Produto",
          fracionavel: x.fracionavel,
          restricoes: x.restricoes,
          precoVenda: Number(x.precoVenda ?? x.preco ?? x.preco_venda ?? 0),
          codigo: x.codigo ?? String(x.id ?? x.id_producto ?? ""),
          controlado: Boolean(x.controlado),
          stock: x.stock ?? x.estoque ?? undefined,
        }));
        setAllProds(lista);
      } catch (err) {
        console.error(err);
        setToast({
          open: true,
          msg: "Falha ao carregar medicamentos.",
          sev: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // --- Pesquisa ---
  const handleSearch = (value: string) => {
    setSearch(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    const termo = value
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
    const filtrados = allProds.filter(
      (p) =>
        p.nome
          .toLowerCase()
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .includes(termo) ||
        (p.codigo ?? "").toLowerCase().includes(termo)
    );
    setResults(filtrados);
  };

  // --- Carrinho ---
  const addProduto = (prod: Produto) => {
    setItens((prev) => {
      const index = prev.findIndex((p) => p.id === prod.id);
      if (index >= 0) {
        const copia = [...prev];
        copia[index] = {
          ...copia[index],
          quantidade: copia[index].quantidade + 1,
        };
        return copia;
      }
      return [...prev, { ...prod, quantidade: 1 }];
    });
    setSearch("");
    setResults([]);
  };

  const setQuantidade = (id: number, qtd: number) => {
    if (qtd <= 0) {
      setItens((prev) => prev.filter((p) => p.id !== id));
      return;
    }
    setItens((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantidade: qtd } : p))
    );
  };
  const inc = (id: number) =>
    setItens((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, quantidade: p.quantidade + 1 } : p
      )
    );
  const dec = (id: number) =>
    setItens((prev) =>
      prev
        .map((p) =>
          p.id === id ? { ...p, quantidade: p.quantidade - 1 } : p
        )
        .filter((p) => p.quantidade > 0)
    );

  // --- PDF/Fatura ---
  const gerarFaturaPDF = (venda: Venda) => {
    const largura = 80,
      margemX = 4,
      centroX = largura / 2;
    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: [largura, 150],
    });
    let y = 8;

    doc.setFontSize(12);
    doc.text("Farmácia Esperança Lda", centroX, y, { align: "center" });
    y += 5;
    doc.setFontSize(9);
    doc.text("NIF: 5001234567", centroX, y, { align: "center" });
    y += 4;
    doc.text("Rua Principal, Luanda - Angola", centroX, y, { align: "center" });
    y += 4;
    doc.text("Tel: +244 923 456 789", centroX, y, { align: "center" });
    y += 6;
    doc.setFontSize(10);
    doc.text(`FATURA Nº ${venda.id}`, centroX, y, { align: "center" });
    y += 6;
    doc.setFontSize(9);
    doc.text(`Cliente: ${venda.cliente}`, margemX, y);
    y += 4;
    doc.text(`Funcionário: ${venda.funcionario}`, margemX, y);
    y += 4;
    doc.text(`Pagamento: ${venda.metodoPagamento}`, margemX, y);
    y += 4;
    doc.text(`Data: ${new Date(venda.data).toLocaleString("pt-AO")}`, margemX, y);
    y += 4;
    doc.line(margemX, y, largura - margemX, y);
    y += 3;
    doc.text("Itens:", margemX, y);
    y += 4;

    (venda.itens || []).forEach((p) => {
      const linhas = doc.splitTextToSize(p.nome, largura - margemX * 2);
      linhas.forEach((ln) => {
        doc.text(ln, margemX, y);
        y += 4;
      });
      doc.text(`${p.quantidade} x ${moedaAOA(p.precoVenda)} =`, margemX + 2, y);
      doc.text(`${moedaAOA(p.precoVenda * p.quantidade)}`, largura - margemX, y, {
        align: "right",
      });
      y += 5;
    });

    y += 1;
    doc.line(margemX, y, largura - margemX, y);
    y += 4;
    const subtotal = (venda.itens || []).reduce(
      (s, p) => s + p.precoVenda * p.quantidade,
      0
    );
    const iva = subtotal * 0.14;
    const totalFinal = subtotal + iva;
    doc.text("Subtotal:", margemX, y);
    doc.text(moedaAOA(subtotal), largura - margemX, y, { align: "right" });
    y += 4;
    doc.text("IVA (14%):", margemX, y);
    doc.text(moedaAOA(iva), largura - margemX, y, { align: "right" });
    y += 5;
    doc.setFontSize(11);
    doc.text("TOTAL:", margemX, y);
    doc.text(moedaAOA(totalFinal), largura - margemX, y, { align: "right" });
    y += 10;
    doc.setFontSize(8);
    doc.text("Obrigado pela preferência!", centroX, y, { align: "center" });
    y += 4;
    doc.text("Documento processado informaticamente", centroX, y, {
      align: "center",
    });
    doc.output("dataurlnewwindow");
  };

  // --- Confirmar venda ---
  const handleConfirmSale = async () => {
    if (!clienteNome.trim()) {
      setToast({
        open: true,
        msg: "Informe o nome do cliente",
        sev: "info",
      });
      return;
    }
    if (itens.length === 0) {
      setToast({ open: true, msg: "Carrinho vazio", sev: "info" });
      return;
    }

    const nome = localStorage.getItem("name") || "";
    const payload = {
      cliente: clienteNome,
      funcionario: nome,
      metodoPagamento: paymentMethod,
      itens: itens.map((p) => ({ id: p.id, quantidade: p.quantidade })),
    };

    try {
      await api.post("/api/vendas", payload);

      const venda: Venda = {
        id: Date.now(),
        cliente: clienteNome,
        funcionario: nome,
        total,
        metodoPagamento: paymentMethod,
        data: new Date().toISOString(),
        itens: [...itens],
      };

      setUltimasVendas((prev) => [venda, ...prev.slice(0, 4)]);
      setToast({ open: true, msg: "Venda registrada com sucesso!", sev: "success" });

      gerarFaturaPDF(venda);
      setItens([]);
      setClienteNome("");
      setPaymentMethod("dinheiro");
    } catch (err: any) {
      console.error(" Erro ao registrar venda:", err);
      const msg = err.response?.data?.message || "Erro ao registrar venda";
      setToast({ open: true, msg, sev: "error" });
    }
  };

  // --- Gráficos ---
  const chartData = itens.map((p) => ({
    name: p.nome.length > 15 ? p.nome.substring(0, 15) + "..." : p.nome,
    value: p.precoVenda * p.quantidade,
    qtd: p.quantidade,
  }));
  const COLORS = ["#22c55e", "#16a34a", "#15803d", "#65a30d", "#ca8a04"];

  return (
    <Box sx={{ bgcolor: "#f1f5f9", minHeight: "100vh", p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="#1e293b" sx={{ mb: 0.5 }}>
          Ponto de Venda
        </Typography>
        <Typography variant="body2" color="#64748b">
          Registre vendas de forma rápida e eficiente
        </Typography>
      </Box>

      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={3}
        sx={{ height: "100%" }}
      >
        {/* Coluna Esquerda - Pesquisa e Cliente */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            minHeight: 0,
          }}
        >
          {/* Card Cliente */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              bgcolor: "white",
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" color="#0f172a" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <FiUser className="text-green-600" />
              Cliente
            </Typography>
            <TextField
              fullWidth
              placeholder="Digite o nome do cliente"
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                }
              }}
            />
          </Paper>

          {/* Card Pesquisa */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              flex: 1,
              overflow: "auto",
              border: "1px solid #e2e8f0",
              bgcolor: "white",
              minHeight: 0,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" color="#0f172a" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <FiSearch className="text-green-600" />
              Pesquisar Medicamento
            </Typography>
            <TextField
              fullWidth
              placeholder="Digite nome ou código..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                }
              }}
            />
            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
            <List dense sx={{ mt: 2 }}>
              {results.map((p) => (
                <ListItemButton
                  key={p.id}
                  onClick={() => addProduto(p)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    '&:hover': { bgcolor: "#f1f5f9" }
                  }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="body2" fontWeight="500">
                            {p.nome}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {p.codigo}
                          </Typography>
                        </Box>
                        <Chip
                          label={moedaAOA(p.precoVenda)}
                          size="small"
                          sx={{ bgcolor: "#22c55e", color: "white", fontWeight: "bold" }}
                        />
                      </Stack>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        Fracionável: {p.fracionavel} | {p.restricoes}
                      </Typography>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Coluna Direita - Carrinho e Gráficos */}
        <Box sx={{ flex: 1.5, display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Carrinho */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              bgcolor: "white",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 2.5, borderBottom: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
              <Typography variant="subtitle1" fontWeight="bold" color="#0f172a" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FiShoppingCart className="text-green-600" />
                Carrinho de Compras
                {itens.length > 0 && (
                  <Chip label={`${itens.length} itens`} size="small" sx={{ ml: 1 }} />
                )}
              </Typography>
            </Box>

            <Box sx={{ p: 2.5 }}>
              <Box sx={{ maxHeight: 400, overflow: "auto" }}>
                {itens.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <FiPackage className="text-gray-300 w-12 h-12 mx-auto mb-2" />
                    <Typography variant="body2" color="text.secondary">
                      Carrinho vazio
                    </Typography>
                  </Box>
                ) : (
                  itens.map((p) => (
                    <Paper
                      key={p.id}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        mb: 1.5,
                        borderRadius: 2,
                        border: "1px solid #e2e8f0",
                        bgcolor: "#fafcff"
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                        <Box sx={{ flex: 2, minWidth: 150 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                            {p.nome}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {moedaAOA(p.precoVenda)} / un
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <IconButton
                            size="small"
                            onClick={() => dec(p.id)}
                            sx={{ bgcolor: "#f1f5f9", '&:hover': { bgcolor: "#e2e8f0" } }}
                          >
                            <FiMinus size={14} />
                          </IconButton>
                          <TextField
                            value={p.quantidade}
                            onChange={(e) =>
                              setQuantidade(p.id, Number(e.target.value.replace(/\D/g, "")) || 0)
                            }
                            inputProps={{
                              style: { textAlign: "center", width: 50, padding: "6px 4px" },
                            }}
                            size="small"
                          />
                          <IconButton
                            size="small"
                            onClick={() => inc(p.id)}
                            sx={{ bgcolor: "#f1f5f9", '&:hover': { bgcolor: "#e2e8f0" } }}
                          >
                            <FiPlus size={14} />
                          </IconButton>
                        </Stack>
                        <Typography sx={{ width: 100, textAlign: "right", fontWeight: 600, fontSize: "0.9rem" }}>
                          {moedaAOA(p.precoVenda * p.quantidade)}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Total</Typography>
                <Typography variant="h5" fontWeight="bold" color="#22c55e">
                  {moedaAOA(total)}
                </Typography>
              </Box>

              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Button
                  variant={paymentMethod === "dinheiro" ? "contained" : "outlined"}
                  onClick={() => setPaymentMethod("dinheiro")}
                  fullWidth
                  startIcon={<FiDollarSign />}
                  sx={{
                    ...(paymentMethod === "dinheiro" && { bgcolor: "#22c55e", '&:hover': { bgcolor: "#16a34a" } })
                  }}
                >
                  Dinheiro
                </Button>
                <Button
                  variant={paymentMethod === "cartao" ? "contained" : "outlined"}
                  onClick={() => setPaymentMethod("cartao")}
                  fullWidth
                  startIcon={<FaRegCreditCard />}
                  sx={{
                    ...(paymentMethod === "cartao" && { bgcolor: "#22c55e", '&:hover': { bgcolor: "#16a34a" } })
                  }}
                >
                  Cartão
                </Button>
              </Stack>

              <Button
                variant="contained"
                fullWidth
                onClick={handleConfirmSale}
                disabled={itens.length === 0 || !clienteNome.trim()}
                sx={{
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: "bold",
                  bgcolor: "#22c55e",
                  '&:hover': { bgcolor: "#16a34a" },
                  '&:disabled': { bgcolor: "#cbd5e1" }
                }}
              >
                Finalizar Venda
              </Button>
            </Box>
          </Paper>

          {/* Gráficos */}
          {itens.length > 0 && (
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <Paper elevation={0} sx={{ flex: 1, p: 2, borderRadius: 3, border: "1px solid #e2e8f0" }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                  Distribuição no Carrinho
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                    >
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => moedaAOA(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
              <Paper elevation={0} sx={{ flex: 1, p: 2, borderRadius: 3, border: "1px solid #e2e8f0" }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                  Quantidade por Produto
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="qtd" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Stack>
          )}

          {/* Últimas Vendas */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "white" }}>
            <Typography variant="subtitle1" fontWeight="bold" color="#0f172a" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <FiTrendingUp className="text-green-600" />
              Últimas Vendas
            </Typography>
            {ultimasVendas.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhuma venda registrada ainda
                </Typography>
              </Box>
            ) : (
              ultimasVendas.map((v) => (
                <Box
                  key={v.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #e2e8f0",
                    py: 1.5,
                    flexWrap: "wrap",
                    gap: 1
                  }}
                >
                  <Typography variant="body2" fontWeight="500" sx={{ minWidth: 100 }}>
                    {v.cliente}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="#22c55e">
                    {moedaAOA(v.total)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>
                    {new Date(v.data).toLocaleString("pt-AO")}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => gerarFaturaPDF(v)}
                    startIcon={<FaReceipt />}
                    sx={{ textTransform: "none", color: "#3b82f6" }}
                  >
                    Recibo
                  </Button>
                </Box>
              ))
            )}
          </Paper>
        </Box>
      </Stack>

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        autoHideDuration={4000}
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.sev}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}