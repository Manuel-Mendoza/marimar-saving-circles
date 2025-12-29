import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Star,
  TrendingUp,
  Calendar,
  MessageSquare,
  CreditCard,
  Package,
  Users,
  AlertTriangle,
} from 'lucide-react';
import ReputationBadge from '@/components/atoms/ReputationBadge';
import RatingStars from '@/components/atoms/RatingStars';
import RatingModal from './RatingModal';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface UserReputationCardProps {
  /** ID del usuario */
  userId: number;
  /** Si mostrar opciones para calificar */
  showRatingOptions?: boolean;
  /** ID del grupo actual (para calificaciones contextuales) */
  currentGroupId?: number;
  /** Clases CSS adicionales */
  className?: string;
}

interface ReputationData {
  score: number;
  status: string;
  totalRatings: number;
  paymentReliability: number;
  deliveryReliability: number;
  lastUpdate: string;
  user: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

interface RatingData {
  id: number;
  raterId: number;
  ratingType: string;
  rating: number;
  comment?: string;
  createdAt: string;
  rater: {
    nombre: string;
    apellido: string;
  };
}

/**
 * Componente Organism para mostrar reputación completa de usuario
 * Incluye estadísticas detalladas y opciones de calificación
 */
const UserReputationCard: React.FC<UserReputationCardProps> = ({
  userId,
  showRatingOptions = false,
  currentGroupId,
  className,
}) => {
  const [reputation, setReputation] = useState<ReputationData | null>(null);
  const [ratings, setRatings] = useState<RatingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState<{
    open: boolean;
    type: 'PAYMENT' | 'DELIVERY' | 'COMMUNICATION';
  }>({ open: false, type: 'PAYMENT' });

  const { toast } = useToast();

  // Cargar datos de reputación
  const loadReputationData = useCallback(async () => {
    try {
      setLoading(true);

      // Cargar reputación
      const reputationResponse = await api.getUserReputation(userId);
      setReputation(reputationResponse.data.reputation);

      // Cargar calificaciones (si el usuario actual puede verlas)
      try {
        const ratingsResponse = await api.getUserRatings(userId);
        setRatings(ratingsResponse.data.ratings);
      } catch (error) {
        // Las calificaciones pueden ser privadas
        console.log('Ratings not available');
      }
    } catch (error) {
      console.error('Error loading reputation data:', error);
      toast({
        title: 'Error al cargar reputación',
        description: 'No se pudo cargar la información de reputación.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    loadReputationData();
  }, [loadReputationData]);

  // Manejar envío de calificación
  const handleRatingSubmit = async (rating: number, comment?: string) => {
    const ratingData = {
      ratedId: userId,
      groupId: currentGroupId,
      ratingType: ratingModal.type,
      rating,
      comment,
    };

    await api.createRating(userId, ratingData);

    // Recargar datos después de la calificación
    await loadReputationData();
  };

  // Abrir modal de calificación
  const openRatingModal = (type: 'PAYMENT' | 'DELIVERY' | 'COMMUNICATION') => {
    setRatingModal({ open: true, type });
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calcular porcentaje para barras de progreso
  const getProgressValue = (value: number, max: number = 10) => {
    return Math.min((value / max) * 100, 100);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reputation) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>No se pudo cargar la información de reputación.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-500" />
                Reputación
              </CardTitle>
              <CardDescription>Información de confianza y comportamiento</CardDescription>
            </div>

            <ReputationBadge score={reputation.score} showDetails={true} />
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="details">Detalles</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Estadísticas principales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {reputation.score.toFixed(1)}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Puntuación Total</div>
                </div>

                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {reputation.totalRatings}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">Calificaciones</div>
                </div>

                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {reputation.status}
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">
                    Nivel de Confianza
                  </div>
                </div>
              </div>

              {/* Breakdown por categorías */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Desglose por Categorías
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Pago</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {reputation.paymentReliability.toFixed(1)}/10
                      </span>
                      <Progress
                        value={getProgressValue(reputation.paymentReliability)}
                        className="w-20 h-2"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Entrega</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {reputation.deliveryReliability.toFixed(1)}/10
                      </span>
                      <Progress
                        value={getProgressValue(reputation.deliveryReliability)}
                        className="w-20 h-2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Opciones de calificación */}
              {showRatingOptions && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Calificar Usuario</h4>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openRatingModal('PAYMENT')}
                      className="flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Pagos
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openRatingModal('DELIVERY')}
                      className="flex items-center gap-2"
                    >
                      <Package className="w-4 h-4" />
                      Entregas
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openRatingModal('COMMUNICATION')}
                      className="flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Comunicación
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-6 mt-6">
              {/* Última actualización */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                Última actualización: {formatDate(reputation.lastUpdate)}
              </div>

              {/* Calificaciones recientes */}
              {ratings.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Calificaciones Recientes
                  </h4>

                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {ratings.slice(0, 10).map((rating: RatingData) => (
                      <div key={rating.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {rating.rater.nombre} {rating.rater.apellido}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {rating.ratingType === 'PAYMENT' && 'Pago'}
                              {rating.ratingType === 'DELIVERY' && 'Entrega'}
                              {rating.ratingType === 'COMMUNICATION' && 'Comunicación'}
                            </Badge>
                          </div>
                          <RatingStars rating={rating.rating} size="sm" />
                        </div>

                        {rating.comment && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                            "{rating.comment}"
                          </p>
                        )}

                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {formatDate(rating.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {ratings.length > 10 && (
                    <div className="text-center">
                      <Button variant="outline" size="sm">
                        Ver todas las calificaciones ({ratings.length})
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <Alert>
                  <MessageSquare className="h-4 w-4" />
                  <AlertDescription>Este usuario aún no tiene calificaciones.</AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de calificación */}
      <RatingModal
        open={ratingModal.open}
        onOpenChange={open => setRatingModal(prev => ({ ...prev, open }))}
        targetUser={{
          id: userId,
          nombre: reputation.user.nombre,
          apellido: reputation.user.apellido,
        }}
        groupId={currentGroupId}
        ratingType={ratingModal.type}
        onSubmit={handleRatingSubmit}
      />
    </>
  );
};

export default UserReputationCard;
