import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent } from "@mui/material";
import api from "../../utils/api";
import { Role } from "../../types/role";
import ActionsMenu from "./ActionsMenu";
import FormAddRole from "./FormAddRole";
import { FiPlus, FiSearch, FiUsers, FiShield, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaUserTie } from "react-icons/fa";

const TabelaRoles = () => {
  const [rolesData, setRolesData] = useState<Role[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [tamanhoPagina, setTamanhoPagina] = useState(5);
  const [modoNovo, setModoNovo] = useState(false);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem('token');
  
  // Buscar roles
  const buscarRoles = async (pagina = 1) => {
    try {
      const response = await api.get('/api/funcionarios', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRolesData(response.data);
      setTotalPaginas(Math.ceil(response.data.length / tamanhoPagina));
      setPaginaAtual(pagina);
    } catch (error) {
      console.error("Erro ao carregar roles:", error);
    }
  };

  useEffect(() => {
    buscarRoles(paginaAtual);
  }, [tamanhoPagina]);

  // Filtrar dados
  const filteredData = rolesData.filter(role =>
    role.nome.toLowerCase().includes(search.toLowerCase()) ||
    role.role.toLowerCase().includes(search.toLowerCase())
  );

  // Paginação dos dados filtrados
  const paginatedData = filteredData.slice(
    (paginaAtual - 1) * tamanhoPagina,
    paginaAtual * tamanhoPagina
  );

  const totalPaginasFiltrado = Math.ceil(filteredData.length / tamanhoPagina);

  // Fechar modal de novo role
  const fecharNovoRole = () => setModoNovo(false);

  // Abrir modal de novo role
  const abrirNovoRole = () => setModoNovo(true);

  return (
    <>
      <div className="rounded-xl bg-white shadow-xl dark:bg-boxdark border-0 overflow-hidden">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <FaUserTie className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Gestão de Funcionários</h2>
                <p className="text-purple-100 text-sm mt-1">
                  Administre os papéis e permissões dos funcionários
                </p>
              </div>
            </div>
            
            <Link
              to="#"
              onClick={abrirNovoRole}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-all shadow-md"
            >
              <FiPlus className="w-4 h-4" />
              Novo Funcionário
            </Link>
          </div>
        </div>

        {/* Filtro de busca */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por nome ou função..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-700">
          <div className="bg-white dark:bg-boxdark rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Funcionários</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{rolesData.length}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-2">
                <FiUsers className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-boxdark rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Papéis Diferentes</p>
                <p className="text-xl font-bold text-indigo-600">
                  {new Set(rolesData.map(r => r.role)).size}
                </p>
              </div>
              <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-2">
                <FiShield className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-boxdark rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Exibindo</p>
                <p className="text-xl font-bold text-green-600">
                  {paginatedData.length}
                </p>
                <p className="text-xs text-gray-400">de {filteredData.length}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2">
                <FiUsers className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Cabeçalho da tabela */}
        <div className="grid grid-cols-12 border-b border-gray-200 dark:border-gray-700 py-3 px-4 bg-gray-50 dark:bg-gray-800">
          <div className="col-span-1 flex items-center">
            <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">ID</p>
          </div>
          <div className="col-span-4 flex items-center">
            <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Nome</p>
          </div>
          <div className="col-span-5 flex items-center">
            <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Função / Papel</p>
          </div>
          <div className="col-span-2 flex items-center justify-end">
            <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Ações</p>
          </div>
        </div>

        {/* Linhas da tabela */}
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {paginatedData.map((role, index) => (
            <div
              key={role.id}
              className="grid grid-cols-12 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
            >
              <div className="col-span-1 flex items-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-semibold">
                  {role.id}
                </span>
              </div>
              <div className="col-span-4 flex items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center">
                    <FiUsers className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {role.nome}
                  </span>
                </div>
              </div>
              <div className="col-span-5 flex items-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  {role.role}
                </span>
              </div>
              <div className="col-span-2 flex items-center justify-end">
                <ActionsMenu {...role} />
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4">
              <FiUsers className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum funcionário encontrado
            </h3>
            <p className="text-gray-500 text-sm">
              {search ? 'Tente ajustar os filtros de busca' : 'Clique em "Novo Funcionário" para adicionar'}
            </p>
          </div>
        )}

        {/* Paginação melhorada */}
        {filteredData.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 bg-gray-50 dark:bg-gray-800/30">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Itens por página:</span>
                <select
                  value={tamanhoPagina}
                  onChange={(e) => {
                    setTamanhoPagina(Number(e.target.value));
                    setPaginaAtual(1);
                  }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-purple-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  disabled={paginaAtual === 1}
                  onClick={() => setPaginaAtual(paginaAtual - 1)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  <FiChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Página <span className="font-semibold text-gray-900 dark:text-white">{paginaAtual}</span> de <span className="font-semibold">{totalPaginasFiltrado}</span>
                  </span>
                </div>
                
                <button
                  disabled={paginaAtual === totalPaginasFiltrado}
                  onClick={() => setPaginaAtual(paginaAtual + 1)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Próximo
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-sm text-gray-500">
                Mostrando {((paginaAtual - 1) * tamanhoPagina) + 1} - {Math.min(paginaAtual * tamanhoPagina, filteredData.length)} de {filteredData.length} funcionários
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal adicionar */}
      {modoNovo && (
        <Dialog open={modoNovo} onClose={fecharNovoRole} maxWidth="md" fullWidth>
          <DialogContent className="dark:bg-boxdark p-0">
            <FormAddRole onActionComplete={buscarRoles} onClose={fecharNovoRole} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default TabelaRoles;