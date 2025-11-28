import React, { useState, useEffect } from 'react';
import { Save, Upload, MapPin, Eye, Edit, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RouteFormProvider, useRouteForm } from '../context/RouteFormContext';
import { RouteMapEditorProvider } from '../context/RouteMapEditorContext';
import { CompleteRouteData, RouteResponse } from '../types/routeTypes';
import MapEditor from './MapEditor';
import { useRouteService } from '../services/RouteServices';
import { get } from 'http';

interface RouteFormManagerProps {
  onSave: (data: CompleteRouteData) => Promise<void>;
  onSuccess?: () => void;
  onClose?: () => void;
  editingRoute?: RouteResponse | null;
  mode?: 'create' | 'edit' | 'view';
  id?: string;
}

const RouteFormManagerContent: React.FC<RouteFormManagerProps> = ({
  onSave,
  onSuccess,
  onClose,
  editingRoute,
  mode = 'create',
  id = ''
}) => {
  const {
    formData,
    outboundRoute,
    returnRoute,
    currentView,
    updateFormData,
    setCurrentView,
    resetForm,
    getCompleteRouteData,
    setInitialData,
  } = useRouteForm();

  const {getRouteById} = useRouteService();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => { 
    if (id) {
      getRouteById(parseInt(id), 'WAYPOINT').then((res) => {
        if (res.data) {
          setInitialData(res.data);
        }
      });
    }
  }, [id]);


  useEffect(() => {
    if (editingRoute && mode === 'edit') {
      // Load editing data
      updateFormData('numberRoute', editingRoute.numberRoute);
      updateFormData('description', editingRoute.description || '');
      // TODO: Load waypoints and geometries from editingRoute
    }
  }, [editingRoute, mode, updateFormData]);

  const handleFileChange = (field: 'outboundImage' | 'returnImage', file: File | null) => {
    updateFormData(field, file);
  };

  const handleSave = async () => {
    const completeData = getCompleteRouteData();
    if (!completeData) {
      setErrors(['Complete todos los campos requeridos y ambas rutas']);
      return;
    }

    console.log(completeData.totalDistance)

    setIsLoading(true);
    setErrors([]);
    try {
      await onSave(completeData);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving route:', error);
      setErrors(['Error al guardar la ruta']);
    } finally {
      setIsLoading(false);
    }
  };

  const getRouteStatus = (route: typeof outboundRoute, label: string) => {
    if (route.waypoints.length === 0) return { status: 'empty', text: `${label}: No definida` };
    if (route.waypoints.length >= 2 && route.geometry) return { status: 'complete', text: `${label}: Completa` };
    return { status: 'incomplete', text: `${label}: Incompleta` };
  };

  const outboundStatus = getRouteStatus(outboundRoute, 'Ida');
  const returnStatus = getRouteStatus(returnRoute, 'Vuelta');

  const isFormValid = formData.numberRoute.trim() !== '' &&
                     outboundRoute.waypoints.length >= 2 &&
                     returnRoute.waypoints.length >= 2 &&
                     outboundRoute.geometry &&
                     returnRoute.geometry;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-card text-card-foreground rounded-lg border border-border">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          {mode === 'create' ? 'Nueva Ruta' : mode === 'edit' ? 'Editar Ruta' : 'Ver Ruta'}
        </h1>
        <p className="text-muted-foreground">
          {mode === 'view' ? 'Vista de la ruta' : 'Complete el formulario y defina las rutas en el mapa'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Info */}
          <div className="bg-muted/30 p-4 rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Información Básica</h2>

            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">
                  Número de Ruta *
                </Label>
                <Input
                  value={formData.numberRoute}
                  onChange={(e) => updateFormData('numberRoute', e.target.value)}
                  placeholder="Ej: 001, 092"
                  className="bg-card border-border text-card-foreground placeholder-muted-foreground"
                  maxLength={20}
                />
              </div>

              <div>
                <Label className="text-muted-foreground">
                  Descripción
                </Label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Descripción de la ruta..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border bg-card text-card-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-muted/30 p-4 rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Imágenes de Referencia</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Imagen de Ida
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center bg-card">
                  {formData.outboundImage ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{formData.outboundImage.name}</p>
                      {mode !== 'view' && (
                        <button
                          onClick={() => handleFileChange('outboundImage', null)}
                          className="text-destructive hover:text-destructive/80 text-sm"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">Subir imagen de ida</p>
                      {mode !== 'view' && (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange('outboundImage', e.target.files?.[0] || null)}
                          className="hidden"
                          id="outbound-image"
                        />
                      )}
                      <Button
                        asChild
                        variant={mode === 'view' ? 'secondary' : 'default'}
                        disabled={mode === 'view'}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <label htmlFor="outbound-image" className="cursor-pointer">
                          Seleccionar Archivo
                        </label>
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Imagen de Vuelta
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center bg-card">
                  {formData.returnImage ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{formData.returnImage.name}</p>
                      {mode !== 'view' && (
                        <button
                          onClick={() => handleFileChange('returnImage', null)}
                          className="text-destructive hover:text-destructive/80 text-sm"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">Subir imagen de vuelta</p>
                      {mode !== 'view' && (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange('returnImage', e.target.files?.[0] || null)}
                          className="hidden"
                          id="return-image"
                        />
                      )}
                      <Button
                        asChild
                        variant={mode === 'view' ? 'secondary' : 'default'}
                        disabled={mode === 'view'}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <label htmlFor="return-image" className="cursor-pointer">
                          Seleccionar Archivo
                        </label>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Route Status */}
          <div className="bg-muted/30 p-4 rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Estado de Rutas</h2>

            <div className="space-y-3">
              <div className={`p-3 rounded-md border ${
                outboundStatus.status === 'complete' ? 'border-success/50 bg-success/10' :
                outboundStatus.status === 'incomplete' ? 'border-yellow-500/50 bg-yellow-500/10' :
                'border-border bg-muted/20'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{outboundStatus.text}</span>
                  <MapPin className={`h-4 w-4 ${
                    outboundStatus.status === 'complete' ? 'text-success' :
                    outboundStatus.status === 'incomplete' ? 'text-yellow-500' :
                    'text-muted-foreground'
                  }`} />
                </div>
                {outboundRoute.distance > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Distancia: {outboundRoute.distance} km
                  </p>
                )}
              </div>

              <div className={`p-3 rounded-md border ${
                returnStatus.status === 'complete' ? 'border-success/50 bg-success/10' :
                returnStatus.status === 'incomplete' ? 'border-yellow-500/50 bg-yellow-500/10' :
                'border-border bg-muted/20'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{returnStatus.text}</span>
                  <MapPin className={`h-4 w-4 ${
                    returnStatus.status === 'complete' ? 'text-success' :
                    returnStatus.status === 'incomplete' ? 'text-yellow-500' :
                    'text-muted-foreground'
                  }`} />
                </div>
                {returnRoute.distance > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Distancia: {returnRoute.distance} km
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-destructive mb-2">Errores:</h3>
              <ul className="text-sm text-destructive/90 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          {mode !== 'view' && (
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 border-border text-foreground hover:bg-accent"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!isFormValid || isLoading}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {mode === 'create' ? 'Crear Ruta' : 'Actualizar Ruta'}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Map Section */}
        <div className="lg:col-span-2">
          {/* View Tabs */}
          <div className="mb-4 flex gap-2">
            <Button
              onClick={() => setCurrentView('outbound')}
              variant={currentView === 'outbound' ? 'default' : 'secondary'}
              className={currentView === 'outbound' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}
            >
              Ruta de Ida
            </Button>
            <Button
              onClick={() => setCurrentView('return')}
              variant={currentView === 'return' ? 'default' : 'secondary'}
              className={currentView === 'return' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}
            >
              Ruta de Vuelta
            </Button>
            <Button
              onClick={() => setCurrentView('both')}
              variant={currentView === 'both' ? 'default' : 'secondary'}
              className={currentView === 'both' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}
            >
              Ambas Rutas
            </Button>
          </div>

          {/* Map Editor */}
          <div className="bg-card rounded-lg overflow-hidden h-[115vh] border border-border">
            <MapEditor
              mode={mode === 'view' ? 'view' : currentView === 'both' ? 'view' : 'edit'}
              routeType={currentView}
              initialWaypoints={[...outboundRoute.waypoints, ...returnRoute.waypoints]}
              initialGeometry={currentView === 'outbound' ? (outboundRoute.geometry ?? undefined) :
                              currentView === 'return' ? (returnRoute.geometry ?? undefined) : undefined}
              onSave={(waypoints, geometry) => {
                if (currentView === 'outbound') {
                  // saveOutboundRoute will be called from MapEditor
                } else if (currentView === 'return') {
                  // saveReturnRoute will be called from MapEditor
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-success">
              <CheckCircle className="h-5 w-5" />
              ¡Éxito!
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              La ruta ha sido {mode === 'create' ? 'creada' : 'actualizada'} exitosamente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                onSuccess?.();
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Aceptar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const RouteFormManager: React.FC<RouteFormManagerProps> = (props) => {
  return (
    <RouteFormProvider>
      <RouteMapEditorProvider>
        <RouteFormManagerContent {...props} />
      </RouteMapEditorProvider>
    </RouteFormProvider>
  );
};

export default RouteFormManager;