import LowQuantityTable from '../../components/Reports/LowQuantityTable';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const LowQuantityProduct = () => {
  return (
    <>
      <Breadcrumb pageName="Productos con existencia menor a 10" />

      <div className="flex flex-col gap-10">
        <LowQuantityTable /> 
      </div>
    </>
  );
};
export default LowQuantityProduct;
