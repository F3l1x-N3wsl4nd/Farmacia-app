import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import InventoryTable from '../../components/Inventory/InventoryTable';

const Inventory = () => {
  return (
    <>
      <Breadcrumb pageName="Inventario" />

      <div className="flex flex-col gap-10">
        <InventoryTable />
      </div>
    </>
  );
};

export default Inventory;
