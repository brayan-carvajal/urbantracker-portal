import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { VehicleType } from "../types/vehicleTypes";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  vehicleType: VehicleType | null;
  isDeleting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  vehicleType,
  isDeleting,
}) => {
  if (!vehicleType) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error deleting vehicle type:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card text-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Eliminar Tipo de Vehículo</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            ¿Estás seguro que deseas eliminar el tipo <span className="font-bold text-foreground">{vehicleType.name}</span>?
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="text-destructive" />
          <span className="text-muted-foreground">Esta acción no se puede deshacer.</span>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting} className="border-border text-foreground hover:bg-accent">Cancelar</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {isDeleting ? <Loader2 className="animate-spin h-4 w-4" /> : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationModal;
