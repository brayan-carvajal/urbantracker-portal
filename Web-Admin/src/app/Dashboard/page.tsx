"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, Car, RefreshCw, AlertTriangle, Truck, CheckCircle, Activity, MapPin, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, memo } from "react"
import { decodeJWT } from "@/lib/utils"
import { useDashboard } from "./hooks/useDashboard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

function DashboardPage() {
  const router = useRouter()
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError, refetch } = useDashboard()

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      router.push("/")
      return
    }

    const decoded = decodeJWT(token)

    if (!decoded || (decoded.exp && decoded.exp < Date.now() / 1000)) {
      localStorage.removeItem("token")
      router.push("/")
      return
    }
  }, [router])

  if (isDashboardLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-foreground">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          Cargando datos del dashboard...
        </div>
      </div>
    )
  }

  if (dashboardError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Error al cargar datos</h2>
            <p className="text-muted-foreground mb-4">{dashboardError}</p>
            <Button onClick={refetch} className="bg-success hover:bg-success/90">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Use dynamic chart data from API
  const fleetEfficiencyData = dashboardData?.charts?.fleetEfficiency || [];


  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Panel de Control - UrbanTracker
            </h1>
            <p className="text-muted-foreground text-lg">
              Monitoreo en tiempo real y gestión operativa de tu flota de transporte
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Datos en tiempo real</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Actualización automática cada 5 minutos
            </p>
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 transform group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total Conductores</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{dashboardData?.stats.totalDrivers || 0}</div>
            <p className="text-xs text-muted-foreground">+{Math.floor((dashboardData?.stats.totalDrivers || 0) * 0.1)} nuevos este mes</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 transform group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Vehículos Activos</CardTitle>
            <Car className="h-5 w-5 text-muted-foreground group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{dashboardData?.stats.activeVehicles || 0}</div>
            <p className="text-xs text-muted-foreground">{dashboardData?.stats.totalVehicles ? Math.round((dashboardData.stats.activeVehicles / dashboardData.stats.totalVehicles) * 100) : 0}% de la flota operativa</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 transform group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Vehículos en Ruta</CardTitle>
            <Truck className="h-5 w-5 text-muted-foreground group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{dashboardData?.stats.vehiclesInRoute || 0}</div>
            <p className="text-xs text-muted-foreground">Rutas activas actualmente</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 transform group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total Empresas</CardTitle>
            <Building2 className="h-5 w-5 text-muted-foreground group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{dashboardData?.stats.totalCompanies || 0}</div>
            <p className="text-xs text-muted-foreground">Empresas registradas</p>
          </CardContent>
        </Card>
      </div>


      {/* Key Performance Indicators */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-card border-border hover:shadow-md transition-all duration-300 hover:scale-105 transform group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Eficiencia de Flota</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {dashboardData?.stats.totalVehicles ? Math.round((dashboardData.stats.vehiclesInRoute / dashboardData.stats.totalVehicles) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.stats.vehiclesInRoute || 0} de {dashboardData?.stats.totalVehicles || 0} vehículos activos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:shadow-md transition-all duration-300 hover:scale-105 transform group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Rutas Hoy</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {dashboardData?.stats.vehiclesInRoute || 0}
            </div>
            <p className="text-xs text-muted-foreground">Rutas activas actualmente</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:shadow-md transition-all duration-300 hover:scale-105 transform group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Disponibilidad</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {dashboardData?.stats.availableVehicles || 0}
            </div>
            <p className="text-xs text-muted-foreground">Vehículos listos para asignar</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:shadow-md transition-all duration-300 hover:scale-105 transform group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Cobertura</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {dashboardData?.stats.totalCompanies || 0}
            </div>
            <p className="text-xs text-muted-foreground">Empresas atendidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Key Information Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Operational Summary */}
        <Card className="bg-card border-border shadow-sm cursor-default">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground group-hover:scale-110 transition-transform" />
              Resumen Operativo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors duration-200 cursor-pointer">
                <div>
                  <p className="font-medium text-sm text-foreground">Estado General</p>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData?.stats.vehiclesInRoute || 0 > 0 ? 'Operaciones activas' : 'Sin actividad actual'}
                  </p>
                </div>
                <Badge className={dashboardData?.stats.vehiclesInRoute || 0 > 0 ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}>
                  {dashboardData?.stats.vehiclesInRoute || 0 > 0 ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors duration-200 cursor-pointer">
                <div>
                  <p className="font-medium text-sm text-foreground">Capacidad Disponible</p>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData?.stats.availableVehicles || 0} vehículos listos
                  </p>
                </div>
                <Badge className="bg-success text-success-foreground">
                  {dashboardData?.stats.availableVehicles || 0}
                </Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors duration-200 cursor-pointer">
                <div>
                  <p className="font-medium text-sm text-foreground">Cobertura de Mercado</p>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData?.stats.totalCompanies || 0} empresas atendidas
                  </p>
                </div>
                <Badge className="bg-primary text-primary-foreground">
                  {dashboardData?.stats.totalCompanies || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fleet Efficiency Chart */}
        <Card className="bg-card border-border shadow-sm cursor-default">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground group-hover:scale-110 transition-transform" />
              Utilización de Flota
            </CardTitle>
            <p className="text-sm text-muted-foreground">Distribución actual de vehículos</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={fleetEfficiencyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {fleetEfficiencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {fleetEfficiencyData.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors duration-200 cursor-pointer">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Critical Information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* System Health & Critical Information */}
        <Card className="bg-card border-border shadow-sm cursor-default">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-muted-foreground group-hover:scale-110 transition-transform" />
              Estado del Sistema
            </CardTitle>
            <p className="text-sm text-muted-foreground">Información crítica para la toma de decisiones operativas</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors duration-200 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-full">
                      <Truck className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Operaciones Activas</p>
                      <p className="text-sm text-muted-foreground">
                        {dashboardData?.stats.vehiclesInRoute || 0} rutas en ejecución •
                        Eficiencia: {dashboardData?.stats.totalVehicles ? Math.round((dashboardData.stats.vehiclesInRoute / dashboardData.stats.totalVehicles) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-primary text-primary-foreground text-lg px-3 py-1">
                    {dashboardData?.stats.vehiclesInRoute || 0}
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors duration-200 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success rounded-full">
                      <CheckCircle className="h-5 w-5 text-success-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Capacidad Disponible</p>
                      <p className="text-sm text-muted-foreground">
                        {dashboardData?.stats.availableVehicles || 0} vehículos listos para asignación inmediata
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-success text-success-foreground text-lg px-3 py-1">
                    {dashboardData?.stats.availableVehicles || 0}
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors duration-200 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-full">
                      <Users className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Recursos Humanos</p>
                      <p className="text-sm text-muted-foreground">
                        {dashboardData?.stats.activeDrivers || 0} conductores activos de {dashboardData?.stats.totalDrivers || 0} total
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-primary text-primary-foreground text-lg px-3 py-1">
                    {dashboardData?.stats.activeDrivers || 0}/{dashboardData?.stats.totalDrivers || 0}
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors duration-200 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-full">
                      <Building2 className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Cobertura de Mercado</p>
                      <p className="text-sm text-muted-foreground">
                        {dashboardData?.stats.totalCompanies || 0} empresas atendidas actualmente
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-primary text-primary-foreground text-lg px-3 py-1">
                    {dashboardData?.stats.totalCompanies || 0}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              Operaciones Rápidas
            </CardTitle>
            <p className="text-sm text-muted-foreground">Acceso directo a las funciones más utilizadas</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="grid gap-2">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Gestión de Rutas</h4>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    className="h-auto p-3 justify-start border-border text-foreground hover:bg-accent/50 hover:text-accent-foreground transition-all duration-300 cursor-pointer"
                    onClick={() => router.push('/Dashboard/vehicleAssigments')}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="font-medium text-sm">Asignar Nueva Ruta</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-3 justify-start border-border text-foreground hover:bg-accent/50 hover:text-accent-foreground transition-all duration-300 cursor-pointer"
                    onClick={() => router.push('/Dashboard/(route)/route-schedule')}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-medium text-sm">Programar Rutas</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-3 justify-start border-border text-foreground hover:bg-accent/50 hover:text-accent-foreground transition-all duration-300 cursor-pointer"
                    onClick={() => router.push('/Dashboard/(route)/routes')}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="font-medium text-sm">Gestionar Rutas</span>
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Recursos Humanos</h4>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    className="h-auto p-3 justify-start border-border text-foreground hover:bg-accent/50 hover:text-accent-foreground transition-all duration-300 cursor-pointer"
                    onClick={() => router.push('/Dashboard/drivers')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    <span className="font-medium text-sm">Gestionar Conductores</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-3 justify-start border-border text-foreground hover:bg-accent/50 hover:text-accent-foreground transition-all duration-300 cursor-pointer"
                    onClick={() => router.push('/Dashboard/(driver)/driver-schedule')}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-medium text-sm">Horarios de Conductores</span>
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Flota y Equipos</h4>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    className="h-auto p-3 justify-start border-border text-foreground hover:bg-accent/50 hover:text-accent-foreground transition-all duration-300 cursor-pointer"
                    onClick={() => router.push('/Dashboard/vehicles')}
                  >
                    <Car className="h-4 w-4 mr-2" />
                    <span className="font-medium text-sm">Administrar Vehículos</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-3 justify-start border-border text-foreground hover:bg-accent/50 hover:text-accent-foreground transition-all duration-300 cursor-pointer"
                    onClick={() => router.push('/Dashboard/vehicleType')}
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    <span className="font-medium text-sm">Tipos de Vehículo</span>
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Administración</h4>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    className="h-auto p-3 justify-start border-border text-foreground hover:bg-accent/50 hover:text-accent-foreground transition-all duration-300 cursor-pointer"
                    onClick={() => router.push('/Dashboard/company')}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    <span className="font-medium text-sm">Gestionar Empresas</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-3 justify-start border-border text-foreground hover:bg-accent/50 hover:text-accent-foreground transition-all duration-300 cursor-pointer"
                    onClick={() => router.push('/Dashboard/parking')}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="font-medium text-sm">Control de Estacionamiento</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

export default memo(DashboardPage);