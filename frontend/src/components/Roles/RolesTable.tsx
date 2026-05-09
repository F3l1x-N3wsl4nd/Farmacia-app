import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent } from "@mui/material";
import api from "../../utils/api";
import { Role } from "../../types/role";
import ActionsMenu from "./ActionsMenu";
import FormAddRole from "./FormAddRole";

const TabelaRoles = () => {
  const [rolesData, setRolesData] = useState<Role[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [tamanhoPagina, setTamanhoPagina] = useState(5);
  const [modoNovo, setModoNovo] = useState(false);


   const token = localStorage.getItem('token');
  // Buscar roles
  const buscarRoles = async (pagina = 1) => {
    try {
      const response = await api.get('/api/funcionarios',  {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

      setRolesData(response.data);
      setTotalPaginas(response.data.totalPages);
      setPaginaAtual(pagina);
    } catch (error) {
      console.error("Erro ao carregar roles:", error);
    }
  };

  useEffect(() => {
    buscarRoles(paginaAtual);
  }, [tamanhoPagina]);

  // Fechar modal de novo role
  const fecharNovoRole = () => setModoNovo(false);

  // Abrir modal de novo role
  const abrirNovoRole = () => setModoNovo(true);

  return (
    <>
      {/* Card principal */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Cabeçalho */}
        <div className="flex flex-wrap items-start justify-between py-6 px-4 md:px-6 xl:px-7.5">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Administrar e gerir os papéis 
          </h4>
          <div className="flex w-full max-w-45 justify-end">
            <Link
              to="#"
              onClick={abrirNovoRole}
              className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-4 xl:px-5"
            >
              Adicionar
            </Link>
          </div>
        </div>

        {/* Cabeçalho da tabela */}
        <div className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
          <div className="col-span-1 flex items-center">
            <p className="font-medium">ID</p>
          </div>
          <div className="col-span-2 hidden items-center sm:flex">
            <p className="font-medium">Nome</p>
          </div>
          <div className="col-span-4 flex items-center">
            <p className="font-medium">Descrição do papel</p>
          </div>
          <div className="col-span-1 flex items-center">
            <p className="font-medium">Ações</p>
          </div>
        </div>


        

        {/* Linhas da tabela */}
        {rolesData.map((role) => (
          <div
            key={role.id}
            className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
          >
            <div className="col-span-1 hidden items-center sm:flex">
              <p className="text-sm text-black dark:text-white">{role.id}</p>
            </div>
            <div className="col-span-2 hidden items-center sm:flex">
              <p className="text-sm text-black dark:text-white">{role.nome}</p>
            </div>
            <div className="col-span-4 hidden items-center sm:flex">
              <p className="text-sm text-black dark:text-white">{role.role}</p>
            </div>
            <ActionsMenu {...role}  />
          </div>
        ))}
      </div>

      {/* Paginação */}
      <div className="flex justify-between items-center py-4 w-100 ml-auto">
        <div className="py-4">
          <select
            value={tamanhoPagina}
            onChange={(e) => {
              setTamanhoPagina(Number(e.target.value));
              buscarRoles(1);
            }}
            className="border rounded px-2 py-1 dark:border-form-strokedark dark:bg-form-input"
          >
            <option value={1}>1</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
          </select>
        </div>

        <button
          disabled={paginaAtual === 1}
          onClick={() => buscarRoles(paginaAtual - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 dark:border-form-strokedark dark:bg-form-input"
        >
          Anterior
        </button>

        <p className="text-sm">
          Página {paginaAtual} de {totalPaginas}
        </p>

        <button
          disabled={paginaAtual === totalPaginas}
          onClick={() => buscarRoles(paginaAtual + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 dark:border-form-strokedark dark:bg-form-input"
        >
          Seguinte
        </button>
      </div>

      {/* Modal adicionar */}
      {modoNovo && (
        <Dialog open={modoNovo} onClose={fecharNovoRole} aria-labelledby="form-dialog-title">
          <DialogContent className="dark:bg-boxdark">
            <FormAddRole onActionComplete={buscarRoles} onClose={fecharNovoRole} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default TabelaRoles;
