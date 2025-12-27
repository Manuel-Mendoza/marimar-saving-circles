import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/atoms';

interface AuthTemplateProps {
  /** Contenido principal (formulario) */
  children: React.ReactNode;
  /** Título de la página */
  title?: string;
  /** Subtítulo */
  subtitle?: string;
  /** Texto del enlace alternativo */
  altLinkText?: string;
  /** Función del enlace alternativo */
  onAltLink?: () => void;
  /** Imagen de fondo */
  backgroundImage?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Template: Layout para páginas de autenticación
 * Diseño centrado con formulario destacado
 */
const AuthTemplate: React.FC<AuthTemplateProps> = ({
  children,
  title = 'Bienvenido a San Marimar',
  subtitle = 'Tu plataforma de ahorro colaborativo',
  altLinkText,
  onAltLink,
  backgroundImage,
  isLoading = false,
  className,
}) => {
  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4',
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10" />

      {/* Background Image */}
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <span className="text-white font-bold text-xl">SM</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          {subtitle && <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>}
        </div>

        {/* Auth Form Card */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardContent className="p-6 lg:p-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <LoadingSpinner size="md" text="Verificando..." />
              </div>
            ) : (
              <>
                {children}

                {/* Alternative Link */}
                {altLinkText && onAltLink && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={onAltLink}
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      {altLinkText}
                    </button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2025 San Marimar. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default AuthTemplate;
