import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building, Edit, Trash2, CreditCard, Smartphone, Mail } from "lucide-react"
import { Company } from "../types/companyTypes"

interface CompanyCardProps {
    company: Company
    onEdit: (company: Company) => void
    onDelete: (id: number) => void
}

export function CompanyCard({ company, onEdit, onDelete }: CompanyCardProps) {

    return (
        <Card className="bg-card border-border hover:bg-accent transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-primary/20 rounded-full">
                            <Building className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold text-foreground">
                                    {company.name}
                                </h3>
                                <Badge className="bg-primary text-primary-foreground">
                                    {company.country}
                                </Badge>
                            </div>
                            <div className="text-muted-foreground">
                                <span className="font-medium text-foreground flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-muted-foreground" /> Nit: {company.nit}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Smartphone className="h-4 w-4 text-muted-foreground" /> Telefono: {company.phone}
                                </span>
                            </div>
                            <div className="text-sm">
                                <span className="font-medium text-foreground flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" /> Correo: <span className="text-primary">{company.email}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(company)}
                            className="group flex items-center gap-2 hover:bg-accent/10 hover:text-accent-foreground transition-all duration-200"
                        >
                            <Edit className="h-4 w-4 mr-2 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
                            Editar
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(company.id)}
                            className="group border-destructive/50 text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="h-4 w-4 mr-2 text-destructive group-hover:text-destructive transition-colors" />
                            Eliminar
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}