
import { Button } from "@/components/ui/button";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
import {ChevronLeft,ChevronRight,ChevronsLeft,ChevronsRight} from "lucide-react";
import type { PaginationData } from "../types/VehicleAssigmentsType";

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  isLoading?: boolean;
  showItemsPerPageSelect?: boolean;
  itemsPerPageOptions?: number[];
}

export function Pagination({
  pagination,
  onPageChange,
  onItemsPerPageChange,
  isLoading = false,
  showItemsPerPageSelect = true,
  itemsPerPageOptions = [5, 10, 20, 50],
}: PaginationProps) {
  const {
    currentPage,
    totalPages,
    itemsPerPage,
  } = pagination;

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => onPageChange(1)} disabled={currentPage === 1 || isLoading} className="text-foreground hover:bg-accent">
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1 || isLoading} className="text-foreground hover:bg-accent">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-foreground">
          Página {currentPage} de {totalPages}
        </span>
        <Button variant="ghost" size="icon" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages || isLoading} className="text-foreground hover:bg-accent">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages || isLoading} className="text-foreground hover:bg-accent">
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
      {showItemsPerPageSelect && (
        <Select value={String(itemsPerPage)} onValueChange={v => onItemsPerPageChange?.(Number(v))}>
          <SelectTrigger className="w-29 bg-card border-border text-foreground">
            <SelectValue placeholder="Items" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {itemsPerPageOptions.map(opt => (
              <SelectItem key={opt} value={String(opt)} className="text-popover-foreground hover:bg-accent focus:bg-accent">{opt} por página</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
