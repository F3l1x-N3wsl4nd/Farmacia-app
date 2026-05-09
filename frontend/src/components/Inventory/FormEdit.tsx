 import React from 'react';
import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar';
import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Alert from '@mui/material/Alert';

interface FormEditProps {
  id: number;
  nome: string;
  dosagem: string;
  forma: string;
  quantidade: number;
  precoCompra: number;
  precoVenda: number;
  lote: string;
  validade: string;
  fabricante: string;
  categoria: string;
  onClose: () => void;
}


 

const FormEdit = ({ id, onClose }: FormEditProps) => {
  const [nome, setNome] = useState('');
  const [dosagem, setDosagem] = useState('');
  const [forma, setForma] = useState('');
  const [quantidade, setQuantidade] = useState<number | ''>('');
  const [precoCompra, setPrecoCompra] = useState<number | ''>('');
  const [precoVenda, setPrecoVenda] = useState<number | ''>('');
  const [lote, setLote] = useState('');
  const [validade, setValidade] = useState('');
  const [fabricante, setFabricante] = useState('');
  const [categoria, setCategoria] = useState('');

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
        const response = await api.get(`/api/medicamentos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = response.data;

        setNome(data.nome || '');
        setDosagem(data.dosagem || '');
        setForma(data.forma || '');
        setQuantidade(data.quantidade || '');
        setPrecoCompra(data.precoCompra || '');
        setPrecoVenda(data.precoVenda || '');
        setLote(data.lote || '');
        setValidade(data.validade || '');
        setFabricante(data.fabricante || '');
        setCategoria(data.categoria || '');
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
        `/api/medicamentos/${id}`,
        {
          nome,
          dosagem,
          forma,
          quantidade: Number(quantidade),
          precoCompra: Number(precoCompra),
          precoVenda: Number(precoVenda),
          lote,
          validade,
          fabricante,
          categoria,
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
          Editar produto
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
            <label className="mb-2.5 block text-black dark:text-white">Dosagem</label>
            <select
              value={dosagem}
              onChange={(e) => setDosagem(e.target.value)}
              className="border rounded px-2 py-1 dark:border-form-strokedark dark:bg-form-input"
            >
              <option value="">Selecionar Dosagem</option>
              <option value="500mg">500mg</option>
              <option value="200mg">200mg</option>
              <option value="100mg">100mg</option>
            </select>
          </div>

          {/* Forma + Quantidade */}
          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <label className="mb-2.5 block text-black dark:text-white">Forma</label>
              <select
                value={forma}
                onChange={(e) => setForma(e.target.value)}
                className="border rounded px-2 py-1 dark:border-form-strokedark dark:bg-form-input"
              >
                <option value="">Selecionar Forma</option>
                <option value="comprimido">Comprimido</option>
                <option value="xarope">Xarope</option>
              </select>
            </div>
            <div className="w-full xl:w-1/2">
              <label className="mb-2.5 block text-black dark:text-white">Quantidade</label>
              <input
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value ? Number(e.target.value) : '')}
                type="number"
                placeholder="Quantidade"
                className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                required
              />
            </div>
          </div>

          {/* Preço compra + venda */}
          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <label className="mb-2.5 block text-black dark:text-white">Preço de compra</label>
              <input
                value={precoCompra}
                onChange={(e) => setPrecoCompra(e.target.value ? Number(e.target.value) : '')}
                type="number"
                placeholder="Preço"
                className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                required
              />
            </div>
            <div className="w-full xl:w-1/2">
              <label className="mb-2.5 block text-black dark:text-white">Preço de venda</label>
              <input
                value={precoVenda}
                onChange={(e) => setPrecoVenda(e.target.value ? Number(e.target.value) : '')}
                type="number"
                placeholder="Preço"
                className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                required
              />
            </div>
          </div>

          {/* Lote */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">Lote</label>
            <input
              value={lote}
              onChange={(e) => setLote(e.target.value)}
              type="text"
              placeholder="Lote"
              className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
            />
          </div>

          {/* Validade */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">Validade</label>
            <input
              value={validade}
              onChange={(e) => setValidade(e.target.value)}
              type="date"
              className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
            />
          </div>

          {/* Fabricante */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">Fabricante</label>
            <select
              value={fabricante}
              onChange={(e) => setFabricante(e.target.value)}
              className="border rounded px-2 py-1 dark:border-form-strokedark dark:bg-form-input"
            >
              <option value="">Selecionar Fabricante</option>
              <option value="portuges">Portugês</option>
              <option value="indiano">Indiano</option>
            </select>
          </div>

          {/* Categoria */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">Categoria</label>
            <textarea
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded border border-stroke bg-transparent py-3 px-5 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
              required
            />
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
