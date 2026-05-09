import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import Calendar from './pages/Calendar';
import Chart from './pages/Chart';
import ECommerce from './pages/Dashboard/ECommerce';
import FormElements from './pages/Form/FormElements';
import FormLayout from './pages/Form/FormLayout';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Tables from './pages/Tables';
import Alerts from './pages/UiElements/Alerts';
import Buttons from './pages/UiElements/Buttons';
import DefaultLayout from './layout/DefaultLayout';
import ProtectedRoutes from './utils/ProtectedRoutes';
import Inventory from './pages/Inventory/Inventory';
import ProductTransfer from './pages/Product-Transfer/ProductTransfer';
import NewProductTransfer from './pages/Product-Transfer/NewTransfer';
import BestSellingProduct from './pages/Reports/BestSellingProduct';
import LowQuantityProduct from './pages/Reports/LowQuantityProduct';
import ProductByMonth from './pages/Reports/ProductByMounth';
import Users from './pages/Settings/Users';
import Roles from './pages/Settings/Roles';
import POS from './pages/POS/POS';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();
  
  // CORREÇÃO: No Electron/HashRouter, usamos o pathname do react-router
  const isSignInPage = pathname === '/' || pathname === '/auth/signin';
  const role = localStorage.getItem('role');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    // Pequeno delay para garantir que o Electron carregou o estado local
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  // Se for página de login, renderiza sem o DefaultLayout para não quebrar o CSS
  if (isSignInPage) {
    return (
      <>
        <PageTitle title="Sign in | Store Online S.A." />
        <SignIn />
      </>
    );
  }

  return (
    <DefaultLayout>
      <Routes>
        <Route element={<ProtectedRoutes />}>
          
          {/* Dashboard - Proteção por Role corrigida */}
          <Route
            path="/dashboard"
            element={
              role === 'admin' ? (
                <>
                  <PageTitle title="eCommerce Dashboard | Store Online S.A." />
                  <ECommerce />
                </>
              ) : (
                <Navigate to="/pos" replace />
              )
            }
          />

          <Route
            path="/calendar"
            element={
              <>
                <PageTitle title="Calendar | Store Online S.A." />
                <Calendar />
              </>
            }
          />
          
          <Route
            path="/profile"
            element={
              <>
                <PageTitle title="Profile | Store Online S.A." />
                <Profile />
              </>
            }
          />

          <Route
            path="/pos"
            element={
              <>
                <PageTitle title="POS | Store Online S.A." />
                <POS />
              </>
            }
          />

          <Route
            path="/inventory"
            element={
              <>
                <PageTitle title="Inventario | Store Online S.A." />
                <Inventory />
              </>
            }
          />

          <Route
            path="/productTransfer"
            element={
              <>
                <PageTitle title="Transferencias Producto | Store Online S.A." />
                <ProductTransfer />
              </>
            }
          />

          <Route
            path="/newProductTransfer"
            element={
              <>
                <PageTitle title="Nueva Transferencias Producto" />
                <NewProductTransfer/>
              </>
            }
          />

          {/* Configurações Admin */}
          <Route
            path="/settings"
            element={role === 'admin' ? <Settings /> : <Navigate to="/" />}
          />
          <Route
            path="/users"
            element={role === 'admin' ? <Users /> : <Navigate to="/" />}
          />
          <Route
            path="/roles"
            element={role === 'admin' ? <Roles /> : <Navigate to="/" />}
          />

          {/* Relatórios Admin */}
          <Route
            path="/BestSellingProduct"
            element={role === 'admin' ? <BestSellingProduct /> : <Navigate to="/" />}
          />
          <Route
            path="/LowQuantityProduct"
            element={role === 'admin' ? <LowQuantityProduct /> : <Navigate to="/" />}
          />
          <Route
            path="/ProductByMonth"
            element={role === 'admin' ? <ProductByMonth /> : <Navigate to="/" />}
          />

          {/* Outras Rotas */}
          <Route path="/chart" element={<Chart />} />
          <Route path="/ui/alerts" element={<Alerts />} />
          <Route path="/ui/buttons" element={<Buttons />} />
          <Route path="/auth/signup" element={<SignUp />} />
          
        </Route>

        {/* Fallback para rotas não encontradas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DefaultLayout>
  );
}

export default App;
