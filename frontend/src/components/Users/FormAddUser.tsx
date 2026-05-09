import { useState } from 'react';
import SelectGroupRole from './SelectGroupRole';
import api from '../../utils/api';
import SelectGroupAgency from '../Reports/Filters/SelectGroupAgency';

const FormAddUser = ({
  onActionComplete,
  onClose,
}: {
  onActionComplete: () => void;
  onClose: () => void;
}) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedAgency, setSelectedAgency] = useState(0)
  const [nombreEmpleado, setNombreEmpleado] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
  };

  const handleAgencyChange = (agency: number) => {
    setSelectedAgency(agency);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        nombre_persona: nombreEmpleado,
        username: username,
        password: password,
        id_rol: parseInt(selectedRole),
        id_sucursal: selectedAgency
      };
      const response = await api.post('/auth/register', data);
      if (response.status === 201) {
        onActionComplete();
        onClose()
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Agregar nuevo usuario
          </h3>
        </div>
        <form action="#">
          <div className="p-6.5">
            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black dark:text-white">
                  Nombre empledo
                </label>
                <input
                  type="text"
                  placeholder="Nombre completo"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  onChange={(e) => setNombreEmpleado(e.target.value)}
                />
              </div>

              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black dark:text-white">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Nombre de usuario"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <SelectGroupRole onChange={handleRoleChange} />

            <SelectGroupAgency onChange={handleAgencyChange} />

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Contraseña <span className="text-meta-1">*</span>
              </label>
              <input
                type="password"
                placeholder="Ingresa una contraseña segura"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
              onClick={handleSubmit}
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default FormAddUser;
