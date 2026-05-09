import BestCustomerTable from '../../components/Reports/BestCustomerTable';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const BestCustomer = () => {
  return (
    <>
      <Breadcrumb pageName="Clientes Estrellas" />

      <div className="flex flex-col gap-10">
        <BestCustomerTable /> 
      </div>
    </>
  );
};

export default BestCustomer;
