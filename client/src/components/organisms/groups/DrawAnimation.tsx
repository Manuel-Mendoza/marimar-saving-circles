import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shuffle, Users, Trophy, X } from 'lucide-react';

interface DrawPosition {
  position: number;
  userId: number;
  name: string;
  delay?: number;
}

interface DrawAnimationProps {
  /** Si la animación está activa */
  isActive: boolean;
  /** Grupo ID */
  groupId: number;
  /** Posiciones finales del sorteo */
  finalPositions: DrawPosition[];
  /** Función para cerrar la animación */
  onClose: () => void;
  /** Función para recargar datos después del sorteo */
  onComplete: () => void;
}

/**
 * Organism: Draw Animation
 * Componente para mostrar el sorteo de posiciones en tiempo real con WebSocket
 */
export const DrawAnimation: React.FC<DrawAnimationProps> = ({
  isActive,
  groupId,
  finalPositions,
  onClose,
  onComplete,
}) => {
  const [revealedPositions, setRevealedPositions] = useState<DrawPosition[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);

  // Conectar al WebSocket cuando se activa la animación
  useEffect(() => {
    if (isActive && groupId) {
      const ws = new WebSocket(`ws://localhost:6001/groups/${groupId}`);

      ws.onopen = () => {
        console.log('Conectado al WebSocket del grupo:', groupId);
        setWsConnection(ws);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Mensaje WebSocket recibido:', data);

          if (data.type === 'DRAW_STARTED') {
            startAnimation(data.animationSequence || data.finalPositions);
          }
        } catch (error) {
          console.error('Error procesando mensaje WebSocket:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('Error en WebSocket:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket desconectado');
        setWsConnection(null);
      };

      // Cleanup
      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    }
  }, [isActive, groupId]);

  // Función para iniciar la animación
  const startAnimation = (positions: DrawPosition[]) => {
    setIsAnimating(true);
    setRevealedPositions([]);
    setCurrentStep(0);

    // Animación secuencial con delays
    positions.forEach((position, index) => {
      setTimeout(() => {
        setRevealedPositions(prev => [...prev, position]);
        setCurrentStep(index + 1);

        // Si es la última posición, completar la animación
        if (index === positions.length - 1) {
          setTimeout(() => {
            setIsAnimating(false);
            onComplete();
          }, 2000); // Esperar 2 segundos después de la última posición
        }
      }, (position.delay || 0));
    });
  };

  // Función para mostrar posiciones simuladas (para testing sin WebSocket)
  const simulateDraw = () => {
    const simulatedPositions = finalPositions.map((pos, index) => ({
      ...pos,
      delay: index * 1000,
    }));
    startAnimation(simulatedPositions);
  };

  const getPositionColor = (position: number, total: number) => {
    if (position === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300'; // Oro
    if (position === 2) return 'bg-gray-100 text-gray-800 border-gray-300'; // Plata
    if (position === 3) return 'bg-orange-100 text-orange-800 border-orange-300'; // Bronce
    if (position <= Math.ceil(total * 0.3)) return 'bg-green-100 text-green-800 border-green-300'; // Top 30%
    if (position <= Math.ceil(total * 0.6)) return 'bg-blue-100 text-blue-800 border-blue-300'; // Top 60%
    return 'bg-gray-100 text-gray-800 border-gray-300'; // Resto
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return `#${position}`;
  };

  if (!isActive) return null;

  return (
    <Dialog open={isActive} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shuffle className="h-6 w-6 text-blue-600" />
            <span>Sorteo de Posiciones - Grupo #{groupId}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado de conexión WebSocket */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                wsConnection?.readyState === WebSocket.OPEN
                  ? 'bg-green-500'
                  : wsConnection?.readyState === WebSocket.CONNECTING
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`} />
              <span className="text-sm font-medium">
                {wsConnection?.readyState === WebSocket.OPEN
                  ? 'Conectado en tiempo real'
                  : wsConnection?.readyState === WebSocket.CONNECTING
                    ? 'Conectando...'
                    : 'Desconectado'
                }
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                <Users className="h-3 w-3 mr-1" />
                {currentStep} / {finalPositions.length}
              </Badge>

              {!wsConnection && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={simulateDraw}
                  disabled={isAnimating}
                >
                  <Trophy className="h-4 w-4 mr-1" />
                  Simular Sorteo
                </Button>
              )}
            </div>
          </div>

          {/* Progreso de la animación */}
          {isAnimating && (
            <div className="text-center py-4">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900 rounded-full">
                <Shuffle className="h-5 w-5 text-blue-600 animate-spin" />
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  Realizando sorteo...
                </span>
              </div>
            </div>
          )}

          {/* Resultados del sorteo */}
          <div className="grid gap-3">
            {revealedPositions.map((position, index) => (
              <Card
                key={position.userId}
                className={`transition-all duration-500 transform ${
                  index === revealedPositions.length - 1 ? 'scale-105 shadow-lg' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border-2 ${getPositionColor(position.position, finalPositions.length)}`}>
                        {getPositionIcon(position.position)}
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {position.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Posición {position.position} de {finalPositions.length}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant="secondary"
                      className={`text-sm px-3 py-1 ${getPositionColor(position.position, finalPositions.length)}`}
                    >
                      Usuario #{position.userId}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mensaje final */}
          {!isAnimating && revealedPositions.length === finalPositions.length && (
            <div className="text-center py-6">
              <div className="inline-flex items-center space-x-2 px-6 py-3 bg-green-50 dark:bg-green-900 rounded-full">
                <Trophy className="h-6 w-6 text-green-600" />
                <span className="font-semibold text-green-700 dark:text-green-300">
                  ¡Sorteo completado!
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Las posiciones han sido asignadas exitosamente
              </p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isAnimating}
            >
              <X className="h-4 w-4 mr-1" />
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
