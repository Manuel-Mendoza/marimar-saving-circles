import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/atoms';
import { CreditCard, Upload, X, AlertCircle, Smartphone, Building2, Phone, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { Contribution, MobilePaymentData, BankPaymentData } from '@/lib/types';

/**
 * Modal: Payment Request Form
 * Allows users to submit payment requests for their contributions
 */
interface PaymentRequestModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** The contribution to pay for */
  contribution: Contribution | null;
  /** Function to call when payment request is submitted successfully */
  onSuccess?: () => void;
}

export const PaymentRequestModal: React.FC<PaymentRequestModalProps> = ({
  isOpen,
  onClose,
  contribution,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingPaymentOptions, setLoadingPaymentOptions] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState<{
    mobile?: MobilePaymentData;
    bank?: BankPaymentData;
  }>({});
  const [adminPhone, setAdminPhone] = useState<string>('');
  const [showCashDialog, setShowCashDialog] = useState(false);
  const [showMobileDialog, setShowMobileDialog] = useState(false);
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    metodoPago: '',
    referenciaPago: '',
    comprobantePago: null as File | null,
  });

  const { toast } = useToast();

  // Load payment options and admin info when modal opens
  useEffect(() => {
    const loadPaymentOptions = async () => {
      if (!isOpen) return;

      try {
        setLoadingPaymentOptions(true);

        // Load payment options
        const response = await api.getPaymentOptions();
        if (response.success && response.data?.options) {
          const mobileOption = response.data.options.find(opt => opt.tipo === 'movil');
          const bankOption = response.data.options.find(opt => opt.tipo === 'banco');

          setPaymentOptions({
            mobile: mobileOption ? JSON.parse(mobileOption.detalles) as MobilePaymentData : undefined,
            bank: bankOption ? JSON.parse(bankOption.detalles) as BankPaymentData : undefined,
          });

          // Use the mobile payment phone number for cash payments
          const adminPhoneNumber = mobileOption ? (JSON.parse(mobileOption.detalles) as MobilePaymentData).numero : '+58 412-1234567';
          setAdminPhone(adminPhoneNumber);
        } else {
          // Fallback if no payment options loaded
          setAdminPhone('+58 412-1234567');
        }

      } catch (error) {
        console.error('Error loading payment options:', error);
      } finally {
        setLoadingPaymentOptions(false);
      }
    };

    loadPaymentOptions();
  }, [isOpen]);

  // Reset form when modal opens/closes or contribution changes
  React.useEffect(() => {
    if (isOpen && contribution) {
      setFormData({
        metodoPago: '',
        referenciaPago: '',
        comprobantePago: null,
      });
      setShowCashDialog(false);
      setShowMobileDialog(false);
      setShowBankDialog(false);
    }
  }, [isOpen, contribution]);

  // Handle payment method change
  const handlePaymentMethodChange = (value: string) => {
    setFormData(prev => ({ ...prev, metodoPago: value }));

    // Show cash dialog if efectivo is selected
    if (value === 'Efectivo') {
      setShowCashDialog(true);
    } else {
      setShowCashDialog(false);
      setShowMobileDialog(false);
      setShowBankDialog(false);
    }
  };

  // Handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Tipo de archivo inválido',
          description: 'Solo se permiten archivos de imagen',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Archivo demasiado grande',
          description: 'El archivo no debe superar 5MB',
          variant: 'destructive',
        });
        return;
      }

      setFormData(prev => ({ ...prev, comprobantePago: file }));
    }
  };

  // Remove uploaded file
  const removeFile = () => {
    setFormData(prev => ({ ...prev, comprobantePago: null }));
    // Reset file input
    const fileInput = document.getElementById('comprobante-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!contribution) return;

    // Validate required fields
    if (!formData.metodoPago) {
      toast({
        title: 'Campo requerido',
        description: 'Debes seleccionar un método de pago',
        variant: 'destructive',
      });
      return;
    }

    // Check if comprobante is required for VES payments
    const requiereComprobante = contribution.moneda === 'VES';
    if (requiereComprobante && !formData.comprobantePago) {
      toast({
        title: 'Comprobante requerido',
        description: 'Para pagos en VES se requiere un comprobante de pago',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      // Upload receipt image if provided
      let comprobanteUrl = '';

      if (formData.comprobantePago) {
        toast({
          title: 'Subiendo comprobante',
          description: 'Subiendo imagen del comprobante de pago...',
        });

        const uploadResponse = await api.uploadReceipt(formData.comprobantePago);

        if (!uploadResponse.success) {
          toast({
            title: 'Error al subir imagen',
            description: uploadResponse.message || 'No se pudo subir el comprobante',
            variant: 'destructive',
          });
          return;
        }

        comprobanteUrl = uploadResponse.data!.url;
      }

      // Submit payment request
      const response = await api.createPaymentRequest({
        groupId: contribution.groupId,
        periodo: contribution.periodo,
        monto: contribution.monto,
        moneda: contribution.moneda,
        metodoPago: formData.metodoPago,
        referenciaPago: formData.referenciaPago,
        comprobantePago: comprobanteUrl,
      });

      if (response.success) {
        toast({
          title: 'Solicitud enviada',
          description: 'Tu solicitud de pago ha sido enviada exitosamente y está pendiente de aprobación',
        });

        // Call success callback
        if (onSuccess) {
          onSuccess();
        }

        // Close modal
        onClose();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'No se pudo enviar la solicitud de pago',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting payment request:', error);
      toast({
        title: 'Error',
        description: 'Error interno del servidor',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard function
  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      toast({
        title: 'Copiado',
        description: 'El dato ha sido copiado al portapapeles',
      });
      // Reset the copied indicator after 2 seconds
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: 'Error',
        description: 'No se pudo copiar al portapapeles',
        variant: 'destructive',
      });
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: 'VES' | 'USD') => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'VES',
      minimumFractionDigits: 2,
    }).format(amount).replace('Bs.S', 'BcV');
  };

  if (!contribution) return null;

  const requiereComprobante = contribution.moneda === 'VES';

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Solicitud de Pago
            </DialogTitle>
            <DialogDescription>
              Completa la información para enviar tu solicitud de pago
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Details Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalles del Pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Período:</span>
                  <span className="font-semibold">{contribution.periodo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Monto:</span>
                  <span className="font-semibold">{formatCurrency(contribution.monto, contribution.moneda)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Moneda:</span>
                  <span className="font-semibold">{contribution.moneda}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="metodoPago">Método de Pago *</Label>
              <Select
                value={formData.metodoPago}
                onValueChange={handlePaymentMethodChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un método de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Transferencia">Transferencia Bancaria</SelectItem>
                  <SelectItem value="Pago móvil">Pago Móvil</SelectItem>
                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Selected Payment Method Info */}
            {formData.metodoPago && formData.metodoPago !== 'Efectivo' && (
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {formData.metodoPago === 'Pago móvil' ? (
                        <Smartphone className="h-5 w-5 text-green-600" />
                      ) : (
                        <Building2 className="h-5 w-5 text-blue-600" />
                      )}
                      <span>Método seleccionado: {formData.metodoPago}</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (formData.metodoPago === 'Pago móvil') {
                          setShowMobileDialog(true);
                        } else if (formData.metodoPago === 'Transferencia') {
                          setShowBankDialog(true);
                        }
                      }}
                    >
                      Ver Información
                    </Button>
                  </CardTitle>
                </CardHeader>
              </Card>
            )}

            {/* Payment Receipt Upload */}
            {formData.metodoPago !== 'Efectivo' && (
              <div className="space-y-2">
                <Label htmlFor="comprobante-upload">
                  Comprobante de Pago {requiereComprobante && '*'}
                </Label>

                {requiereComprobante && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Para pagos en VES es obligatorio subir un comprobante de pago
                    </p>
                  </div>
                )}

                {!formData.comprobantePago ? (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="comprobante-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                            Subir comprobante
                          </span>
                          <span className="mt-1 block text-sm text-gray-600 dark:text-gray-400">
                            PNG, JPG hasta 5MB
                          </span>
                        </label>
                        <input
                          id="comprobante-upload"
                          name="comprobante-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <Upload className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formData.comprobantePago.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {(formData.comprobantePago.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Solicitud'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Mobile Payment Information Dialog */}
      <Dialog open={showMobileDialog} onOpenChange={() => setShowMobileDialog(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Smartphone className="h-5 w-5" />
              Información de Pago Móvil
            </DialogTitle>
            <DialogDescription>
              Datos necesarios para realizar el pago móvil
            </DialogDescription>
          </DialogHeader>

          {paymentOptions.mobile ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Número de teléfono:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">{paymentOptions.mobile.numero}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(paymentOptions.mobile.numero, 'mobile-numero')}
                          className="h-6 w-6 p-0"
                        >
                          {copiedField === 'mobile-numero' ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Titular:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{paymentOptions.mobile.titular}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(paymentOptions.mobile.titular, 'mobile-titular')}
                          className="h-6 w-6 p-0"
                        >
                          {copiedField === 'mobile-titular' ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Cédula:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{paymentOptions.mobile.cedula}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(paymentOptions.mobile.cedula, 'mobile-cedula')}
                          className="h-6 w-6 p-0"
                        >
                          {copiedField === 'mobile-cedula' ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Cuenta bancaria:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{paymentOptions.mobile.cuentaBancaria}XXXX</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(paymentOptions.mobile.cuentaBancaria, 'mobile-cuenta')}
                          className="h-6 w-6 p-0"
                        >
                          {copiedField === 'mobile-cuenta' ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Instrucciones:</strong> Realiza el pago móvil al número indicado. Una vez realizado, regresa al formulario y sube el comprobante de pago.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setShowMobileDialog(false)}>
                  Entendido
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-8">
                <Smartphone className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Información no disponible
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  El administrador aún no ha configurado las opciones de pago móvil.
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setShowMobileDialog(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bank Transfer Information Dialog */}
      <Dialog open={showBankDialog} onOpenChange={() => setShowBankDialog(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Building2 className="h-5 w-5" />
              Información de Transferencia Bancaria
            </DialogTitle>
            <DialogDescription>
              Datos necesarios para realizar la transferencia bancaria
            </DialogDescription>
          </DialogHeader>

          {paymentOptions.bank ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Número de cuenta:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">{paymentOptions.bank.numeroCuenta}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(paymentOptions.bank.numeroCuenta, 'bank-numeroCuenta')}
                          className="h-6 w-6 p-0"
                        >
                          {copiedField === 'bank-numeroCuenta' ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Tipo de documento:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{paymentOptions.bank.tipoDocumento}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(paymentOptions.bank.tipoDocumento, 'bank-tipoDocumento')}
                          className="h-6 w-6 p-0"
                        >
                          {copiedField === 'bank-tipoDocumento' ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Documento:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{paymentOptions.bank.cedula}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(paymentOptions.bank.cedula, 'bank-cedula')}
                          className="h-6 w-6 p-0"
                        >
                          {copiedField === 'bank-cedula' ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Propietario:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{paymentOptions.bank.titular}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(paymentOptions.bank.titular, 'bank-titular')}
                          className="h-6 w-6 p-0"
                        >
                          {copiedField === 'bank-titular' ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Banco:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{paymentOptions.bank.banco}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(paymentOptions.bank.banco, 'bank-banco')}
                          className="h-6 w-6 p-0"
                        >
                          {copiedField === 'bank-banco' ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Tipo de cuenta:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{paymentOptions.bank.tipoCuenta}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(paymentOptions.bank.tipoCuenta, 'bank-tipoCuenta')}
                          className="h-6 w-6 p-0"
                        >
                          {copiedField === 'bank-tipoCuenta' ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Instrucciones:</strong> Realiza la transferencia a la cuenta indicada. Una vez realizada, regresa al formulario y sube el comprobante de pago.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setShowBankDialog(false)}>
                  Entendido
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-8">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Información no disponible
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  El administrador aún no ha configurado las opciones de transferencia bancaria.
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setShowBankDialog(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cash Payment Coordination Dialog */}
      <Dialog open={showCashDialog} onOpenChange={() => setShowCashDialog(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <Phone className="h-5 w-5" />
              Pago en Efectivo
            </DialogTitle>
            <DialogDescription>
              Coordinación requerida para pago en efectivo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-orange-800 dark:text-orange-200 mb-2">
                    Para pagos en efectivo debes coordinar directamente con el administrador
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                    No puedes enviar una solicitud automática para pagos en efectivo. Debes contactar al administrador para coordinar la entrega del dinero.
                  </p>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      Número del Administrador:
                    </p>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {adminPhone}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCashDialog(false);
                  setFormData(prev => ({ ...prev, metodoPago: '' }));
                }}
              >
                Cambiar Método
              </Button>
              <Button onClick={() => setShowCashDialog(false)}>
                Entendido
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
