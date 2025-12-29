import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Star, AlertCircle } from 'lucide-react';
import RatingStars from '@/components/atoms/RatingStars';
import { useToast } from '@/hooks/use-toast';

interface RatingModalProps {
  /** Si el modal está abierto */
  open: boolean;
  /** Función para cerrar el modal */
  onOpenChange: (open: boolean) => void;
  /** Usuario a calificar */
  targetUser: {
    id: number;
    nombre: string;
    apellido: string;
  };
  /** ID del grupo (opcional) */
  groupId?: number;
  /** Tipo de calificación */
  ratingType: 'PAYMENT' | 'DELIVERY' | 'COMMUNICATION';
  /** Función callback cuando se envía la calificación */
  onSubmit: (rating: number, comment?: string) => Promise<void>;
}

/**
 * Componente Organism para calificar usuarios
 * Modal completo con formulario de calificación
 */
const RatingModal: React.FC<RatingModalProps> = ({
  open,
  onOpenChange,
  targetUser,
  groupId,
  ratingType,
  onSubmit,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Obtener información del tipo de calificación
  const getRatingTypeInfo = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return {
          title: 'Calificar Pago',
          description: 'Evalúa la puntualidad en los pagos de este usuario',
          placeholder: 'Describe la experiencia con los pagos (opcional)...',
        };
      case 'DELIVERY':
        return {
          title: 'Calificar Entrega',
          description: 'Evalúa el cumplimiento en las entregas de productos',
          placeholder: 'Describe la experiencia con las entregas (opcional)...',
        };
      case 'COMMUNICATION':
        return {
          title: 'Calificar Comunicación',
          description: 'Evalúa la responsividad y claridad en la comunicación',
          placeholder: 'Describe la experiencia de comunicación (opcional)...',
        };
      default:
        return {
          title: 'Calificar Usuario',
          description: 'Evalúa la experiencia con este usuario',
          placeholder: 'Deja un comentario (opcional)...',
        };
    }
  };

  const ratingInfo = getRatingTypeInfo(ratingType);

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: 'Calificación requerida',
        description: 'Por favor selecciona una calificación con estrellas.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(rating, comment.trim() || undefined);

      toast({
        title: 'Calificación enviada',
        description: `Has calificado a ${targetUser.nombre} ${targetUser.apellido} exitosamente.`,
      });

      // Resetear formulario y cerrar modal
      setRating(0);
      setComment('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting rating:', error);

      toast({
        title: 'Error al enviar calificación',
        description: 'Ocurrió un error al enviar tu calificación. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setComment('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            {ratingInfo.title}
          </DialogTitle>
          <DialogDescription>
            Calificando a{' '}
            <strong>
              {targetUser.nombre} {targetUser.apellido}
            </strong>
            <br />
            {ratingInfo.description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selector de estrellas */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Calificación <span className="text-red-500">*</span>
            </Label>

            <div className="flex flex-col items-center gap-3">
              <RatingStars
                rating={rating}
                size="lg"
                interactive={true}
                onRatingChange={setRating}
                showNumber={true}
              />

              {rating > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  {rating === 5 && 'Excelente - Muy satisfecho'}
                  {rating === 4 && 'Bueno - Satisfecho'}
                  {rating === 3 && 'Regular - Ni bueno ni malo'}
                  {rating === 2 && 'Malo - Insatisfecho'}
                  {rating === 1 && 'Muy malo - Muy insatisfecho'}
                </div>
              )}
            </div>
          </div>

          {/* Campo de comentario */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comentario (opcional)</Label>
            <Textarea
              id="comment"
              placeholder={ratingInfo.placeholder}
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              className="resize-none"
              disabled={isSubmitting}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {comment.length}/500 caracteres
            </div>
          </div>

          {/* Alerta informativa */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Esta calificación es privada y solo se usa para calcular la reputación del usuario.
              Ayuda a mantener la confianza en la comunidad.
            </AlertDescription>
          </Alert>

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>

            <Button type="submit" disabled={rating === 0 || isSubmitting} className="min-w-[100px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Calificación'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal;
