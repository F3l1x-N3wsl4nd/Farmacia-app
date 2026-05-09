import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  sub: number;
  username: string;
  role: number;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decoded = jwtDecode<User>(token);
        const isExpired = decoded.exp * 1000 < Date.now();
        
        if (!isExpired) {
          setUser(decoded);
          // Sincroniza o role no localStorage para o App.tsx usar
                setUser(decoded);
        } else {
          logout(); // Limpa tudo se estiver expirado
        }
      } catch (error) {
        console.error('Error al decodificar el token', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string) => {
    try {
      localStorage.setItem('token', token);
      const decoded = jwtDecode<User>(token);
  
      setUser(decoded);
    } catch (error) {
      console.error('Erro ao processar login:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role'); // Limpa o role também
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
