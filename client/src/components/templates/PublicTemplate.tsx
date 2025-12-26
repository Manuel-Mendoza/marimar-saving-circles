import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/atoms';
import { Menu, X, User, LogIn } from 'lucide-react';

interface PublicTemplateProps {
  /** Contenido principal de la página */
  children: React.ReactNode;
  /** Mostrar header */
  showHeader?: boolean;
  /** Header fijo */
  fixedHeader?: boolean;
  /** Mostrar footer */
  showFooter?: boolean;
  /** Usuario autenticado (opcional) */
  user?: {
    id: number;
    nombre: string;
    tipo: 'USUARIO' | 'ADMINISTRADOR';
  };
  /** Función para login */
  onLogin?: () => void;
  /** Función para registro */
  onRegister?: () => void;
  /** Función para ir al dashboard */
  onGoToDashboard?: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Template: Layout para páginas públicas
 * Header simple con navegación básica
 */
const PublicTemplate: React.FC<PublicTemplateProps> = ({
  children,
  showHeader = true,
  fixedHeader = false,
  showFooter = true,
  user,
  onLogin,
  onRegister,
  onGoToDashboard,
  isLoading = false,
  className
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const Header = () => {
    if (!showHeader) return null;

    return (
      <header className={cn(
        'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800',
        fixedHeader && 'fixed top-0 left-0 right-0 z-50'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SM</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  San Marimar
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Características
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Cómo funciona
              </a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Acerca de
              </a>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <Button onClick={onGoToDashboard}>
                  Ir al Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={onLogin}>
                    Iniciar Sesión
                  </Button>
                  <Button onClick={onRegister}>
                    Registrarse
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <IconButton
                icon={mobileMenuOpen ? X : Menu}
                size="sm"
                variant="ghost"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                tooltip="Toggle menu"
              />
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a
                href="#features"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Características
              </a>
              <a
                href="#how-it-works"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cómo funciona
              </a>
              <a
                href="#about"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Acerca de
              </a>
              <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-800">
                {user ? (
                  <Button
                    onClick={() => {
                      onGoToDashboard?.();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Ir al Dashboard
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onLogin?.();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Iniciar Sesión
                    </Button>
                    <Button
                      onClick={() => {
                        onRegister?.();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full"
                    >
                      Registrarse
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    );
  };

  const Footer = () => {
    if (!showFooter) return null;

    return (
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SM</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  San Marimar
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Tu plataforma confiable de ahorro colaborativo en Venezuela.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Producto
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Características
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Cómo funciona
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Soporte
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#help" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Centro de ayuda
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Contacto
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
            <p className="text-center text-gray-500 dark:text-gray-400">
              © 2025 San Marimar. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    );
  };

  return (
    <div className={cn('min-h-screen bg-white dark:bg-gray-900', className)}>
      <Header />

      <main className={cn(fixedHeader && showHeader && 'pt-16')}>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PublicTemplate;
