import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import UsersTable from '../../components/Users/UsersTable';

const Users = () => {
  return (
    <>
      <Breadcrumb pageName="Produtos Vendidos" />

      <div className="flex flex-col gap-10">
        <UsersTable />
      </div>
    </>
  );
};

export default Users;
