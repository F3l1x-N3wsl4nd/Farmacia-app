 import React from 'react';
import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar';
import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Alert from '@mui/material/Alert';

interface FormEditProps {
  id: number;
  nome: string;
  email: string;
  senha: string;
  role: string;
  onClose: () => void;
}


 

const FormEdit = ({ id, onClose }: FormEditProps) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [mensagem, setMensagem] = useState<string | null>(null);
  const [tipoMensagem, setTipoMensagem] = useState<'success' | 'error' | null>(null);

  const token = localStorage.getItem('token');

interface State extends SnackbarOrigin {
  open: boolean;
}


const [state, setState] = React.useState<State>({
    open: false,
    vertical: 'bottom',
    horizontal: 'right',
  });
  const { vertical, horizontal, open } = state;



  // Carregar dados do produto ao abrir o form
  useEffect(() => {
    const fetchProduto = async () => {
      try {
        const response = await api.get(`/api/funcionarios/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = response.data;

        setNome(data.nome || '');
        setEmail(data.email || '');
        setSenha(data.senha || '');
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
        setMensagem('Erro ao carregar produto.');
        setTipoMensagem('error');
        setTimeout(() => setMensagem(null), 3000);
      }
    };

    fetchProduto();
  }, [id, token]);

  // 🔹 Atualizar produto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.put(
        `/api/funcionarios/${id}`,
        {
          nome,
          email,
          senha,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.status === 200) {
         setState({ ...state, open: true });
      
        setTipoMensagem('success');

        setTimeout(() => {
          setMensagem(null);
          onClose(); // fecha modal depois de sucesso
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      setMensagem('Erro ao atualizar produto.');
      setTipoMensagem('error');
      setTimeout(() => setMensagem(null), 3000);
    }
  };
      const handleClose = () => {
    setState({ ...state, open: false });
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
        <h3 className="font-medium text-black dark:text-white">
          Editar Funcionario
        </h3>
      </div>

      {/* Mensagem de feedback */}
      {mensagem && (
        <div
          className={`m-4 p-3 rounded ${
            tipoMensagem === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {mensagem}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="p-6.5">
          {/* Nome */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">Nome</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              type="text"
              placeholder="Nome do produto"
              className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
              required
            />
          </div>

          {/* Dosagem */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">Usuario</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="text"
              placeholder="Nome"
              className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
              required
            />
          </div>

          {/* Forma + Quantidade */}
          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">Senha</label>
            <input
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              type="text"
              placeholder="Nova senha"
              className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
              required
            />
          </div>
        
          </div>

         

          {/* Botão salvar */}
          <button
            type="submit"
            className="flex w-full justify-center rounded bg-success p-3 font-medium text-gray hover:bg-opacity-90"
          >
            Salvar alterações
          </button>

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
    Produto atualizado com sucesso!
  </Alert>
</Snackbar>

        </div>
      </form>
       
    </div>

  );
};

export default FormEdit;
