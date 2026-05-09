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

  // Snackbar
  interface State extends SnackbarOrigin {
    open: boolean;
  }
  const [state, setState] = useState<State>({
    open: false,
    vertical: "bottom",
    horizontal: "right",
  });
   

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

    // 👉 Aqui pega a mensagem que o backend enviou
    const msg = err.response?.data?.message || "Erro ao registrar venda";
    setToast({ open: true, msg, sev: "error" });
  }
};

  // --- Gráficos ---
  const chartData = itens.map((p) => ({
    name: p.nome,
    value: p.precoVenda * p.quantidade,
    qtd: p.quantidade,
  }));
  const COLORS = ["#22c55e", "#16a34a", "#15803d", "#65a30d", "#ca8a04"];

  return (
    <Box sx={{ bgcolor: "#f9fafb", minHeight: "100vh", p: 2, overflow: "auto" }}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={2}
        sx={{ height: "100%" }}
      >
        {/* Pesquisa e Cliente */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            minHeight: 0,
          }}
        >
          <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h6" color="green">
              Cliente
            </Typography>
            <TextField
              fullWidth
              label="Nome do Cliente"
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
            />
          </Paper>
          <Paper
            sx={{
              p: 2,
              borderRadius: 3,
              flex: 1,
              overflow: "auto",
              boxShadow: 3,
              minHeight: 0,
            }}
          >
            <Typography variant="h6" color="green">
              Pesquisar Medicamento
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TextField
              fullWidth
              placeholder="Digite nome ou código..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {loading && <CircularProgress size={24} sx={{ mt: 2 }} />}
            <List dense sx={{ mt: 1 }}>
              {results.map((p) => (
                <ListItemButton key={p.id} onClick={() => addProduto(p)}>
                  <ListItemText
                    primary={
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                      >
                        <span>{p.nome}</span>
                        <span
                          style={{ color: "green", fontWeight: 600 }}
                        >
                          {moedaAOA(p.precoVenda)}
                        </span>
                      </Stack>
                    }
                    secondary={`Fracionável: ${p.fracionavel} | ${p.restricoes}`}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Carrinho e gráficos */}
        <Box sx={{ flex: 1.5, display: "flex", flexDirection: "column", gap: 2 }}>
          <Paper
            sx={{
              flex: 1,
              p: 2,
              borderRadius: 3,
              boxShadow: 3,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" color="green">
              Carrinho
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ flex: 1, overflow: "auto" }}>
              {itens.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nenhum item no carrinho.
                </Typography>
              ) : (
                <List dense>
                  {itens.map((p) => (
                    <Paper
                      key={p.id}
                      sx={{
                        p: 1,
                        mb: 1,
                        borderRadius: 2,
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontWeight: 600 }}>
                            {p.nome}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {moedaAOA(p.precoVenda)} • Stock:{" "}
                            {p.stock ?? "-"}
                          </Typography>
                        </Box>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => dec(p.id)}
                          >
                            -
                          </Button>
                          <TextField
                            value={p.quantidade}
                            onChange={(e) =>
                              setQuantidade(
                                p.id,
                                Number(
                                  e.target.value.replace(/\D/g, "")
                                ) || 0
                              )
                            }
                            inputProps={{
                              inputMode: "numeric",
                              style: {
                                textAlign: "center",
                                width: 50,
                              },
                            }}
                          />
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => inc(p.id)}
                          >
                            +
                          </Button>
                        </Stack>
                        <Typography
                          sx={{
                            width: 100,
                            textAlign: "right",
                            fontWeight: 600,
                          }}
                        >
                          {moedaAOA(p.precoVenda * p.quantidade)}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </List>
              )}
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography
              variant="h5"
              align="right"
              fontWeight="bold"
              color="green"
            >
              Total: {moedaAOA(total)}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant={
                  paymentMethod === "dinheiro" ? "contained" : "outlined"
                }
                onClick={() => setPaymentMethod("dinheiro")}
                fullWidth
              >
                Dinheiro
              </Button>
              <Button
                variant={
                  paymentMethod === "cartao" ? "contained" : "outlined"
                }
                onClick={() => setPaymentMethod("cartao")}
                fullWidth
              >
                Cartão
              </Button>
            </Stack>
            <Button
              variant="contained"
              sx={{
                mt: 2,
                width: "100%",
                py: 2,
                fontSize: "1.1rem",
                fontWeight: "bold",
                bgcolor: "green",
                color: "white",
              }}
              onClick={handleConfirmSale}
              disabled={itens.length === 0 || !clienteNome.trim()}
            >
              Finalizar Venda
            </Button>
          </Paper>

          {itens.length > 0 && (
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <Paper sx={{ flex: 1, p: 2, borderRadius: 3, boxShadow: 3 }}>
                <Typography variant="h6" color="green">
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
              <Paper sx={{ flex: 1, p: 2, borderRadius: 3, boxShadow: 3 }}>
                <Typography variant="h6" color="green">
                  Quantidade por Produto
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="qtd" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Stack>
          )}

          <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h6" color="green">
              Últimas Vendas
            </Typography>
            {ultimasVendas.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nenhuma venda registrada ainda.
              </Typography>
            ) : (
              ultimasVendas.map((v) => (
                <Box
                  key={v.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #e5e7eb",
                    py: 1,
                  }}
                >
                  <Typography>{v.cliente}</Typography>
                  <Typography>{moedaAOA(v.total)}</Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {new Date(v.data).toLocaleString("pt-AO")}
                  </Typography>
                  <Button size="small" onClick={() => gerarFaturaPDF(v)}>
                    Ver Recibo
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
    sx={{ width: "100%" }}
  >
    {toast.msg}
  </Alert>
</Snackbar>

    </Box>
  );
}
