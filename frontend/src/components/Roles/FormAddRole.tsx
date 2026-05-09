
 import React from 'react';
import { useEffect, useState } from 'react';
import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar';
import api from "../../utils/api";
import Alert from '@mui/material/Alert';


const FormAddFuncionario = ({
  onActionComplete,
  onClose,
}: {
  onActionComplete: () => void;
  onClose: () => void;
}) => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");





  interface State extends SnackbarOrigin {
    open: boolean;
  }
  
  
  const [state, setState] = React.useState<State>({
      open: false,
      vertical: 'bottom',
      horizontal: 'right',
    });
    const { vertical, horizontal, open } = state;
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        nome,
        email,
        senha,
        role: 'vendedor',

      };

      const response = await api.post("/api/auth/register", data);
 
      if (response.status === 201) {  
        onActionComplete();
      
        setState({ ...state, open: true });
      }
   
    } catch (error) {
      console.error("Erro ao cadastrar funcionário:", error);
    }
  };


   const handleClose = () => {
    setState({ ...state, open: false });
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
        <h3 className="font-medium text-black dark:text-white">
          Cadastrar Novo Funcionário
        </h3>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6.5 w-125">
          {/* Nome */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Nome
            </label>
            <input
              type="text"
              placeholder="Digite o nome"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          {/* Usuário */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Usuário
            </label>
            <input
              type="text"
              placeholder="Digite o usuário"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Senha */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Senha
            </label>
            <input
              type="password"
              placeholder="Digite a senha"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          {/* Botão */}
          <button
            type="submit"
            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
          >
            Cadastrar
          </button>
        </div>
      </form>

      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        autoHideDuration={3000}
        open={open}
        key={vertical + horizontal}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity="success"    
          variant="filled"
          sx={{ width: '100%' }}
        >
          Funcionario cadastrado com sucesso!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default FormAddFuncionario;
