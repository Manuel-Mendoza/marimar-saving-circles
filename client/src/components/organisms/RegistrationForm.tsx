import React, { useState, useRef } from 'react';
import { AuthTemplate } from '@/components/templates';
import { apiClient } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  FileText,
  Camera,
} from 'lucide-react';

interface RegistrationFormProps {
  onBack?: () => void;
  onRegistrationSuccess?: () => void;
}

/**
 * Organism: Formulario de registro mejorado
 * Maneja registro de nuevos usuarios con mejor UX
 */
const RegistrationForm: React.FC<RegistrationFormProps> = ({ onBack, onRegistrationSuccess }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    direccion: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [dialogErrorMessage, setDialogErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation functions
  const validateName = (name: string) => {
    if (!name.trim()) return 'El nombre es requerido';
    if (name.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
    return '';
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'El correo electrónico es requerido';
    if (!emailRegex.test(email)) return 'Ingresa un correo electrónico válido';
    return '';
  };

  const validatePhone = (phone: string) => {
    // Remove all spaces, dashes, and dots for validation
    const cleanPhone = phone.replace(/[\s\-.]/g, '');
    const phoneRegex = /^(\+58)?0?4\d{2}\d{7}$/;
    if (!phone) return 'El teléfono es requerido';
    if (!phoneRegex.test(cleanPhone)) return 'Ingresa un número de teléfono venezolano válido';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'La contraseña es requerida';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) return 'Debe contener mayúsculas y minúsculas';
    if (!/(?=.*\d)/.test(password)) return 'Debe contener al menos un número';
    return '';
  };

  const validateCedula = (cedula: string) => {
    if (!cedula) return 'La cédula es requerida';
    if (cedula.length < 7) return 'La cédula debe tener al menos 7 caracteres';
    return '';
  };

  const validateDireccion = (direccion: string) => {
    if (!direccion) return 'La dirección es requerida';
    if (direccion.length < 10) return 'La dirección debe tener al menos 10 caracteres';
    return '';
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) return 'Confirma tu contraseña';
    if (confirmPassword !== formData.password) return 'Las contraseñas no coinciden';
    return '';
  };

  const validateFile = (file: File | null) => {
    if (!file) return 'Debes subir una foto de perfil';
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) return 'Solo se permiten imágenes (JPG, PNG)';
    if (file.size > 5 * 1024 * 1024) return 'El archivo no debe superar 5MB';
    return '';
  };

  const handleInputChange = (field: string, value: string) => {
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
    switch (field) {
      case 'nombre':
        error = validateName(formData.nombre);
        break;
      case 'apellido':
        error = validateName(formData.apellido);
        break;
      case 'cedula':
        error = validateCedula(formData.cedula);
        break;
      case 'telefono':
        error = validatePhone(formData.telefono);
        break;
      case 'direccion':
        error = validateDireccion(formData.direccion);
        break;
      case 'email':
        error = validateEmail(formData.email);
        break;
      case 'password':
        error = validatePassword(formData.password);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(formData.confirmPassword);
        break;
    }

    if (error) {
      setFieldErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      setFieldErrors(prev => ({ ...prev, profilePhoto: '' }));
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    errors.nombre = validateName(formData.nombre);
    errors.apellido = validateName(formData.apellido);
    errors.cedula = validateCedula(formData.cedula);
    errors.telefono = validatePhone(formData.telefono);
    errors.direccion = validateDireccion(formData.direccion);
    errors.email = validateEmail(formData.email);
    errors.password = validatePassword(formData.password);
    errors.confirmPassword = validateConfirmPassword(formData.confirmPassword);
    errors.profilePhoto = validateFile(profilePhoto);

    if (!acceptedTerms) {
      setError('Debes aceptar los términos y condiciones');
      return false;
    }

    setFieldErrors(errors);
    setTouched({
      nombre: true,
      apellido: true,
      cedula: true,
      telefono: true,
      direccion: true,
      email: true,
      password: true,
      confirmPassword: true,
      profilePhoto: true,
    });

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
      // Create FormData for API call
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('apellido', formData.apellido);
      formDataToSend.append('cedula', formData.cedula);
      formDataToSend.append('telefono', formData.telefono);
      formDataToSend.append('direccion', formData.direccion);
      formDataToSend.append('correoElectronico', formData.email);
      formDataToSend.append('password', formData.password);

      if (profilePhoto) {
        formDataToSend.append('imagenCedula', profilePhoto);
      }

      // Call registration API
      const response = await apiClient.register(formDataToSend);

      if (response.success) {
        setShowSuccessDialog(true);
      } else {
        setDialogErrorMessage(
          response.message || 'Error al registrar usuario. Inténtalo de nuevo.'
        );
        setShowErrorDialog(true);
      }
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Registration error details:', err instanceof Error ? err.message : err);
      setDialogErrorMessage('Error al registrar usuario. Inténtalo de nuevo.');
      setShowErrorDialog(true);
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

  const removeFile = () => {
    setProfilePhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    const fields = [
      'nombre',
      'apellido',
      'cedula',
      'telefono',
      'direccion',
      'email',
      'password',
      'confirmPassword',
    ];
    const completedFields = fields.filter(
      field => formData[field as keyof typeof formData] && !fieldErrors[field]
    );
    return profilePhoto && !fieldErrors.profilePhoto
      ? completedFields.length + 1
      : completedFields.length;
  };

  const completionPercentage = (getCompletionPercentage() / 9) * 100;

  return (
    <AuthTemplate
      title="Únete a San Marimar"
      subtitle="Comienza tu viaje hacia el ahorro colaborativo"
    >
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso del registro</span>
          <span className="text-sm text-gray-500">{Math.round(completionPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear Cuenta</h2>
        <p className="text-gray-600">Completa tu información para comenzar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <span>Información Personal</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="space-y-2">
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                Nombre *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User
                    className={`h-5 w-5 ${fieldErrors.nombre && touched.nombre ? 'text-red-400' : 'text-gray-400'}`}
                  />
                </div>
                <input
                  id="nombre"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Tu nombre"
                  value={formData.nombre}
                  onChange={e => handleInputChange('nombre', e.target.value)}
                  onBlur={() => handleBlur('nombre')}
                  className={getFieldClassName('nombre')}
                  aria-describedby={fieldErrors.nombre ? 'nombre-error' : undefined}
                  aria-invalid={fieldErrors.nombre ? 'true' : 'false'}
                />
                {formData.nombre && !fieldErrors.nombre && touched.nombre && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              {fieldErrors.nombre && touched.nombre && (
                <p id="nombre-error" className="text-red-600 text-sm flex items-center space-x-1">
                  <XCircle className="h-4 w-4" />
                  <span>{fieldErrors.nombre}</span>
                </p>
              )}
            </div>

            {/* Apellido */}
            <div className="space-y-2">
              <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
                Apellido *
              </label>
              <input
                id="apellido"
                type="text"
                autoComplete="family-name"
                placeholder="Tu apellido"
                value={formData.apellido}
                onChange={e => handleInputChange('apellido', e.target.value)}
                onBlur={() => handleBlur('apellido')}
                className={getFieldClassName('apellido')}
                aria-describedby={fieldErrors.apellido ? 'apellido-error' : undefined}
                aria-invalid={fieldErrors.apellido ? 'true' : 'false'}
              />
              {formData.apellido && !fieldErrors.apellido && touched.apellido && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}
              {fieldErrors.apellido && touched.apellido && (
                <p id="apellido-error" className="text-red-600 text-sm flex items-center space-x-1">
                  <XCircle className="h-4 w-4" />
                  <span>{fieldErrors.apellido}</span>
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo electrónico *
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

          {/* Teléfono */}
          <div className="space-y-2">
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
              Teléfono *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone
                  className={`h-5 w-5 ${fieldErrors.telefono && touched.telefono ? 'text-red-400' : 'text-gray-400'}`}
                />
              </div>
              <input
                id="telefono"
                type="tel"
                autoComplete="tel"
                placeholder="412 123 4567"
                value={formData.telefono}
                onChange={e => handleInputChange('telefono', e.target.value)}
                onBlur={() => handleBlur('telefono')}
                className={getFieldClassName('telefono')}
                aria-describedby={fieldErrors.telefono ? 'telefono-error' : undefined}
                aria-invalid={fieldErrors.telefono ? 'true' : 'false'}
              />
              {formData.telefono && !fieldErrors.telefono && touched.telefono && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}
            </div>
            {fieldErrors.telefono && touched.telefono && (
              <p id="telefono-error" className="text-red-600 text-sm flex items-center space-x-1">
                <XCircle className="h-4 w-4" />
                <span>{fieldErrors.telefono}</span>
              </p>
            )}
          </div>

          {/* Cédula */}
          <div className="space-y-2">
            <label htmlFor="cedula" className="block text-sm font-medium text-gray-700">
              Cédula *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FileText
                  className={`h-5 w-5 ${fieldErrors.cedula && touched.cedula ? 'text-red-400' : 'text-gray-400'}`}
                />
              </div>
              <input
                id="cedula"
                type="text"
                autoComplete="off"
                placeholder="V-12345678"
                value={formData.cedula}
                onChange={e => handleInputChange('cedula', e.target.value)}
                onBlur={() => handleBlur('cedula')}
                className={getFieldClassName('cedula')}
                aria-describedby={fieldErrors.cedula ? 'cedula-error' : undefined}
                aria-invalid={fieldErrors.cedula ? 'true' : 'false'}
              />
              {formData.cedula && !fieldErrors.cedula && touched.cedula && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}
            </div>
            {fieldErrors.cedula && touched.cedula && (
              <p id="cedula-error" className="text-red-600 text-sm flex items-center space-x-1">
                <XCircle className="h-4 w-4" />
                <span>{fieldErrors.cedula}</span>
              </p>
            )}
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
              Dirección *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User
                  className={`h-5 w-5 ${fieldErrors.direccion && touched.direccion ? 'text-red-400' : 'text-gray-400'}`}
                />
              </div>
              <input
                id="direccion"
                type="text"
                autoComplete="address"
                placeholder="Dirección completa de tu domicilio"
                value={formData.direccion}
                onChange={e => handleInputChange('direccion', e.target.value)}
                onBlur={() => handleBlur('direccion')}
                className={getFieldClassName('direccion')}
                aria-describedby={fieldErrors.direccion ? 'direccion-error' : undefined}
                aria-invalid={fieldErrors.direccion ? 'true' : 'false'}
              />
              {formData.direccion && !fieldErrors.direccion && touched.direccion && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}
            </div>
            {fieldErrors.direccion && touched.direccion && (
              <p id="direccion-error" className="text-red-600 text-sm flex items-center space-x-1">
                <XCircle className="h-4 w-4" />
                <span>{fieldErrors.direccion}</span>
              </p>
            )}
          </div>
        </div>

        {/* Security */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Lock className="h-5 w-5 text-blue-600" />
            <span>Seguridad</span>
          </h3>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña *
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
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres, mayúsculas, minúsculas y números"
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

          {/* Confirm Password */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar contraseña *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock
                  className={`h-5 w-5 ${fieldErrors.confirmPassword && touched.confirmPassword ? 'text-red-400' : 'text-gray-400'}`}
                />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChange={e => handleInputChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                className={`${getFieldClassName('confirmPassword')} pr-12`}
                aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
                aria-invalid={fieldErrors.confirmPassword ? 'true' : 'false'}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && touched.confirmPassword && (
              <p
                id="confirmPassword-error"
                className="text-red-600 text-sm flex items-center space-x-1"
              >
                <XCircle className="h-4 w-4" />
                <span>{fieldErrors.confirmPassword}</span>
              </p>
            )}
          </div>
        </div>

        {/* Profile Photo Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Camera className="h-5 w-5 text-blue-600" />
            <span>Foto de Perfil</span>
          </h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Foto de perfil *</label>

            {!profilePhoto ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  ref={fileInputRef}
                  id="profilePhoto"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-describedby={fieldErrors.profilePhoto ? 'file-error' : undefined}
                />
                <label htmlFor="profilePhoto" className="cursor-pointer">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-4 bg-blue-50 rounded-full">
                      <Camera className="h-10 w-10 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Subir foto de perfil</p>
                      <p className="text-xs text-gray-500">JPG, PNG (máx. 5MB)</p>
                    </div>
                  </div>
                </label>
              </div>
            ) : (
              <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Camera className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-900">{profilePhoto.name}</p>
                      <p className="text-xs text-green-600">
                        {(profilePhoto.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    aria-label="Remover foto"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {fieldErrors.profilePhoto && touched.profilePhoto && (
              <p id="file-error" className="text-red-600 text-sm flex items-center space-x-1">
                <XCircle className="h-4 w-4" />
                <span>{fieldErrors.profilePhoto}</span>
              </p>
            )}
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="space-y-4">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={e => setAcceptedTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm text-gray-600">
              Acepto los{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Términos de servicio
              </a>{' '}
              y{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Política de privacidad
              </a>{' '}
              de San Marimar *
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !acceptedTerms}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Creando tu cuenta...</span>
            </div>
          ) : (
            'Crear Cuenta'
          )}
        </button>
      </form>

      {/* Sign In Link */}
      <div className="mt-8 text-center">
        <p className="text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <button
            onClick={onBack}
            className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Inicia sesión
          </button>
        </p>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-8 py-4 text-center border-t mt-8">
        <p className="text-xs text-gray-500">
          Tus datos están protegidos y se utilizan únicamente para el proceso de registro y
          verificación.
        </p>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              <span>¡Registro exitoso!</span>
            </DialogTitle>
            <DialogDescription>
              Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión y comenzar a
              ahorrar con San Marimar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessDialog(false);
                onBack?.(); // Redirect to login
              }}
            >
              Iniciar sesión
            </Button>
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                onRegistrationSuccess?.();
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <XCircle className="h-6 w-6" />
              <span>Error en el registro</span>
            </DialogTitle>
            <DialogDescription>{dialogErrorMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowErrorDialog(false)}>
              Cerrar
            </Button>
            <Button
              onClick={() => {
                setShowErrorDialog(false);
                // Optionally retry or focus on form
              }}
            >
              Intentar de nuevo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthTemplate>
  );
};

export default RegistrationForm;
