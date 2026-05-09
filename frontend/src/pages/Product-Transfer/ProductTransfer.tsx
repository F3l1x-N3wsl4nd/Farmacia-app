import ListTransferTable from '../../components/TransferProduct/TransferTable'

const ProductTransfer = () => {
  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900">
      <h2 className="text-2xl font-semibold text-black dark:text-white mb-6">
       Quantidade em estoque
      </h2>
      <ListTransferTable />
    </div>
  );
};

export default ProductTransfer;














import axios from 'axios';
import api from '../../utils/api';

const GIST_ID = 'fbe2fa5552b9a72c064442f24be08b58';
const GITHUB_TOKEN = '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'; // nunca deixa público

async function atualizarGist() {
  try {
    const tokenBackend = localStorage.getItem('token');
    if (!tokenBackend) {
      console.error('Token do backend não encontrado.');
      return;
    }

    const headersBackend = { Authorization: `Bearer ${tokenBackend}` };

    // Busca dados protegidos
    const vendas = (await api.get('/api/vendas', { headers: headersBackend })).data;
    const medicamentos = (await api.get('/api/medicamentos', { headers: headersBackend })).data;

    const dados = { vendas, medicamentos };

    // Atualiza Gist
    await axios.patch(
      `https://api.github.com/gists/${GIST_ID}`,
      {
        files: {
          'dados.json': {
            content: JSON.stringify(dados, null, 2),
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    console.log(' Dados atualizados no GitHub!');
  } catch (err: any) {
    console.error('Erro ao atualizar Gist:', err.response?.data || err.message);
  }
}

 
setInterval(atualizarGist, 80000); // 5 minutos
atualizarGist();
 
