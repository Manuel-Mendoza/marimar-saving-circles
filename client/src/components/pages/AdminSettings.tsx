import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/atoms';
import { useToast } from '@/hooks/use-toast';
import { Smartphone, Building2, Save, Trash2 } from 'lucide-react';
import type { MobilePaymentData, BankPaymentData } from '@/lib/types';
import api from '@/lib/api';

interface AdminSettingsProps {
  user: {
    id: number;
    nombre: string;
    apellido?: string;
    tipo: 'ADMINISTRADOR';
  };
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ user }) => {
  const [mobilePayment, setMobilePayment] = useState<MobilePaymentData | null>(null);
  const [bankPayment, setBankPayment] = useState<BankPaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Estados para editar pago móvil
  const [mobileFormData, setMobileFormData] = useState<MobilePaymentData>({
    numero: '',
    titular: '',
    cedula: '',
    cuentaBancaria: '',
  });

  // Estados para editar pago bancario
  const [bankFormData, setBankFormData] = useState<BankPaymentData>({
    numeroCuenta: '',
    titular: '',
    tipoDocumento: 'V',
    cedula: '',
    banco: '',
    tipoCuenta: 'corriente',
  });

  // Cargar configuración de pagos existente
  const loadPaymentSettings = async () => {
    try {
      setLoading(true);

      // Cargar configuración de pago móvil
      const mobileResponse = await api.getPaymentOptionByType('movil');
      if (mobileResponse.success && mobileResponse.data?.option) {
        const mobileData = JSON.parse(mobileResponse.data.option.detalles) as MobilePaymentData;
        setMobilePayment(mobileData);
        setMobileFormData(mobileData);
      }

      // Cargar configuración de pago bancario
      const bankResponse = await api.getPaymentOptionByType('banco');
      if (bankResponse.success && bankResponse.data?.option) {
        const bankData = JSON.parse(bankResponse.data.option.detalles) as BankPaymentData;
        setBankPayment(bankData);
        setBankFormData(bankData);
      }
    } catch (error) {
      console.error('Error loading payment settings:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las configuraciones de pago',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentSettings();
  }, []);

  // Guardar configuración de pago móvil
  const handleSaveMobilePayment = async () => {
    if (!mobileFormData.numero || !mobileFormData.titular || !mobileFormData.cedula || !mobileFormData.cuentaBancaria) {
      toast({
        title: 'Error',
        description: 'Por favor complete todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      const response = await api.savePaymentOption('movil', mobileFormData);

      if (response.success) {
        setMobilePayment(mobileFormData);
        toast({
          title: 'Éxito',
          description: 'Configuración de pago móvil guardada exitosamente',
        });
      }
    } catch (error) {
      console.error('Error saving mobile payment:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración de pago móvil',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Guardar configuración de pago bancario
  const handleSaveBankPayment = async () => {
    if (!bankFormData.numeroCuenta || !bankFormData.titular || !bankFormData.cedula || !bankFormData.banco) {
      toast({
        title: 'Error',
        description: 'Por favor complete todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      const response = await api.savePaymentOption('banco', bankFormData);

      if (response.success) {
        setBankPayment(bankFormData);
        toast({
          title: 'Éxito',
          description: 'Configuración de pago bancario guardada exitosamente',
        });
      }
    } catch (error) {
      console.error('Error saving bank payment:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración de pago bancario',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Eliminar configuración de pago móvil
  const handleDeleteMobilePayment = async () => {
    if (!mobilePayment) return;

    const confirmDelete = window.confirm(
      '¿Estás seguro de que quieres eliminar la configuración de Pago Móvil? Los usuarios ya no podrán ver esta opción de pago.'
    );

    if (!confirmDelete) return;

    try {
      // Primero obtener el ID de la opción actual
      const response = await api.getPaymentOptionByType('movil');
      if (!response.success || !response.data?.option) {
        toast({
          title: 'Error',
          description: 'No se pudo encontrar la configuración a eliminar',
          variant: 'destructive',
        });
        return;
      }

      const deleteResponse = await api.deletePaymentOption(response.data.option.id);

      if (deleteResponse.success) {
        setMobilePayment(null);
        setMobileFormData({ numero: '', titular: '', cedula: '', cuentaBancaria: '' });
        toast({
          title: 'Éxito',
          description: 'Configuración de pago móvil eliminada exitosamente',
        });
      }
    } catch (error) {
      console.error('Error deleting mobile payment:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la configuración de pago móvil',
        variant: 'destructive',
      });
    }
  };

  // Eliminar configuración de pago bancario
  const handleDeleteBankPayment = async () => {
    if (!bankPayment) return;

    const confirmDelete = window.confirm(
      '¿Estás seguro de que quieres eliminar la configuración de Transferencia Bancaria? Los usuarios ya no podrán ver esta opción de pago.'
    );

    if (!confirmDelete) return;

    try {
      // Primero obtener el ID de la opción actual
      const response = await api.getPaymentOptionByType('banco');
      if (!response.success || !response.data?.option) {
        toast({
          title: 'Error',
          description: 'No se pudo encontrar la configuración a eliminar',
          variant: 'destructive',
        });
        return;
      }

      const deleteResponse = await api.deletePaymentOption(response.data.option.id);

      if (deleteResponse.success) {
        setBankPayment(null);
        setBankFormData({ numeroCuenta: '', titular: '', tipoDocumento: 'V', cedula: '', banco: '', tipoCuenta: 'corriente' });
        toast({
          title: 'Éxito',
          description: 'Configuración de transferencia bancaria eliminada exitosamente',
        });
      }
    } catch (error) {
      console.error('Error deleting bank payment:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la configuración de transferencia bancaria',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Cargando configuración..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Configuración de Pagos
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configura las opciones de pago móvil y datos bancarios que los usuarios verán al realizar sus pagos
        </p>
      </div>

      <Tabs defaultValue="mobile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mobile" className="flex items-center space-x-2">
            <Smartphone className="h-4 w-4" />
            <span>Pago Móvil</span>
          </TabsTrigger>
          <TabsTrigger value="bank" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>Transferencia Bancaria</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mobile" className="space-y-6">
          {/* Vista previa de la configuración actual */}
          {mobilePayment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-5 w-5" />
                    <span>Configuración Actual de Pago Móvil</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteMobilePayment}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Smartphone className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Pago Móvil - {mobilePayment.cuentaBancaria ? `Cuenta: ${mobilePayment.cuentaBancaria}XXXX` : 'Sin cuenta bancaria'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Número: {mobilePayment.numero} | Titular: {mobilePayment.titular} | CI: {mobilePayment.cedula}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formulario para configurar pago móvil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Save className="h-5 w-5" />
                <span>Configurar Pago Móvil</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile-number">Número de teléfono *</Label>
                  <Input
                    id="mobile-number"
                    placeholder="04141234567"
                    value={mobileFormData.numero}
                    onChange={(e) => setMobileFormData(prev => ({ ...prev, numero: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile-id">Cédula del titular *</Label>
                  <Input
                    id="mobile-id"
                    placeholder="V-12345678"
                    value={mobileFormData.cedula}
                    onChange={(e) => setMobileFormData(prev => ({ ...prev, cedula: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile-holder">Nombre del titular *</Label>
                  <Input
                    id="mobile-holder"
                    placeholder="Juan Pérez"
                    value={mobileFormData.titular}
                    onChange={(e) => setMobileFormData(prev => ({ ...prev, titular: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile-bank-account">Cuenta bancaria (primeros 4 dígitos) *</Label>
                  <Input
                    id="mobile-bank-account"
                    placeholder="0108"
                    value={mobileFormData.cuentaBancaria}
                    onChange={(e) => setMobileFormData(prev => ({ ...prev, cuentaBancaria: e.target.value }))}
                  />
                </div>
              </div>
              <Button
                onClick={handleSaveMobilePayment}
                disabled={saving}
                className="w-full md:w-auto"
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Configuración
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank" className="space-y-6">
          {/* Vista previa de la configuración actual */}
          {bankPayment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Configuración Actual de Transferencia Bancaria</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteBankPayment}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Transferencia Bancaria - {bankPayment.banco}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cuenta: ****{bankPayment.numeroCuenta.slice(-4)} | {bankPayment.tipoDocumento}-{bankPayment.cedula} | {bankPayment.tipoCuenta} | Propietario: {bankPayment.titular}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formulario para configurar cuenta bancaria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Save className="h-5 w-5" />
                <span>Configurar Transferencia Bancaria</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account-number">Número de cuenta *</Label>
                  <Input
                    id="account-number"
                    placeholder="01081234567890123456"
                    value={bankFormData.numeroCuenta}
                    onChange={(e) => setBankFormData(prev => ({ ...prev, numeroCuenta: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document-type">Tipo de documento</Label>
                  <select
                    id="document-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={bankFormData.tipoDocumento}
                    onChange={(e) => setBankFormData(prev => ({
                      ...prev,
                      tipoDocumento: e.target.value as 'V' | 'J' | 'E' | 'P'
                    }))}
                  >
                    <option value="V">V - Venezolano</option>
                    <option value="J">J - Jurídico</option>
                    <option value="E">E - Extranjero</option>
                    <option value="P">P - Pasaporte</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account-id">Número de documento *</Label>
                  <Input
                    id="account-id"
                    placeholder="12345678"
                    value={bankFormData.cedula}
                    onChange={(e) => setBankFormData(prev => ({ ...prev, cedula: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-holder">Nombre del propietario *</Label>
                  <Input
                    id="account-holder"
                    placeholder="Empresa XYZ C.A."
                    value={bankFormData.titular}
                    onChange={(e) => setBankFormData(prev => ({ ...prev, titular: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank-name">Ruta completa del banco *</Label>
                  <Input
                    id="bank-name"
                    placeholder="0108 - Banco Mercantil"
                    value={bankFormData.banco}
                    onChange={(e) => setBankFormData(prev => ({ ...prev, banco: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-type">Tipo de cuenta</Label>
                  <select
                    id="account-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={bankFormData.tipoCuenta}
                    onChange={(e) => setBankFormData(prev => ({
                      ...prev,
                      tipoCuenta: e.target.value as 'corriente' | 'ahorros'
                    }))}
                  >
                    <option value="corriente">Cuenta Corriente</option>
                    <option value="ahorros">Cuenta de Ahorros</option>
                  </select>
                </div>
              </div>
              <Button
                onClick={handleSaveBankPayment}
                disabled={saving}
                className="w-full md:w-auto"
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Configuración
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
