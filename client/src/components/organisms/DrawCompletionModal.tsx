import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, CheckCircle, Sparkles } from 'lucide-react';

/**
 * Modal: Draw Completion
 * Shows a celebratory message when the lottery is completed
 */
interface DrawCompletionModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** Group ID */
  groupId: number;
}

export const DrawCompletionModal: React.FC<DrawCompletionModalProps> = ({
  isOpen,
  onClose,
  groupId,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            ¡Sorteo Completado!
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-600 dark:text-gray-400 mt-2">
            Las posiciones han sido asignadas exitosamente para el Grupo #{groupId}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-6">
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-6 w-6" />
            <span className="font-semibold">Todas las posiciones asignadas</span>
          </div>

          <div className="flex items-center space-x-2 text-blue-600">
            <Sparkles className="h-6 w-6" />
            <span className="font-semibold">¡Felicidades a todos los participantes!</span>
          </div>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Ahora puedes ver tu posición en los detalles del grupo
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition hover:scale-105"
          >
            <Trophy className="h-5 w-5 mr-2" />
            ¡Entendido!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
