// BestSellingProduct.js
import BestSellingTable from '../../components/Reports/BestSellingTable';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const BestSellingProduct = () => {
  return (
    <>
      <Breadcrumb pageName="Productos más vendidos" />

      <div className="flex flex-col gap-10">
        <BestSellingTable /> 
      </div>
    </>
  );
};

export default BestSellingProduct;
