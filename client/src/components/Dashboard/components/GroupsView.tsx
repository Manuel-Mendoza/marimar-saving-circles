import React, { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Confetti } from "../../../components/ui/confetti";
import {
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Search,
  BarChart3,
  Calendar,
  DollarSign,
  Shuffle
} from "lucide-react";
import { useGroups } from "@/hooks/useGroups";
import { useGroupRealtime, DrawMessage } from "@/hooks/useGroupRealtime";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const GroupsView: React.FC = () => {
  const { allGroups, groupsLoading, refetch } = useGroups();
  const [searchTerm, setSearchTerm] = useState("");

  // Draw animation state
  const [drawDialogOpen, setDrawDialogOpen] = useState(false);
  const [selectedGroupForDraw, setSelectedGroupForDraw] = useState<any>(null);
  const [isDrawStarting, setIsDrawStarting] = useState(false);
  const [drawAnimationData, setDrawAnimationData] = useState<DrawMessage | null>(null);

  // WebSocket for the selected group
  const { isConnected, lastMessage } = useGroupRealtime(selectedGroupForDraw?.id);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage?.type === 'DRAW_STARTED') {
      setDrawAnimationData(lastMessage);
      setIsDrawStarting(false);
    }
  }, [lastMessage]);

  // Start draw function
  const handleStartDraw = async (group: any) => {
    setSelectedGroupForDraw(group);
    setDrawDialogOpen(true);
  };

  // Confirm and start the draw
  const confirmStartDraw = async () => {
    if (!selectedGroupForDraw) return;

    setIsDrawStarting(true);
    try {
      const response = await api.startDraw(selectedGroupForDraw.id);

      if (response.success) {
        toast({
          title: "Sorteo iniciado",
          description: "El sorteo de posiciones ha comenzado",
        });
      } else {
        throw new Error(response.message || 'Failed to start draw');
      }
    } catch (error) {
      console.error('Error starting draw:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el sorteo",
        variant: "destructive",
      });
      setIsDrawStarting(false);
    }
  };

  // Animation component for the draw
  const DrawAnimation = React.memo(({ data }: { data: DrawMessage }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [revealedPositions, setRevealedPositions] = useState<number[]>([]);
    const [animationCompleted, setAnimationCompleted] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const animationStartedRef = useRef(false);

    useEffect(() => {
      if (!data || animationCompleted || animationStartedRef.current) return;

      animationStartedRef.current = true;

      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < data.animationSequence.length - 1) {
            setRevealedPositions(prevPos => [...prevPos, prev + 1]);
            return prev + 1;
          } else {
            // Animation complete, add the last position and show confetti
            setRevealedPositions(prevPos => [...prevPos, prev + 1]);
            setAnimationCompleted(true);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return prev;
          }
        });
      }, 1500); // 1.5 seconds between reveals

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }, [data, animationCompleted]);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Sorteo de Posiciones Iniciado!
          </h3>
          <p className="text-gray-600">
            Las posiciones se están asignando en tiempo real
          </p>
        </div>

        <div className="grid gap-4">
          {data.finalPositions.map((pos, index) => (
            <motion.div
              key={pos.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: revealedPositions.includes(index + 1) ? 1 : 0.3,
                y: revealedPositions.includes(index + 1) ? 0 : 20
              }}
              transition={{ duration: 0.5 }}
              className={`p-4 rounded-lg border-2 ${
                revealedPositions.includes(index + 1)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    revealedPositions.includes(index + 1) ? 'bg-green-500' : 'bg-gray-400'
                  }`}>
                    {pos.position}
                  </div>
                  <span className={`font-medium ${
                    revealedPositions.includes(index + 1) ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {revealedPositions.includes(index + 1) ? pos.name : '???'}
                  </span>
                </div>
                {revealedPositions.includes(index + 1) && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {showConfetti && <Confetti />}
      </div>
    );
  });

  // Filter groups based on search
  const filteredGroups = useMemo(() => {
    return allGroups.filter((group: any) =>
      group.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allGroups, searchTerm]);

  // Group by status
  const groupedGroups = useMemo(() => {
    const groups = {
      sin_completar: [],
      lleno: [],
      en_marcha: [],
      completado: []
    };

    filteredGroups.forEach((group: any) => {
      const status = group.estado.toLowerCase().replace(' ', '_');
      if (groups[status]) {
        groups[status].push(group);
      }
    });

    return groups;
  }, [filteredGroups]);

  // Statistics
  const stats = useMemo(() => {
    const total = allGroups.length;
    const sinCompletar = groupedGroups.sin_completar.length;
    const lleno = groupedGroups.lleno.length;
    const enMarcha = groupedGroups.en_marcha.length;
    const completado = groupedGroups.completado.length;

    return { total, sinCompletar, lleno, enMarcha, completado };
  }, [allGroups, groupedGroups]);

  const getStatusBadge = (estado: string) => {
    const statusConfig = {
      'SIN_COMPLETAR': { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      'LLENO': { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      'EN_MARCHA': { variant: 'default' as const, icon: Play, color: 'text-blue-600' },
      'COMPLETADO': { variant: 'outline' as const, icon: CheckCircle, color: 'text-gray-600' }
    };

    const config = statusConfig[estado] || statusConfig['SIN_COMPLETAR'];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {estado.replace('_', ' ')}
      </Badge>
    );
  };

  const getProgressValue = (group: any) => {
    if (group.estado === 'COMPLETADO') return 100;
    if (group.estado === 'EN_MARCHA') {
      return Math.min((group.turnoActual / group.duracionMeses) * 100, 100);
    }
    return 0;
  };

  const GroupCard = ({ group }: { group: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{group.nombre}</h3>
              {getStatusBadge(group.estado)}
            </div>
            <p className="text-sm text-gray-600 mb-3">
              ID: {group.id} • Duración: {group.duracionMeses} meses
            </p>
          </div>
          <div className="flex gap-2">
            {group.estado === 'LLENO' && (
              <Button size="sm" variant="default" onClick={() => handleStartDraw(group)}>
                <Shuffle className="w-4 h-4 mr-1" />
                Iniciar Sorteo
              </Button>
            )}
            {group.estado === 'EN_MARCHA' && (
              <Button size="sm" variant="outline">
                <BarChart3 className="w-4 h-4 mr-1" />
                Ver Detalles
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progreso</span>
            <span>
              {group.estado === 'EN_MARCHA'
                ? `${group.turnoActual}/${group.duracionMeses} meses`
                : group.estado === 'COMPLETADO'
                  ? 'Completado'
                  : 'Esperando inicio'
              }
            </span>
          </div>
          <Progress value={getProgressValue(group)} className="h-2" />
        </div>

        {/* Group Details */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <div>
              <p className="font-medium">{group.participantes || 0}/{group.duracionMeses}</p>
              <p className="text-gray-500">Participantes</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div>
              <p className="font-medium">{group.turnoActual || 0}</p>
              <p className="text-gray-500">Mes actual</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <div>
              <p className="font-medium">
                {group.fechaInicio
                  ? new Date(group.fechaInicio).toLocaleDateString("es-ES")
                  : 'No iniciado'
                }
              </p>
              <p className="text-gray-500">Fecha inicio</p>
            </div>
          </div>
        </div>

        {/* Product Info */}
        {group.productoNombre && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              <strong>Producto:</strong> {group.productoNombre}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Grupos</h1>
          <p className="text-gray-600 mt-1">Administra los grupos de ahorro colaborativo</p>
        </div>
        <Button onClick={refetch} disabled={groupsLoading}>
          <BarChart3 className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Grupos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.sinCompletar}</p>
                <p className="text-sm text-gray-600">Sin Completar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.lleno}</p>
                <p className="text-sm text-gray-600">Llenos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.enMarcha}</p>
                <p className="text-sm text-gray-600">En Marcha</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">{stats.completado}</p>
                <p className="text-sm text-gray-600">Completados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar grupos por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Groups by Status */}
      <Tabs defaultValue="todos" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="todos">Todos ({stats.total})</TabsTrigger>
          <TabsTrigger value="sin_completar">Sin Completar ({stats.sinCompletar})</TabsTrigger>
          <TabsTrigger value="lleno">Llenos ({stats.lleno})</TabsTrigger>
          <TabsTrigger value="en_marcha">En Marcha ({stats.enMarcha})</TabsTrigger>
          <TabsTrigger value="completado">Completados ({stats.completado})</TabsTrigger>
        </TabsList>

        {groupsLoading ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando grupos...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <TabsContent value="todos" className="space-y-4">
              {filteredGroups.length === 0 ? (
                <Card>
                  <CardContent className="p-8">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No hay grupos que coincidan con la búsqueda</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredGroups.map((group: any) => (
                    <GroupCard key={group.id} group={group} />
                  ))}
                </div>
              )}
            </TabsContent>

            {Object.entries(groupedGroups).map(([status, groups]) => (
              <TabsContent key={status} value={status} className="space-y-4">
                {groups.length === 0 ? (
                  <Card>
                    <CardContent className="p-8">
                      <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No hay grupos en este estado</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {groups.map((group: any) => (
                      <GroupCard key={group.id} group={group} />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </>
        )}
      </Tabs>

      {/* Draw Dialog */}
      <Dialog open={drawDialogOpen} onOpenChange={setDrawDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedGroupForDraw ? `Sorteo - ${selectedGroupForDraw.nombre}` : 'Sorteo de Posiciones'}
            </DialogTitle>
          </DialogHeader>

          {!drawAnimationData ? (
            <div className="space-y-6">
              <div className="text-center">
                <Shuffle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ¿Iniciar sorteo de posiciones?
                </h3>
                <p className="text-gray-600 mb-4">
                  Esta acción asignará posiciones aleatorias a todos los miembros del grupo.
                  Una vez iniciado, no se puede deshacer.
                </p>
                {selectedGroupForDraw && (
                  <div className="bg-gray-50 p-4 rounded-lg text-left">
                    <p className="font-medium">Detalles del grupo:</p>
                    <p><strong>Participantes:</strong> {selectedGroupForDraw.participantes}</p>
                    <p><strong>Duración:</strong> {selectedGroupForDraw.duracionMeses} meses</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDrawDialogOpen(false)}
                  disabled={isDrawStarting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmStartDraw}
                  disabled={isDrawStarting}
                >
                  {isDrawStarting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <Shuffle className="w-4 h-4 mr-2" />
                      Iniciar Sorteo
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <DrawAnimation data={drawAnimationData} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupsView;
