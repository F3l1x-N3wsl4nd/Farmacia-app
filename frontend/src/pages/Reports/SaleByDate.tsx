import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import SaleByDateTable from '../../components/Reports/SaleByDate';

const SaleByDate = () => {
  return (
    <>
      <Breadcrumb pageName="Ventas" />

      <div className="flex flex-col gap-10">
        <SaleByDateTable /> 
      </div>
    </>
  );
};

export default SaleByDate;
