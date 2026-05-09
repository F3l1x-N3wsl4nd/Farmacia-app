import HistoricalSalesTable from '../../components/Reports/HistoricalSalesTable';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const HistoricalSales = () => {
  return (
    <>
      <Breadcrumb pageName="LOGS" />

      <div className="flex flex-col gap-10">
        <HistoricalSalesTable /> 
      </div>
    </>
  );
};
export default HistoricalSales;
