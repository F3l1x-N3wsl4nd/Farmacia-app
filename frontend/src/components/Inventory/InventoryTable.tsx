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
      <div className="rounded-xl bg-white shadow-2xl dark:bg-boxdark border-0 overflow-hidden">
        {/* Header melhorado */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h4 className="text-xl font-bold text-white">Administrar Produtos</h4>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={handleFilter}
                  placeholder="Filtrar por nome..."
                  className="pl-10 pr-4 py-2 rounded-lg border-0 bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 w-64"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <Link
                to="#"
                onClick={handleNewProduct}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-green-600 rounded-lg font-medium hover:bg-gray-100 transition-all shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adicionar
              </Link>
            </div>
          </div>
        </div>

        {/* Lista de produtos com design melhorado */}
        <div className="p-4">
          <div className="flex flex-col gap-4">
            {filteredData.map((product, key) => (
              <div
                key={key}
                className="bg-white dark:bg-boxdark rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row p-5 gap-5">
                  {/* Coluna 1 */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{product.nome}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Dosagem:</span>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{product.dosagem}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Forma:</span>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{product.forma}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Quantidade:</span>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{product.quantidade}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Unidade:</span>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{product.unidade ?? '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Coluna 2 */}
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Fracionável:</span>
                        <p className="font-medium">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${product.fracionavel ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {product.fracionavel ? 'Sim' : 'Não'}
                          </span>
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Compra:</span>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{product.precoCompra} Kz</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Venda:</span>
                        <p className="font-medium text-green-600 dark:text-green-400 font-semibold">{product.precoVenda} Kz</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Lote:</span>
                        <p className="font-mono text-sm text-gray-800 dark:text-gray-200">{product.lote}</p>
                      </div>
                    </div>
                  </div>

                  {/* Coluna 3 */}
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Fabricante:</span>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{product.fabricante}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Categoria:</span>
                        <p className="font-medium">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                            {product.categoria}
                          </span>
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500 dark:text-gray-400">Restrições:</span>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{product.restricoes ?? '-'}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <ActionsMenu {...product} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Paginação melhorada */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 bg-gray-50 dark:bg-gray-800/30">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  fetchProducts(1);
                }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-green-500"
              >
                <option value={1}>1 por página</option>
                <option value={5}>5 por página</option>
                <option value={10}>10 por página</option>
              </select>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                disabled={currentPage === 1}
                onClick={() => fetchProducts(currentPage - 1)}
                className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Anterior
              </button>
              
              <div className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-medium">
                {currentPage} / {totalPages}
              </div>
              
              <button
                disabled={currentPage === totalPages}
                onClick={() => fetchProducts(currentPage + 1)}
                className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Próximo
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total: {filteredData.length} produtos
            </div>
          </div>
        </div>
      </div>

      {newMode && (
        <Dialog open={newMode} onClose={() => setNewMode(false)} aria-labelledby="form-dialog-title" maxWidth="md" fullWidth>
          <DialogContent className="dark:bg-boxdark p-0">
            <FormAdd onClose={handleCloseNewProduct} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default InventoryTable;