import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/atoms';
import { CreditCard, Upload, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { Contribution } from '@/lib/types';

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
  const [formData, setFormData] = useState({
    metodoPago: '',
    referenciaPago: '',
    comprobantePago: null as File | null,
  });

  const { toast } = useToast();

  // Reset form when modal opens/closes or contribution changes
  React.useEffect(() => {
    if (isOpen && contribution) {
      setFormData({
        metodoPago: '',
        referenciaPago: '',
        comprobantePago: null,
      });
    }
  }, [isOpen, contribution]);

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

      // Prepare form data for file upload if needed
      let comprobanteUrl = '';

      if (formData.comprobantePago) {
        // In a real implementation, you would upload the file to a server
        // For now, we'll create a data URL
        comprobanteUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(formData.comprobantePago);
        });
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
              onValueChange={(value) => setFormData(prev => ({ ...prev, metodoPago: value }))}
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



          {/* Payment Receipt Upload */}
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
  );
};
