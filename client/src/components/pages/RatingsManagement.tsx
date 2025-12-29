import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { LoadingSpinner } from '@/components/atoms';
import ReputationBadge from '@/components/atoms/ReputationBadge';
import RatingStars from '@/components/atoms/RatingStars';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import {
  Star,
  Users,
  TrendingUp,
  Search,
  Filter,
  Trash2,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
} from 'lucide-react';

interface Rating {
  id: number;
  raterId: number;
  ratedId: number;
  groupId?: number;
  ratingType: string;
  rating: number;
  comment?: string;
  createdAt: string;
  rater: {
    nombre: string;
    apellido: string;
  };
  rated: {
    nombre: string;
    apellido: string;
  };
  group?: {
    nombre: string;
  };
}

interface ReputationStats {
  totalUsers: number;
  averageReputation: number;
  excellentUsers: number;
  reliableUsers: number;
  acceptableUsers: number;
  underObservationUsers: number;
  totalRatings: number;
}

interface RatingsManagementProps {
  user: {
    id: number;
    nombre: string;
    apellido?: string;
    tipo: 'ADMINISTRADOR';
  };
}

export const RatingsManagement: React.FC<RatingsManagementProps> = ({ user }) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState<ReputationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingTypeFilter, setRatingTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ratingToDelete, setRatingToDelete] = useState<Rating | null>(null);

  const { toast } = useToast();

  // Load ratings and stats data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Load ratings and stats
      const ratingsResponse = await api.getAllRatings();

      if (ratingsResponse.success) {
        setRatings(ratingsResponse.data.ratings);
        setStats(ratingsResponse.data.stats);
      }
    } catch (error) {
      console.error('Error loading ratings data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos de calificaciones',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter ratings based on search and filters
  const filteredRatings = ratings.filter(rating => {
    const matchesSearch =
      rating.rated.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rating.rated.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rating.rater.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rating.rater.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rating.comment && rating.comment.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = ratingTypeFilter === 'all' || rating.ratingType === ratingTypeFilter;

    return matchesSearch && matchesType;
  });

  // Handle rating deletion
  const handleDeleteRating = async (rating: Rating) => {
    setRatingToDelete(rating);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteRating = async () => {
    if (!ratingToDelete) return;

    try {
      setActionLoading(ratingToDelete.id);
      const response = await api.deleteRating(ratingToDelete.id);

      if (response.success) {
        toast({
          title: 'Calificación eliminada',
          description: 'La calificación ha sido eliminada exitosamente',
        });
        await loadData(); // Reload data
      }
    } catch (error) {
      console.error('Error deleting rating:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la calificación',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
      setDeleteDialogOpen(false);
      setRatingToDelete(null);
    }
  };

  // Format rating type
  const formatRatingType = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return 'Pago';
      case 'DELIVERY':
        return 'Entrega';
      case 'COMMUNICATION':
        return 'Comunicación';
      default:
        return type;
    }
  };

  // Get rating type color
  const getRatingTypeColor = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'DELIVERY':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'COMMUNICATION':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Cargando sistema de calificaciones..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gestión de Calificaciones
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administra el sistema de reputación y calificaciones de usuarios
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Calificaciones
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalRatings}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                  <Star className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Reputación Promedio
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.averageReputation.toFixed(1)}/10
                  </p>
                </div>
                <div className="p-3 bg-green-100 text-green-600 rounded-full">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Usuarios Excelentes
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.excellentUsers}
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Bajo Observación
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.underObservationUsers}
                  </p>
                </div>
                <div className="p-3 bg-red-100 text-red-600 rounded-full">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="ratings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ratings">Calificaciones ({filteredRatings.length})</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="ratings" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar por usuario o comentario..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={ratingTypeFilter} onValueChange={setRatingTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Tipo de calificación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="PAYMENT">Pagos</SelectItem>
                    <SelectItem value="DELIVERY">Entregas</SelectItem>
                    <SelectItem value="COMMUNICATION">Comunicación</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Ratings List */}
          <div className="space-y-4">
            {filteredRatings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No se encontraron calificaciones
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredRatings.map(rating => (
                <Card key={rating.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Rating Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {rating.rated.nombre} {rating.rated.apellido}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Calificado por {rating.rater.nombre} {rating.rater.apellido}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Badge className={getRatingTypeColor(rating.ratingType)}>
                              {formatRatingType(rating.ratingType)}
                            </Badge>
                            <RatingStars rating={rating.rating} size="sm" />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteRating(rating)}
                              disabled={actionLoading === rating.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Rating Details */}
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-4">
                            {rating.group && <span>Grupo: {rating.group.nombre}</span>}
                            <span>{formatDate(rating.createdAt)}</span>
                          </div>
                        </div>

                        {/* Comment */}
                        {rating.comment && (
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-sm italic text-gray-700 dark:text-gray-300">
                              "{rating.comment}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Análisis del Sistema de Reputación</span>
              </CardTitle>
              <CardDescription>
                Estadísticas detalladas del comportamiento de los usuarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="space-y-6">
                  {/* Reputation Distribution */}
                  <div>
                    <h4 className="font-medium mb-3">Distribución de Reputación</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {stats.excellentUsers}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">
                          Excelentes (≥9.0)
                        </div>
                      </div>

                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {stats.reliableUsers}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                          Confiables (≥7.0)
                        </div>
                      </div>

                      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {stats.acceptableUsers}
                        </div>
                        <div className="text-sm text-yellow-600 dark:text-yellow-400">
                          Aceptables (≥5.0)
                        </div>
                      </div>

                      <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {stats.underObservationUsers}
                        </div>
                        <div className="text-sm text-red-600 dark:text-red-400">
                          Bajo Observación ({'<5.0'})
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rating Types Breakdown */}
                  <div>
                    <h4 className="font-medium mb-3">Tipos de Calificación Más Comunes</h4>
                    <div className="space-y-2">
                      {['PAYMENT', 'DELIVERY', 'COMMUNICATION'].map(type => {
                        const count = ratings.filter(r => r.ratingType === type).length;
                        const percentage =
                          ratings.length > 0 ? ((count / ratings.length) * 100).toFixed(1) : '0';
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <span className="text-sm">{formatRatingType(type)}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                                {count} ({percentage}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No hay datos disponibles para análisis
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar calificación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La calificación será eliminada permanentemente y
              afectará el cálculo de reputación del usuario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRating}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
