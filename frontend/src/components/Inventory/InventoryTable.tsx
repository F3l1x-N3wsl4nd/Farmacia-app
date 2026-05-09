import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Product } from '../../types/product';
import ActionsMenu from './ActionsMenu';
import { Link } from 'react-router-dom';
import FormAdd from './FormAdd';
import { Dialog, DialogContent } from '@mui/material';

const InventoryTable = () => {
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [filteredData, setFilteredData] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [newMode, setNewMode] = useState(false);
  const [search, setSearch] = useState('');

  const api_url = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  const fetchProducts = async (page = 1) => {
    try {
      const response = await api.get('/api/medicamentos', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const products = response.data.map((product: Product) => ({
        ...product,
        imagen: product.imagen?.replace('http://localhost:3000', api_url),
        existences: product.existences ?? 0,
      }));

      setProductsData(products);
      setFilteredData(products);
      setTotalPages(response.data.totalPages ?? 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [pageSize]);

  const handleFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    const filtered = productsData.filter((p) =>
      p.nome.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleNewProduct = () => setNewMode(true);
  const handleCloseNewProduct = () => setNewMode(false);

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark px-4 md:px-6 2xl:px-7.5 py-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h4 className="text-xl font-semibold text-black dark:text-white">Administrar produtos</h4>

          <input
            type="text"
            value={search}
            onChange={handleFilter}
            placeholder="Filtrar por nome..."
            className="border rounded px-2 py-1 w-60 dark:border-form-strokedark dark:bg-form-input"
          />

          <Link
            to="#"
            onClick={handleNewProduct}
            className="inline-flex items-center justify-center rounded-md bg-success py-2 px-4 text-center font-medium text-white hover:bg-opacity-90"
          >
            Adicionar
          </Link>
        </div>

        {/* Lista de produtos */}
        <div className="flex flex-col gap-4">
          {filteredData.map((product, key) => (
            <div
              key={key}
              className="flex flex-col md:flex-row justify-between border rounded p-4 gap-4 shadow-sm dark:border-strokedark dark:bg-boxdark"
            >
              <div className="flex-1 flex flex-col gap-2 min-w-[150px]">
                <div><strong>Nome:</strong> {product.nome}</div>
                <div><strong>Dosagem:</strong> {product.dosagem}</div>
                <div><strong>Forma:</strong> {product.forma}</div>
                <div><strong>Qtd:</strong> {product.quantidade}</div>
                <div><strong>Unidade:</strong> {product.unidade ?? '-'}</div>
              </div>

              <div className="flex-1 flex flex-col gap-2 min-w-[150px]">
                <div><strong>Fracionável:</strong> {product.fracionavel ? 'Sim' : 'Não'}</div>
                <div><strong>Compra:</strong> {product.precoCompra} Kz</div>
                <div><strong>Venda:</strong> {product.precoVenda} Kz</div>
                <div><strong>Lote:</strong> {product.lote}</div>
                <div><strong>Validade:</strong> {product.validade?.split('T')[0]}</div>
              </div>

              <div className="flex-1 flex flex-col gap-2 min-w-[150px]">
                <div><strong>Fabricante:</strong> {product.fabricante}</div>
                <div><strong>Categoria:</strong> {product.categoria}</div>
                <div><strong>Restrições:</strong> {product.restricoes ?? '-'}</div>
                <div className="mt-auto">
                  <ActionsMenu {...product} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Paginação */}
        <div className="flex justify-between items-center py-4 w-full mt-4 flex-wrap gap-2">
          <div>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                fetchProducts(1);
              }}
              className="border rounded px-2 py-1 dark:border-form-strokedark dark:bg-form-input"
            >
              <option value={1}>1</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </div>
          <button
            disabled={currentPage === 1}
            onClick={() => fetchProducts(currentPage - 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 dark:border-form-strokedark dark:bg-form-input"
          >
            Anterior
          </button>
          <p className="text-sm">Página {currentPage} de {totalPages}</p>
          <button
            disabled={currentPage === totalPages}
            onClick={() => fetchProducts(currentPage + 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 dark:border-form-strokedark dark:bg-form-input"
          >
            Siguiente
          </button>
        </div>
      </div>

      {newMode && (
        <Dialog open={newMode} onClose={() => setNewMode(false)} aria-labelledby="form-dialog-title">
          <DialogContent className="dark:bg-boxdark">
            <FormAdd onClose={handleCloseNewProduct} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default InventoryTable;
