import React from 'react';
import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar';
import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Autocomplete, TextField } from '@mui/material';
import Alert from '@mui/material/Alert';

const FormAdd = ({ onClose }: { onClose: () => void }) => {
  const [produto, setProduto] = useState('');
  const [unidade, setUnidade] = useState('');
  const [fracionavel, setFracionavel] = useState('');
  const [restricoes, setRestricoes] = useState('');
  const [dosagem, setDosagem] = useState('');
  const [forma, setForma] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [compra, setCompra] = useState('');
  const [venda, setVenda] = useState('');
  const [lote, setLote] = useState('');
  const [validade, setValidade] = useState('');
  const [fabricante, setFabricante] = useState('');
  const [descricao, setDescricao] = useState('');

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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post(
        '/api/medicamentos',
        {
          nome: produto,
          unidade: unidade,
          fracionavel: fracionavel,
          restricoes: restricoes,
          dosagem: dosagem,
          forma: forma,
          quantidade: quantidade,
          precoCompra: compra,
          precoVenda: venda,
          lote: lote,
          validade: validade,
          fabricante: fabricante,
          categoria: descricao,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

    
    

      if (response.status === 201) {
          alert('Produto adicionado com sucesso');
        onClose();
          setState({ ...state, open: true });
      }
    } catch (error) {
      console.error(error);
    }
  };

      const handleClose = () => {
    setState({ ...state, open: false });
  };


  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
        <h3 className="font-medium text-black dark:text-white">
          Adicionar novos produtos
        </h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="p-6.5">
          {/* Nome */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Nome <span className="text-meta-1">*</span>
            </label>
            <Autocomplete
              freeSolo
              options={[
                'Paracetamol',
                'Amoxicilina',
                'Ibuprofeno',
                'Metformina',
                'Losartana',
                'Omeprazol',
                'Azitromicina',
                'Ciprofloxacino',
                'Loratadina',
                'Atenolol',
                'Enalapril',
                'Simvastatina',
                'Cetirizina',
                'Salbutamol',
                'Diclofenaco',
                'Albendazol',
                'Dipirona',
                'Hidroclorotiazida',
                'Vitamina C',
                'Ferro Sulfato'
              ]}
              value={produto}
              onInputChange={(e, newValue) => setProduto(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Nome do Produto" required />
              )}
            />
          </div>

           {/* Unidade */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Unidade
            </label>
            <TextField
              type="number"
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
              fullWidth
              placeholder="Unidade"
              required
            />
          </div>


          {/* Fracionavel */}
        
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
            Fracionavel
            </label>
            <Autocomplete
              freeSolo
              options={[
                'Sim',
                'Nao'
              ]}
              value={fracionavel}
              onInputChange={(e, newValue) => setFracionavel(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Fracionavel" />
              )}
            />
          </div>


          {/* Restricoes */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Restrições
            </label>
            <Autocomplete
              freeSolo
              options={[
                'Sem restricoes de venda',
                'Com restricoes de venda',
              ]}
              value={restricoes}
              onInputChange={(e, newValue) => setRestricoes(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Restrições" />
              )}
            />
          </div>


          {/* Dosagem */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Dosagem
            </label>
            <Autocomplete
              freeSolo
              options={[
                '100mg',
                '200mg',
                '250mg',
                '300mg',
                '400mg',
                '500mg',
                '850mg',
                '1g',
                '5mg/ml',
                '20mg/ml'
              ]}
              value={dosagem}
              onInputChange={(e, newValue) => setDosagem(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Dosagem" />
              )}
            />
          </div>

          {/* Forma */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Forma
            </label>
            <Autocomplete
              freeSolo
              options={[
                'Comprimido',
                'Cápsula',
                'Xarope',
                'Suspensão',
                'Injetável',
                'Pomada',
                'Creme',
                'Supositório',
                'Solução oral',
                'Gotas'
              ]}
              value={forma}
              onInputChange={(e, newValue) => setForma(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Forma" />
              )}
            />
          </div>

          {/* Quantidade */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Quantidade
            </label>
            <TextField
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              fullWidth
              placeholder="Quantidade"
              required
            />
          </div>

          {/* Preço compra e venda */}
          <div className="mb-4.5 flex gap-4">
            <TextField
              type="number"
              value={compra}
              onChange={(e) => setCompra(e.target.value)}
              fullWidth
              label="Preço de compra"
              required
            />
            <TextField
              type="number"
              value={venda}
              onChange={(e) => setVenda(e.target.value)}
              fullWidth
              label="Preço de venda"
              required
            />
          </div>

          {/* Lote */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Lote
            </label>
            <Autocomplete
              freeSolo
              options={[
                'AMO20250815',
                'PAR20250610',
                'IBU20251230',
                'MET20250720',
                'LOS20250605'
              ]}
              value={lote}
              onInputChange={(e, newValue) => setLote(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Lote" />
              )}
            />
          </div>

          {/* Validade */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Validade
            </label>
            <TextField
              type="date"
              value={validade}
              onChange={(e) => setValidade(e.target.value)}
              fullWidth
            />
          </div>

          {/* Fabricante */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Fabricante
            </label>
            <Autocomplete
              freeSolo
              options={[
                'Cipla (Índia)',
                'Sun Pharma (Índia)',
                'Dr. Reddy’s (Índia)',
                'Bial (Portugal)',
                'Bluepharma (Portugal)',
                'Generis (Portugal)',
                'Huahai Pharma (China)',
                'Shanghai Pharma (China)',
                'Angomeds (Angola)',
                'Medtech Angola',
                'Farmed (Angola)'
              ]}
              value={fabricante}
              onInputChange={(e, newValue) => setFabricante(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Fabricante" />
              )}
            />
          </div>

          {/* Descrição */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Descrição / Categoria
            </label>
            <TextField
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Descrição do produto"
              required
            />
          </div>

          <button
            type="submit"
            className="flex w-full justify-center rounded bg-success p-3 font-medium text-gray hover:bg-opacity-90"
          >
            Salvar
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

export default FormAdd;
