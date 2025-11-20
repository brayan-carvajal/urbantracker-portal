
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2, User, CreditCard, Mail } from "lucide-react";
import type { Driver } from "../types/driverTypes";
import type { ApiError } from "../services/api/types";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  driver: Driver | null;
  isDeleting: boolean;
  apiError?: ApiError | null;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  driver,
  isDeleting,
  apiError,
}) => {
  if (!driver) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error: unknown) {
      console.error('Error deleting driver:', error);
      throw error; // Re-lanzamos el error para que pueda ser manejado por el componente padre
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Eliminar Conductor
          </DialogTitle>
          <DialogDescription className="text-base">
            ¿Está seguro de que desea eliminar permanentemente este controlador?
          </DialogDescription>
        </DialogHeader>

        {/* API Error Display */}
        {apiError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-foreground/80 text-sm">
                  {apiError.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Driver info to be deleted */}
        <div className="bg-accent/30 border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-foreground" />
            <span className="font-medium text-foreground">Nombre:</span>
            <span className="text-foreground">{driver.firstName} {driver.lastName}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">ID:</span>
            <span className="font-mono text-muted-foreground px-2 py-1 rounded border border-border">
              {driver.idNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">Email:</span>
            <span className="text-primary">{driver.email}</span>
          </div>
        </div>

        {/* Warning message */}
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm text-foreground">
            <strong>Advertencia:</strong> Esta acción no se puede deshacer. El
            conductor se eliminará permanentemente del sistema.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isDeleting ? "Eliminando..." : "Eliminar Conductor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};