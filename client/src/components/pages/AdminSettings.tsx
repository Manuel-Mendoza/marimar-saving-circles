import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/atoms';
import { useToast } from '@/hooks/use-toast';
import { Smartphone, Building2, Save } from 'lucide-react';
import type { MobilePaymentData, BankPaymentData } from '@/lib/types';

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
    banco: '',
  });

  // Estados para editar pago bancario
  const [bankFormData, setBankFormData] = useState<BankPaymentData>({
    numeroCuenta: '',
    titular: '',
    banco: '',
    tipoCuenta: 'corriente',
  });

  // Cargar configuración de pagos existente
  const loadPaymentSettings = async () => {
    try {
      setLoading(true);
      // TODO: Implementar llamada a API
      // const response = await api.getPaymentSettings();
      // if (response.success) {
      //   if (response.data.mobile) setMobilePayment(response.data.mobile);
      //   if (response.data.bank) setBankPayment(response.data.bank);
      // }

      // Simulación de datos por ahora
      setMobilePayment({
        numero: '04141234567',
        titular: 'Juan Pérez',
        banco: 'Mercantil'
      });

      setBankPayment({
        numeroCuenta: '01081234567890123456',
        titular: 'Empresa XYZ C.A.',
        banco: 'Banco Mercantil',
        tipoCuenta: 'corriente'
      });

      // Inicializar formularios con datos existentes
      setMobileFormData({
        numero: '04141234567',
        titular: 'Juan Pérez',
        banco: 'Mercantil'
      });

      setBankFormData({
        numeroCuenta: '01081234567890123456',
        titular: 'Empresa XYZ C.A.',
        banco: 'Banco Mercantil',
        tipoCuenta: 'corriente'
      });
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
    if (!mobileFormData.numero || !mobileFormData.titular) {
      toast({
        title: 'Error',
        description: 'Por favor complete todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      // TODO: Implementar llamada a API
      // const response = await api.saveMobilePayment(mobileFormData);

      // Simulación
      setMobilePayment(mobileFormData);

      toast({
        title: 'Éxito',
        description: 'Configuración de pago móvil guardada exitosamente',
      });
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
    if (!bankFormData.numeroCuenta || !bankFormData.titular || !bankFormData.banco) {
      toast({
        title: 'Error',
        description: 'Por favor complete todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      // TODO: Implementar llamada a API
      // const response = await api.saveBankPayment(bankFormData);

      // Simulación
      setBankPayment(bankFormData);

      toast({
        title: 'Éxito',
        description: 'Configuración de pago bancario guardada exitosamente',
      });
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
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5" />
                  <span>Configuración Actual de Pago Móvil</span>
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
                        Pago Móvil - {mobilePayment.banco || 'Sin banco especificado'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Número: {mobilePayment.numero} | Titular: {mobilePayment.titular}
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
                  <Label htmlFor="mobile-holder">Nombre del titular *</Label>
                  <Input
                    id="mobile-holder"
                    placeholder="Juan Pérez"
                    value={mobileFormData.titular}
                    onChange={(e) => setMobileFormData(prev => ({ ...prev, titular: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile-bank">Banco (opcional)</Label>
                <Input
                  id="mobile-bank"
                  placeholder="Mercantil, Banesco, etc."
                  value={mobileFormData.banco}
                  onChange={(e) => setMobileFormData(prev => ({ ...prev, banco: e.target.value }))}
                />
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
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Configuración Actual de Transferencia Bancaria</span>
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
                        Cuenta: ****{bankPayment.numeroCuenta.slice(-4)} | {bankPayment.tipoCuenta} | Titular: {bankPayment.titular}
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
                  <Label htmlFor="account-holder">Nombre del titular *</Label>
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
                  <Label htmlFor="bank-name">Nombre del banco *</Label>
                  <Input
                    id="bank-name"
                    placeholder="Banco Mercantil"
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
