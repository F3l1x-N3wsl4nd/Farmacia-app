import { useEffect, useState } from 'react';
import api from '../../utils/api';

import { ProductByMonthAndAgency } from '../../types/productByMonthAndAgency';
import SelectGroupAgencyAndMonth from './Filters/SelectGroupAgencyAndMonths';
import { Dialog, DialogContent, Stack, Box } from '@mui/material';

const ProductByMonthAndAgencyTable = () => {
  const [productsData, setProductsData] = useState<ProductByMonthAndAgency[]>([]);
  const [sucursalData, setSucursalData] = useState<ProductByMonthAndAgency[]>([]);
  const [newMode, setNewMode] = useState(false);
  const [viewMode, setViewMode] = useState<'sucursal' | 'mes'| 'general'>('sucursal');
  const [selectedAgency, setSelectedAgency] = useState<number | string>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (selectedAgency === 0) {
          setViewMode('general');
          const response = await api.get('/detail-quotes/month-product-summary-general');
          setSucursalData(response.data); 
        } else if (selectedAgency === -1 ) {
          setViewMode('mes'); 
          const response = await api.get('/detail-quotes/month-product-summary');
          setSucursalData(response.data); 
        } else {
          setViewMode('sucursal');
          const response = await api.get(
            `/detail-quotes/month-product-summary-agency/${selectedAgency}`
          );
          setProductsData(response.data); 
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [selectedAgency]);

  const handleAgencyChange = (agency: number | string) => {
    setSelectedAgency(agency);
  };

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
    
        <Box sx={{ p: 3 }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', flex: '1 1 auto', flexWrap: 'wrap' }}
          >
            <SelectGroupAgencyAndMonth onChange={handleAgencyChange} />
          </Stack>
        </Box>

     
        {viewMode === 'sucursal' ? (
          <div>
            <div className="grid grid-cols-[2fr,3fr,1fr] border-t border-stroke py-4.5 px-4 dark:border-strokedark">
              <div className="flex items-center">
                <p className="font-medium">Producto</p>
              </div>
              <div className="flex items-center">
                <p className="font-medium">Mes</p>
              </div>
              <div className="flex items-center">
                <p className="font-medium">Cantidad</p>
              </div>
            </div>
            {productsData.map((product, key) => (
              <div
                className="grid grid-cols-[2fr,3fr,1fr] border-t border-stroke py-4.5 px-4 dark:border-strokedark"
                key={key}
              >
                <div className="flex items-center">
                  <p className="text-sm text-black dark:text-white">
                    {product.nombre_producto}
                  </p>
                </div>
                <div className="flex items-center">
                  <p className="text-sm text-black dark:text-white">
                    {product.mes}
                  </p>
                </div>
                <div className="flex items-center">
                  <p className="text-sm text-black dark:text-white">
                    {product.cantidad}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-[2fr,3fr,1fr] border-t border-stroke py-4.5 px-4 dark:border-strokedark">
              <div className="flex items-center">
                <p className="font-medium">Producto</p>
              </div>
              <div className="flex items-center">
                <p className="font-medium">Mes</p>
              </div>
              <div className="flex items-center">
                <p className="font-medium">Cantidad</p>
              </div>
            </div>
            {sucursalData.map((product, key) => (
              <div
                className="grid grid-cols-[2fr,3fr,1fr] border-t border-stroke py-4.5 px-4 dark:border-strokedark"
                key={key}
              >
                <div className="flex items-center">
                  <p className="text-sm text-black dark:text-white">
                    {product.nombre_producto}
                  </p>
                </div>
                <div className="flex items-center">
                  <p className="text-sm text-black dark:text-white">
                    {product.mes}
                  </p>
                </div>
                <div className="flex items-center">
                  <p className="text-sm text-black dark:text-white">
                    {product.cantidad}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

  
      {newMode && (
        <Dialog open={newMode} onClose={() => setNewMode(false)} aria-labelledby="form-dialog-title">
          <DialogContent>{/* Contenido del modal */}</DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ProductByMonthAndAgencyTable;
