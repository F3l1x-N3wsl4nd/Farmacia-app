import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoutes = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // No Electron, o loading é crucial para evitar que o utilizador 
  // seja expulso para o login enquanto o token ainda está a ser lido do disco.
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-boxdark">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Se não houver utilizador após o loading terminar, redireciona para o login.
  // Usamos o state para que, após o login, o utilizador volte para a página onde estava.
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Se houver utilizador, renderiza as rotas filhas (Outlet).
  return <Outlet />;
};

export default ProtectedRoutes;
