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
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 shadow-xl hover:shadow-blue-300/50 transition-all duration-500 hover:scale-105 transform group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Conductores</CardTitle>
            <Users className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{dashboardData?.stats.totalDrivers || 0}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400">+{Math.floor((dashboardData?.stats.totalDrivers || 0) * 0.1)} nuevos este mes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 shadow-xl hover:shadow-green-300/50 transition-all duration-500 hover:scale-105 transform group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Vehículos Activos</CardTitle>
            <Car className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">{dashboardData?.stats.activeVehicles || 0}</div>
            <p className="text-xs text-green-600 dark:text-green-400">{dashboardData?.stats.totalVehicles ? Math.round((dashboardData.stats.activeVehicles / dashboardData.stats.totalVehicles) * 100) : 0}% de la flota operativa</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 shadow-xl hover:shadow-purple-300/50 transition-all duration-500 hover:scale-105 transform group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Vehículos en Ruta</CardTitle>
            <Truck className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{dashboardData?.stats.vehiclesInRoute || 0}</div>
            <p className="text-xs text-purple-600 dark:text-purple-400">Rutas activas actualmente</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 shadow-xl hover:shadow-orange-300/50 transition-all duration-500 hover:scale-105 transform group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Total Empresas</CardTitle>
            <Building2 className="h-5 w-5 text-orange-600 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">{dashboardData?.stats.totalCompanies || 0}</div>
            <p className="text-xs text-orange-600 dark:text-orange-400">Empresas registradas</p>
          </CardContent>
        </Card>
      </div>


      {/* Key Performance Indicators */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Eficiencia de Flota</CardTitle>
            <Activity className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {dashboardData?.stats.totalVehicles ? Math.round((dashboardData.stats.vehiclesInRoute / dashboardData.stats.totalVehicles) * 100) : 0}%
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              {dashboardData?.stats.vehiclesInRoute || 0} de {dashboardData?.stats.totalVehicles || 0} vehículos activos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Rutas Hoy</CardTitle>
            <MapPin className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {dashboardData?.stats.vehiclesInRoute || 0}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">Rutas activas actualmente</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">Disponibilidad</CardTitle>
            <CheckCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {dashboardData?.stats.availableVehicles || 0}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400">Vehículos listos para asignar</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Cobertura</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {dashboardData?.stats.totalCompanies || 0}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400">Empresas atendidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Key Information Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Operational Summary */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Resumen Operativo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Estado General</p>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData?.stats.vehiclesInRoute || 0 > 0 ? 'Operaciones activas' : 'Sin actividad actual'}
                  </p>
                </div>
                <Badge className={dashboardData?.stats.vehiclesInRoute || 0 > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {dashboardData?.stats.vehiclesInRoute || 0 > 0 ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Capacidad Disponible</p>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData?.stats.availableVehicles || 0} vehículos listos
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {dashboardData?.stats.availableVehicles || 0}
                </Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Cobertura de Mercado</p>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData?.stats.totalCompanies || 0} empresas atendidas
                  </p>
                </div>
                <Badge className="bg-purple-100 text-purple-800">
                  {dashboardData?.stats.totalCompanies || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fleet Efficiency Chart */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
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
                <div key={index} className="flex items-center gap-2">
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
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Estado del Sistema
            </CardTitle>
            <p className="text-sm text-muted-foreground">Información crítica para la toma de decisiones operativas</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-full">
                      <Truck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-100">Operaciones Activas</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {dashboardData?.stats.vehiclesInRoute || 0} rutas en ejecución •
                        Eficiencia: {dashboardData?.stats.totalVehicles ? Math.round((dashboardData.stats.vehiclesInRoute / dashboardData.stats.totalVehicles) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-lg px-3 py-1">
                    {dashboardData?.stats.vehiclesInRoute || 0}
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-full">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-900 dark:text-green-100">Capacidad Disponible</p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {dashboardData?.stats.availableVehicles || 0} vehículos listos para asignación inmediata
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-lg px-3 py-1">
                    {dashboardData?.stats.availableVehicles || 0}
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500 rounded-full">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-amber-900 dark:text-amber-100">Recursos Humanos</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        {dashboardData?.stats.activeDrivers || 0} conductores activos de {dashboardData?.stats.totalDrivers || 0} total
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-lg px-3 py-1">
                    {dashboardData?.stats.activeDrivers || 0}/{dashboardData?.stats.totalDrivers || 0}
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-full">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-purple-900 dark:text-purple-100">Cobertura de Mercado</p>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        {dashboardData?.stats.totalCompanies || 0} empresas atendidas actualmente
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-lg px-3 py-1">
                    {dashboardData?.stats.totalCompanies || 0}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
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
                    className="h-auto p-3 justify-start bg-blue-500 hover:bg-blue-600 text-white border-none hover:scale-105 transition-all duration-300"
                    onClick={() => router.push('/Dashboard/vehicleAssigments')}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="font-medium text-sm">Asignar Nueva Ruta</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-3 justify-start bg-indigo-500 hover:bg-indigo-600 text-white border-none hover:scale-105 transition-all duration-300"
                    onClick={() => router.push('/Dashboard/(route)/route-schedule')}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-medium text-sm">Programar Rutas</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-3 justify-start bg-cyan-500 hover:bg-cyan-600 text-white border-none hover:scale-105 transition-all duration-300"
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
                    className="h-auto p-3 justify-start bg-green-500 hover:bg-green-600 text-white border-none hover:scale-105 transition-all duration-300"
                    onClick={() => router.push('/Dashboard/drivers')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    <span className="font-medium text-sm">Gestionar Conductores</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-3 justify-start bg-emerald-500 hover:bg-emerald-600 text-white border-none hover:scale-105 transition-all duration-300"
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
                    className="h-auto p-3 justify-start bg-purple-500 hover:bg-purple-600 text-white border-none hover:scale-105 transition-all duration-300"
                    onClick={() => router.push('/Dashboard/vehicles')}
                  >
                    <Car className="h-4 w-4 mr-2" />
                    <span className="font-medium text-sm">Administrar Vehículos</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-3 justify-start bg-violet-500 hover:bg-violet-600 text-white border-none hover:scale-105 transition-all duration-300"
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
                    className="h-auto p-3 justify-start bg-orange-500 hover:bg-orange-600 text-white border-none hover:scale-105 transition-all duration-300"
                    onClick={() => router.push('/Dashboard/company')}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    <span className="font-medium text-sm">Gestionar Empresas</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-3 justify-start bg-red-500 hover:bg-red-600 text-white border-none hover:scale-105 transition-all duration-300"
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