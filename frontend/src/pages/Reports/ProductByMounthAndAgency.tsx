import ProductByMonthAndAgencyTable from '../../components/Reports/ProductByMonthAndAgencyTable';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const ProductByMonthAndAgency = () => {
  return (
    <>
      <Breadcrumb pageName="Productos" />

      <div className="flex flex-col gap-10">
        <ProductByMonthAndAgencyTable /> 
      </div>
    </>
  );
};
export default ProductByMonthAndAgency;
