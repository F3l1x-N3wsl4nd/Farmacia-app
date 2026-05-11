import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { 
  Box, 
  Stack, 
  CircularProgress, 
  TextField, 
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Pagination
} from '@mui/material';
import { 
  FiSearch, 
  FiClock, 
  FiUser, 
  FiCalendar, 
  FiActivity, 
  FiDownload,
  FiFilter,
  FiRefreshCw,
  FiAlertCircle,
  FiPlusCircle,
  FiEdit,
  FiTrash2,
  FiLogIn,
  FiLogOut
} from 'react-icons/fi';

interface LogEntry {
  id: number;
  usuario: string;
  acao: string;
  tipo_acao: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'export';
  entidade: string;
  entidade_id: number;
  detalhes: string;
  ip: string;
  user_agent: string;
  data: string;
  hora: string;
  nome_sucursal?: string;
  sucursal_id?: number;
}

const HistoricalSalesTable = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [selectedAgency, setSelectedAgency] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [tipoAcao, setTipoAcao] = useState<string>('');
  const [entidade, setEntidade] = useState<string>('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  // Opções fixas de farmácias (substitua pelas suas)
  const farmacias = [
    { id: 1, nome: 'Farmácia Central' },
    { id: 2, nome: 'Farmácia Norte' },
    { id: 3, nome: 'Farmácia Sul' },
  ];

  // Gerar dados mock (substituir pela API real)
  const gerarLogsMock = (): LogEntry[] => {
    const usuarios = [
      'admin@farmacia.com',
      'joao.silva@farmacia.com',
      'maria.santos@farmacia.com',
      'carlos.oliveira@farmacia.com',
      'ana.pereira@farmacia.com'
    ];
    
    const acoesList = [
      { acao: 'Criou novo medicamento', tipo: 'create', entidade: 'Medicamento' },
      { acao: 'Atualizou estoque', tipo: 'update', entidade: 'Estoque' },
      { acao: 'Registrou venda', tipo: 'create', entidade: 'Venda' },
      { acao: 'Excluiu fornecedor', tipo: 'delete', entidade: 'Fornecedor' },
      { acao: 'Login no sistema', tipo: 'login', entidade: 'Auth' },
      { acao: 'Exportou relatório', tipo: 'export', entidade: 'Relatório' },
      { acao: 'Atualizou medicamento', tipo: 'update', entidade: 'Medicamento' },
      { acao: 'Excluiu usuário', tipo: 'delete', entidade: 'Usuario' },
      { acao: 'Logout do sistema', tipo: 'logout', entidade: 'Auth' },
    ];

    const sucursais = ['Farmácia Central', 'Farmácia Norte', 'Farmácia Sul'];
    
    const logs: LogEntry[] = [];
    for (let i = 1; i <= 50; i++) {
      const acaoItem = acoesList[Math.floor(Math.random() * acoesList.length)];
      const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];
      const data = new Date();
      data.setDate(data.getDate() - Math.floor(Math.random() * 30));
      data.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
      
      logs.push({
        id: i,
        usuario: usuario,
        acao: acaoItem.acao,
        tipo_acao: acaoItem.tipo as any,
        entidade: acaoItem.entidade,
        entidade_id: Math.floor(Math.random() * 100),
        detalhes: `Detalhes da operação ${i}`,
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        user_agent: 'Mozilla/5.0',
        data: data.toISOString().split('T')[0],
        hora: `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}:${String(data.getSeconds()).padStart(2, '0')}`,
        nome_sucursal: sucursais[Math.floor(Math.random() * sucursais.length)],
        sucursal_id: Math.floor(Math.random() * 3) + 1
      });
    }
    return logs.sort((a, b) => b.id - a.id);
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      // TODO: Substituir pela API real quando disponível
      // const token = localStorage.getItem('token');
      // const headers = { Authorization: `Bearer ${token}` };
      // const response = await api.get('/api/audit/logs', { headers });
      // setLogs(response.data);
      
      // Usando dados mock enquanto API não está pronta
      setTimeout(() => {
        const mockLogs = gerarLogsMock();
        setLogs(mockLogs);
        setFilteredLogs(mockLogs);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filtrar logs
  useEffect(() => {
    let filtered = [...logs];
    
    // Filtro por agência
    if (selectedAgency !== 0) {
      filtered = filtered.filter(log => log.sucursal_id === selectedAgency);
    }
    
    // Filtro por tipo de ação
    if (tipoAcao) {
      filtered = filtered.filter(log => log.tipo_acao === tipoAcao);
    }
    
    // Filtro por entidade
    if (entidade) {
      filtered = filtered.filter(log => log.entidade === entidade);
    }
    
    // Filtro por busca textual
    if (search) {
      filtered = filtered.filter(log => 
        log.usuario.toLowerCase().includes(search.toLowerCase()) ||
        log.acao.toLowerCase().includes(search.toLowerCase()) ||
        log.detalhes.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    setFilteredLogs(filtered);
    setPage(1);
  }, [logs, selectedAgency, tipoAcao, entidade, search]);

  const getAcaoIcon = (tipo: string) => {
    switch(tipo) {
      case 'create': return <FiPlusCircle className="w-4 h-4 text-green-500" />;
      case 'update': return <FiEdit className="w-4 h-4 text-blue-500" />;
      case 'delete': return <FiTrash2 className="w-4 h-4 text-red-500" />;
      case 'login': return <FiLogIn className="w-4 h-4 text-emerald-500" />;
      case 'logout': return <FiLogOut className="w-4 h-4 text-gray-500" />;
      case 'export': return <FiDownload className="w-4 h-4 text-purple-500" />;
      default: return <FiActivity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAcaoColor = (tipo: string) => {
    switch(tipo) {
      case 'create': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'update': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'delete': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'login': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'logout': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      case 'export': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const resetFilters = () => {
    setTipoAcao('');
    setEntidade('');
    setSearch('');
    setSelectedAgency(0);
    setPage(1);
  };

  const paginatedLogs = filteredLogs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="rounded-xl bg-white shadow-xl dark:bg-boxdark border-0 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <FiActivity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Logs do Sistema</h2>
              <p className="text-blue-100 text-sm mt-1">
                Auditoria completa de todas as ações realizadas no sistema
              </p>
            </div>
          </div>
          
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-white text-sm"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
          <div className="flex-1">
            <FormControl fullWidth size="small">
              <InputLabel>Farmácia</InputLabel>
              <Select
                value={selectedAgency}
                onChange={(e) => setSelectedAgency(Number(e.target.value))}
                label="Farmácia"
              >
                <MenuItem value={0}>Todas as Farmácias</MenuItem>
                {farmacias.map((farm) => (
                  <MenuItem key={farm.id} value={farm.id}>
                    {farm.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          
          <div className="flex-1">
            <FormControl fullWidth size="small">
              <InputLabel>Tipo de Ação</InputLabel>
              <Select
                value={tipoAcao}
                onChange={(e) => setTipoAcao(e.target.value)}
                label="Tipo de Ação"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="create">Criação</MenuItem>
                <MenuItem value="update">Atualização</MenuItem>
                <MenuItem value="delete">Exclusão</MenuItem>
                <MenuItem value="login">Login</MenuItem>
                <MenuItem value="logout">Logout</MenuItem>
                <MenuItem value="export">Exportação</MenuItem>
              </Select>
            </FormControl>
          </div>
          
          <div className="flex-1">
            <FormControl fullWidth size="small">
              <InputLabel>Entidade</InputLabel>
              <Select
                value={entidade}
                onChange={(e) => setEntidade(e.target.value)}
                label="Entidade"
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="Medicamento">Medicamentos</MenuItem>
                <MenuItem value="Venda">Vendas</MenuItem>
                <MenuItem value="Fornecedor">Fornecedores</MenuItem>
                <MenuItem value="Usuario">Usuários</MenuItem>
                <MenuItem value="Estoque">Estoque</MenuItem>
                <MenuItem value="Auth">Autenticação</MenuItem>
                <MenuItem value="Relatório">Relatórios</MenuItem>
              </Select>
            </FormControl>
          </div>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <div className="flex-[2]">
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por usuário, ação ou detalhes..."
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
          
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-all text-gray-700 dark:text-gray-300 text-sm"
          >
            <FiFilter className="w-4 h-4" />
            Limpar Filtros
          </button>
        </Stack>
      </Box>

      {/* Estatísticas */}
      {!loading && filteredLogs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gray-50 dark:bg-gray-800/30">
          <div className="bg-white dark:bg-boxdark rounded-lg p-2 shadow-sm">
            <p className="text-xs text-gray-500">Total Registros</p>
            <p className="text-lg font-bold text-gray-900">{filteredLogs.length}</p>
          </div>
          <div className="bg-white dark:bg-boxdark rounded-lg p-2 shadow-sm">
            <p className="text-xs text-gray-500">Criações</p>
            <p className="text-lg font-bold text-green-600">
              {filteredLogs.filter(l => l.tipo_acao === 'create').length}
            </p>
          </div>
          <div className="bg-white dark:bg-boxdark rounded-lg p-2 shadow-sm">
            <p className="text-xs text-gray-500">Atualizações</p>
            <p className="text-lg font-bold text-blue-600">
              {filteredLogs.filter(l => l.tipo_acao === 'update').length}
            </p>
          </div>
          <div className="bg-white dark:bg-boxdark rounded-lg p-2 shadow-sm">
            <p className="text-xs text-gray-500">Exclusões</p>
            <p className="text-lg font-bold text-red-600">
              {filteredLogs.filter(l => l.tipo_acao === 'delete').length}
            </p>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Usuário</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Ação</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Entidade</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Data/Hora</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">IP</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Sucursal</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10">
                  <CircularProgress size={40} />
                  <p className="text-sm text-gray-500 mt-2">Carregando logs...</p>
                 </td>
               </tr>
            ) : paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10">
                  <div className="flex flex-col items-center">
                    <FiAlertCircle className="w-12 h-12 text-gray-300 mb-2" />
                    <p className="text-gray-500">Nenhum log encontrado</p>
                    <p className="text-gray-400 text-sm mt-1">Tente ajustar os filtros</p>
                  </div>
                 </td>
               </tr>
            ) : (
              paginatedLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FiUser className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-800 dark:text-gray-200">{log.usuario}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getAcaoIcon(log.tipo_acao)}
                      <span className="text-sm text-gray-700 dark:text-gray-300">{log.acao}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Chip 
                      label={log.entidade} 
                      size="small"
                      className={getAcaoColor(log.tipo_acao)}
                      sx={{ height: '24px', fontSize: '11px' }}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{log.data}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <FiClock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{log.hora}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {log.ip}
                    </code>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {log.nome_sucursal || '—'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {!loading && filteredLogs.length > 0 && (
        <div className="flex justify-center py-4 border-t border-gray-200 dark:border-gray-700">
          <Pagination
            count={Math.ceil(filteredLogs.length / itemsPerPage)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            size="small"
          />
        </div>
      )}

      {/* Footer */}
      {!loading && filteredLogs.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 py-2 px-4 bg-gray-50 dark:bg-gray-800/30">
          <p className="text-xs text-gray-500 text-center">
            📋 Total de registros: {filteredLogs.length} | Página {page} de {Math.ceil(filteredLogs.length / itemsPerPage)}
          </p>
        </div>
      )}
    </div>
  );
};

export default HistoricalSalesTable;