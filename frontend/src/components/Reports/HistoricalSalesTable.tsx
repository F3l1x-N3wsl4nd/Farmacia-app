import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { HistoricalSales } from '../../types/historicalSales';
import { Dialog, DialogContent, Stack, Box } from '@mui/material';
import SelectGroupAgency from './Filters/SelectGroupAgency';

const HistoricalSalesTable = () => {
  const [productsData, setProductsData] = useState<HistoricalSales[]>([]);
  const [sucursalData, setSucursalData] = useState<HistoricalSales[]>([]);
  const [selectedAgency, setSelectedAgency] = useState(0); // Agencia seleccionada
  const [viewMode, setViewMode] = useState<'sucursal' | 'general'>('sucursal');
  const [newMode, setNewMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (selectedAgency === 0) {
          setViewMode('general');
          const response = await api.get('/quotes/historical-sales-general');
          setSucursalData(response.data);
        } else {
          setViewMode('sucursal');
          const response = await api.get(`/quotes/historical-sales-agency/${selectedAgency}`);
          setProductsData(response.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [selectedAgency]);

  const handleAgencyChange = (agency: number) => {
    setSelectedAgency(agency);
  };

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Encabezado con filtro */}
        <Box sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flex: '1 1 auto', flexWrap: 'wrap' }}>
            <SelectGroupAgency onChange={handleAgencyChange} />
          </Stack>
        </Box>

        {/* Contenido de la tabla */}
        {viewMode === 'sucursal' ? (
          <div>
            <div className="grid grid-cols-[1fr,1fr,1fr,1fr] border-t border-stroke py-4.5 px-4 dark:border-strokedark">
              <div className="flex items-center">
                <p className="font-medium">Usuario</p>
              </div>
              <div className="flex items-center">
                <p className="font-medium">Fecha</p>
              </div>
              <div className="flex items-center">
                <p className="font-medium">Hora</p>
              </div>
              <div className="flex items-center">
                <p className="font-medium">Sucursal</p>
              </div>
            </div>
            {productsData.map((product, key) => (
              <div
                className="grid grid-cols-[1fr,1fr,1fr,1fr] border-t border-stroke py-4.5 px-4 dark:border-strokedark"
                key={key}
              >
                <div className="flex items-center">
                  <p className="text-sm text-black dark:text-white">{product.nombre_persona}</p>
                </div>
                <div className="flex items-center">
                  <p className="text-sm text-black dark:text-white">{product.fecha}</p>
                </div>
                <div className="flex items-center">
                  <p className="text-sm text-black dark:text-white">{product.hora}</p>
                </div>
                <div className="flex items-center">
                  <p className="text-sm text-black dark:text-white">{product.nombre_sucursal}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-[1fr,1fr,1fr,1fr] border-t border-stroke py-4.5 px-4 dark:border-strokedark">
              <div className="flex items-center">
                <p className="font-medium">Usuario</p>
              </div>
              <div className="flex items-center">
                <p className="font-medium">Fecha</p>
              </div>
              <div className="flex items-center">
                <p className="font-medium">Hora</p>
              </div>
              <div className="flex items-center">
                <p className="font-medium">Sucursal</p>
              </div>
            </div>
            {sucursalData.map((product, key) => (
              <div
                className="grid grid-cols-[1fr,1fr,1fr,1fr] border-t border-stroke py-4.5 px-4 dark:border-strokedark"
                key={key}
              >
                <div className="flex items-center">
                  <p className="text-sm text-black dark:text-white">{product.nombre_persona}</p>
                </div>
                <div className="flex items-center">
                  <p className="text-sm text-black dark:text-white">{product.fecha}</p>
                </div>
                <div className="flex items-center">
                  <p className="text-sm text-black dark:text-white">{product.hora}</p>
                </div>
                <div className="flex items-center">
                  <p className="text-sm text-black dark:text-white">{product.nombre_sucursal}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {newMode && (
        <Dialog open={newMode} onClose={() => setNewMode(false)} aria-labelledby="form-dialog-title">
          <DialogContent>{/* Contenido del modal */}</DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default HistoricalSalesTable;
