import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  onSave: (data: CompleteRouteData, deleteOutboundImage?: boolean, deleteReturnImage?: boolean) => Promise<void>;
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
  const router = useRouter();

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

  // Estado para imágenes existentes
  const [hasOutboundImage, setHasOutboundImage] = useState(false);
  const [hasReturnImage, setHasReturnImage] = useState(false);

  // Estado para marcar imágenes para eliminar
  const [deleteOutboundImage, setDeleteOutboundImage] = useState(false);
  const [deleteReturnImage, setDeleteReturnImage] = useState(false);

  useEffect(() => {
    if (id) {
      getRouteById(parseInt(id), 'WAYPOINT').then((res) => {
        if (res.data) {
          setInitialData(res.data);
          // Set existing image flags based on loaded data
          setHasOutboundImage(res.data.hasOutboundImage);
          setHasReturnImage(res.data.hasReturnImage);
        }
      });
    }
  }, [id]);


  useEffect(() => {
    if (editingRoute && mode === 'edit') {
      // Load editing data
      updateFormData('numberRoute', editingRoute.numberRoute);
      updateFormData('description', editingRoute.description || '');

      // Set existing image flags
      setHasOutboundImage(editingRoute.hasOutboundImage);
      setHasReturnImage(editingRoute.hasReturnImage);

      // TODO: Load waypoints and geometries from editingRoute
    }
  }, [editingRoute, mode, updateFormData]);

  const handleFileChange = (field: 'outboundImage' | 'returnImage', file: File | null) => {
    updateFormData(field, file);
    // Si se selecciona una nueva imagen, limpiar los flags de eliminación
    if (file) {
      if (field === 'outboundImage') {
        setDeleteOutboundImage(false);
      } else {
        setDeleteReturnImage(false);
      }
    }
  };

  const handleRemoveImage = (imageType: 'outbound' | 'return') => {
    // Just hide the image and show file selector
    if (imageType === 'outbound') {
      setHasOutboundImage(false);
      // Si había imagen existente, marcar para eliminar
      if (editingRoute?.hasOutboundImage) {
        setDeleteOutboundImage(true);
      }
    } else {
      setHasReturnImage(false);
      // Si había imagen existente, marcar para eliminar
      if (editingRoute?.hasReturnImage) {
        setDeleteReturnImage(true);
      }
    }
    // Clear form data if it was set
    updateFormData(imageType === 'outbound' ? 'outboundImage' : 'returnImage', null);
  };

  const handleSave = async () => {
    const completeData = getCompleteRouteData();
    if (!completeData) {
      setErrors(['Complete todos los campos requeridos y ambas rutas']);
      return;
    }

    // ✅ VALIDACIÓN: Ambas imágenes son obligatorias
    const hasOutboundImageValid = formData.outboundImage !== null ||
                                 (mode === 'edit' && hasOutboundImage && !deleteOutboundImage);
    const hasReturnImageValid = formData.returnImage !== null ||
                               (mode === 'edit' && hasReturnImage && !deleteReturnImage);

    if (!hasOutboundImageValid) {
      setErrors(['La imagen de ida es obligatoria para la ruta.']);
      return;
    }
    if (!hasReturnImageValid) {
      setErrors(['La imagen de vuelta es obligatoria para la ruta.']);
      return;
    }

    console.log(completeData.totalDistance)

    setIsLoading(true);
    setErrors([]);
    try {
      // Pasar los flags de eliminación si estamos en modo edición
      if (mode === 'edit') {
        await onSave(completeData, deleteOutboundImage, deleteReturnImage);
      } else {
        await onSave(completeData);
      }

      // After successful update in edit mode, reload route data to update local state
      if (mode === 'edit' && id) {
        // Reset image states immediately to prevent showing deleted images during reload
        setHasOutboundImage(false);
        setHasReturnImage(false);
        // Reset delete flags
        setDeleteOutboundImage(false);
        setDeleteReturnImage(false);

        const res = await getRouteById(parseInt(id), 'WAYPOINT');
        if (res.data) {
          setInitialData(res.data);
          // Update image states based on the updated route data
          setHasOutboundImage(res.data.hasOutboundImage);
          setHasReturnImage(res.data.hasReturnImage);
        }
      }

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
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Imágenes de Referencia <span className="text-destructive">*</span>
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Ambas imágenes (de ida y vuelta) son obligatorias para la ruta.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Imagen de Ida <span className="text-destructive">*</span>
                </label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center min-h-[200px] flex flex-col justify-center bg-accent/10 hover:bg-accent/20 transition-colors">
                  {formData.outboundImage ? (
                    <div className="space-y-4">
                      {/* Vista previa de la nueva imagen seleccionada */}
                      <div className="flex justify-center">
                        <img
                          src={URL.createObjectURL(formData.outboundImage)}
                          alt="Vista previa imagen de ida"
                          className="max-h-40 max-w-full object-contain rounded-lg shadow-sm"
                          onLoad={(e) => {
                            // Liberar el objeto URL después de cargar la imagen
                            URL.revokeObjectURL((e.target as HTMLImageElement).src);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground font-medium break-all">
                          {formData.outboundImage.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Tamaño: {(formData.outboundImage.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      {(mode === 'create' || mode === 'edit') && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleFileChange('outboundImage', null)}
                          className="text-destructive border-destructive/50 hover:bg-destructive/10"
                          size="sm"
                        >
                          Remover imagen
                        </Button>
                      )}
                    </div>
                  ) : mode === 'edit' && hasOutboundImage ? (
                    // Mostrar imagen existente con botón eliminar
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <img
                          src={`http://18.119.92.101/api/v1/routes/${id}/images/outbound?t=${Date.now()}`}
                          alt="Imagen actual de ida"
                          className="max-h-40 max-w-full object-contain rounded-lg shadow-sm"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            // Show fallback icon when image fails
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.fallback-icon')) {
                              const fallbackDiv = document.createElement('div');
                              fallbackDiv.className = 'fallback-icon w-20 h-20 flex items-center justify-center bg-primary/10 rounded-lg border border-border';
                              fallbackDiv.innerHTML = '<svg class="h-7 w-7 text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"/></svg>';
                              parent.appendChild(fallbackDiv);
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground font-medium">
                          Imagen actual de ida
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Puedes seleccionar una nueva imagen para reemplazarla
                        </p>
                        {mode === 'edit' && (
                          <div className="flex justify-center">
                            <Button
                              type="button"
                              variant="outline"
                              className="border-destructive text-destructive hover:bg-destructive/10"
                              size="sm"
                              onClick={() => handleRemoveImage('outbound')}
                            >
                              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Remover imagen
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground font-medium">
                          Subir imagen de ida
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Formatos soportados: JPG, PNG, WebP
                        </p>
                      </div>
                      {(mode === 'create' || mode === 'edit') && (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            e.stopPropagation();
                            handleFileChange(
                              'outboundImage',
                              e.target.files?.[0] || null
                            );
                          }}
                          className="hidden"
                          id="outbound-image"
                        />
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        className="border-border text-foreground hover:bg-accent"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          document.getElementById('outbound-image')?.click();
                        }}
                      >
                        <Upload className="h-4 w-4" />
                        Seleccionar archivo
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Imagen de Vuelta <span className="text-destructive">*</span>
                </label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center min-h-[200px] flex flex-col justify-center bg-accent/10 hover:bg-accent/20 transition-colors">
                  {formData.returnImage ? (
                    <div className="space-y-4">
                      {/* Vista previa de la nueva imagen seleccionada */}
                      <div className="flex justify-center">
                        <img
                          src={URL.createObjectURL(formData.returnImage)}
                          alt="Vista previa imagen de vuelta"
                          className="max-h-40 max-w-full object-contain rounded-lg shadow-sm"
                          onLoad={(e) => {
                            // Liberar el objeto URL después de cargar la imagen
                            URL.revokeObjectURL((e.target as HTMLImageElement).src);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground font-medium break-all">
                          {formData.returnImage.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Tamaño: {(formData.returnImage.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      {(mode === 'create' || mode === 'edit') && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleFileChange('returnImage', null)}
                          className="text-destructive border-destructive/50 hover:bg-destructive/10"
                          size="sm"
                        >
                          Remover imagen
                        </Button>
                      )}
                    </div>
                  ) : mode === 'edit' && hasReturnImage ? (
                    // Mostrar imagen existente con botón eliminar
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <img
                          src={`http://localhost:8080/api/v1/routes/${id}/images/return?t=${Date.now()}`}
                          alt="Imagen actual de vuelta"
                          className="max-h-40 max-w-full object-contain rounded-lg shadow-sm"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            // Show fallback icon when image fails
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.fallback-icon')) {
                              const fallbackDiv = document.createElement('div');
                              fallbackDiv.className = 'fallback-icon w-20 h-20 flex items-center justify-center bg-primary/10 rounded-lg border border-border';
                              fallbackDiv.innerHTML = '<svg class="h-7 w-7 text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"/></svg>';
                              parent.appendChild(fallbackDiv);
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground font-medium">
                          Imagen actual de vuelta
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Puedes seleccionar una nueva imagen para reemplazarla
                        </p>
                        {mode === 'edit' && (
                          <div className="flex justify-center">
                            <Button
                              type="button"
                              variant="outline"
                              className="border-destructive text-destructive hover:bg-destructive/10"
                              size="sm"
                              onClick={() => handleRemoveImage('return')}
                            >
                              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Eliminar imagen
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground font-medium">
                          Subir imagen de vuelta
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Formatos soportados: JPG, PNG, WebP
                        </p>
                      </div>
                      {(mode === 'create' || mode === 'edit') && (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            e.stopPropagation();
                            handleFileChange(
                              'returnImage',
                              e.target.files?.[0] || null
                            );
                          }}
                          className="hidden"
                          id="return-image"
                        />
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        className="border-border text-foreground hover:bg-accent"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          document.getElementById('return-image')?.click();
                        }}
                      >
                        <Upload className="h-4 w-4" />
                        Seleccionar archivo
                      </Button>
                    </div>
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
          {(mode === 'create' || mode === 'edit') && (
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
              initialWaypoints={currentView === 'outbound' ? outboundRoute.waypoints :
                               currentView === 'return' ? returnRoute.waypoints :
                               [...outboundRoute.waypoints, ...returnRoute.waypoints]}
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