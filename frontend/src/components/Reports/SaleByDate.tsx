import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { SaleByDate } from '../../types/saleByDate';
import DatePickerTwoReport from './Filters/SelectDateTwo';

const SaleByDateTable = () => {
  const [productsData, setProductsData] = useState<SaleByDate[]>([]);
  const [dateRange, setDateRange] = useState<string[]>([]);

  const fetchData = async () => {
    if (dateRange.length === 2) {
      try {
        const response = await api.get('/quotes/sale-by-date', {
          params: {
            startDate: dateRange[0],
            endDate: dateRange[1],
          },
        });
        setProductsData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="py-6 px-4 md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Ventas por rango de fechas
        </h4>
        <DatePickerTwoReport onDateChange={(dates) => setDateRange(dates)} />
      </div>

      <div>
        <div className="grid grid-cols-3 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
          <div className="col-span-3 flex items-center">
            <p className="font-medium">Cliente</p>
          </div>
          <div className="col-span-2 hidden items-center sm:flex">
            <p className="font-medium">Cantidad de compras</p>
          </div>
          <div className="col-span-1 flex items-center">
            <p className="font-medium">Sucursal</p>
          </div>
        </div>
        {productsData.map((product, key) => (
          <div
            className="grid grid-cols-3 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
            key={key}
          >
            <div className="col-span-3 flex items-center">
              <p className="text-sm text-black dark:text-white">{product.nombre_cliente}</p>
            </div>
            <div className="col-span-2 hidden items-center sm:flex">
              <p className="text-sm text-black dark:text-white">{product.cantidad_compras}</p>
            </div>
            <div className="col-span-1 flex items-center">
              <p className="text-sm text-black dark:text-white">{product.nombre_sucursal}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SaleByDateTable;
