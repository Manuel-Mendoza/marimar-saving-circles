import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthTemplate } from '@/components/templates';
import { IconButton, LoadingSpinner } from '@/components/atoms';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormProps {
  onNewUser?: () => void;
  onLoginSuccess?: () => void;
}

/**
 * Organism: Formulario de login mejorado
 * Maneja autenticación de usuarios existentes con mejor UX
 */
const LoginForm: React.FC<LoginFormProps> = ({ onNewUser, onLoginSuccess }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'El correo electrónico es requerido';
    if (!emailRegex.test(email)) return 'Ingresa un correo electrónico válido';
    return '';
  };

  // Password validation
  const validatePassword = (password: string) => {
    if (!password) return 'La contraseña es requerida';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    return '';
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    let error = '';
    if (field === 'email') {
      error = validateEmail(formData.email);
    } else if (field === 'password') {
      error = validatePassword(formData.password);
    }

    if (error) {
      setFieldErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    errors.email = validateEmail(formData.email);
    errors.password = validatePassword(formData.password);

    setFieldErrors(errors);
    setTouched({ email: true, password: true });

    return !Object.values(errors).some(error => error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('Por favor corrige los errores en el formulario');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);

      // Login successful - the AuthContext will handle the state update
      onLoginSuccess?.();
    } catch (err: unknown) {
      console.error('Login error:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Credenciales inválidas. Verifica tu correo y contraseña.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldClassName = (field: string) => {
    const baseClasses =
      'w-full pl-12 pr-4 py-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
    const hasError = fieldErrors[field] && touched[field];

    if (hasError) {
      return `${baseClasses} border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500`;
    }

    return `${baseClasses} border-gray-300 hover:border-gray-400`;
  };

  return (
    <AuthTemplate title="Bienvenido de vuelta" subtitle="Accede a tu cuenta de San Marimar">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
        <p className="text-gray-600">Ingresa tus credenciales para continuar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail
                className={`h-5 w-5 ${fieldErrors.email && touched.email ? 'text-red-400' : 'text-gray-400'}`}
              />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={getFieldClassName('email')}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              aria-invalid={fieldErrors.email ? 'true' : 'false'}
            />
            {formData.email && !fieldErrors.email && touched.email && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            )}
          </div>
          {fieldErrors.email && touched.email && (
            <p id="email-error" className="text-red-600 text-sm flex items-center space-x-1">
              <XCircle className="h-4 w-4" />
              <span>{fieldErrors.email}</span>
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock
                className={`h-5 w-5 ${fieldErrors.password && touched.password ? 'text-red-400' : 'text-gray-400'}`}
              />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Tu contraseña"
              value={formData.password}
              onChange={e => handleInputChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              className={`${getFieldClassName('password')} pr-12`}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              aria-invalid={fieldErrors.password ? 'true' : 'false'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {fieldErrors.password && touched.password && (
            <p id="password-error" className="text-red-600 text-sm flex items-center space-x-1">
              <XCircle className="h-4 w-4" />
              <span>{fieldErrors.password}</span>
            </p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={e => handleInputChange('rememberMe', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm text-gray-600">Recordarme</span>
          </label>
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            onClick={() => {
              /* TODO: Implement forgot password */
            }}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Iniciando sesión...</span>
            </div>
          ) : (
            'Iniciar Sesión'
          )}
        </button>
      </form>

      {/* Sign Up Link */}
      <div className="mt-8 text-center">
        <p className="text-gray-600">
          ¿No tienes cuenta?{' '}
          <button
            onClick={onNewUser}
            className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Regístrate gratis
          </button>
        </p>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-8 py-4 text-center border-t mt-8">
        <p className="text-xs text-gray-500">
          Al iniciar sesión, aceptas nuestros{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Términos de servicio
          </a>{' '}
          y{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Política de privacidad
          </a>
        </p>
      </div>
    </AuthTemplate>
  );
};

export default LoginForm;
