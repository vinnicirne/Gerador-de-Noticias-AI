
import React, { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import { UserType } from '../types';
import AccessDenied from './AccessDenied';
import LoadingSpinner from './LoadingSpinner';

interface PermissionGateProps {
  children: React.ReactNode;
  requiredRole?: UserType; 
  onAccessDenied?: () => void;
}

/**
 * PermissionGate atua como um Middleware de rota.
 * Ele verifica se o usuário atual tem o nível de permissão necessário.
 * Se sim, renderiza os filhos (a rota protegida).
 * Se não, renderiza o componente AccessDenied.
 */
const PermissionGate: React.FC<PermissionGateProps> = ({ 
  children, 
  requiredRole = 'admin', 
  onAccessDenied 
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const user = userService.getUser();
    
    // Lógica hierárquica de permissões
    // Admin tem acesso a tudo
    if (user.userType === 'admin') {
        setHasPermission(true);
        return;
    }

    // Editor tem acesso a editor e user
    if (user.userType === 'editor' && (requiredRole === 'editor' || requiredRole === 'user')) {
        setHasPermission(true);
        return;
    }

    // User só tem acesso a user
    if (user.userType === 'user' && requiredRole === 'user') {
        setHasPermission(true);
        return;
    }

    // Caso contrário, nega acesso
    setHasPermission(false);
  }, [requiredRole]);

  if (hasPermission === null) {
      return (
          <div className="flex items-center justify-center h-full">
              <LoadingSpinner className="h-8 w-8 text-[#1b8a0f]" />
          </div>
      );
  }

  if (!hasPermission) {
    if (onAccessDenied) {
        onAccessDenied();
    }
    return <AccessDenied onGoBack={onAccessDenied} />;
  }

  return <>{children}</>;
};

export default PermissionGate;
