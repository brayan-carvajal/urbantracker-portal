"use client";

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useRoutes } from './hooks/useRoutes';
import { useRouteActions } from './hooks/useRouteActions';
import RouteErrorState from './components/RouteErrorState';
import RouteHeader from './components/RouteHeader';
import {RouteCard} from './components/RouteCard';
import { StatisticsCards } from './components/StatisticsCards';
import RouteFilters from './components/RouteFilters';
import Pagination from './components/Pagination';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { RouteResponse } from './types/routeTypes';

export default function RouteDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    paginatedRoutes,
    filteredRoutes,
    pagination,
    searchTerm,
    statusFilter,
    statistics,
    loading,
    error,
    setSearchTerm,
    setStatusFilter,
    setPage,
    setItemsPerPage,
    fetchRoutes
  } = useRoutes();
  const {
    handleCreateRoute,
    handleEditRoute,
    openDeleteModal,
    closeDeleteModal,
    confirmDeleteRoute,
    isDeleteModalOpen,
    routeToDelete,
    isDeleting
  } = useRouteActions(fetchRoutes);

  useEffect(() => {
    console.log('[RouteDashboard] Initial load - calling fetchRoutes');
    fetchRoutes();
  }, []); // Remover fetchRoutes de dependencias para evitar bucle infinito

  useEffect(() => {
    // Verificar si hay parámetro refresh=true en la URL (viene de editar)
    const refresh = searchParams.get('refresh');
    if (refresh === 'true') {
      console.log('[RouteDashboard] Refresh parameter detected - calling fetchRoutes');
      fetchRoutes();
      // Limpiar el parámetro de la URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('refresh');
      router.replace(newUrl.pathname + newUrl.search);
    }
  }, [searchParams, router]); // Remover fetchRoutes de dependencias

  useEffect(() => {
    // Refrescar rutas cuando la ventana vuelve a tener foco (usuario regresa de editar)
    const handleFocus = () => {
      console.log('[RouteDashboard] Window focus detected - calling fetchRoutes');
      fetchRoutes();
    };

    console.log('[RouteDashboard] Adding focus event listener');
    window.addEventListener('focus', handleFocus);

    return () => {
      console.log('[RouteDashboard] Removing focus event listener');
      window.removeEventListener('focus', handleFocus);
    };
  }, []); // Remover fetchRoutes de dependencias para evitar bucle infinito

  const handleDeleteClick = (route: RouteResponse) => {
    openDeleteModal(route);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-lg">Cargando Rutas...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) return <RouteErrorState error={error} />;

  return (
    <div className="space-y-8 bg-background min-h-screen p-6">
      {/* Header */}
      <RouteHeader onCreateRoute={handleCreateRoute} />

      {/* Statistics */}
      <StatisticsCards statistics={statistics} />

      {/* Filters */}
      <RouteFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Route list */}
      <section className="space-y-6">
        {filteredRoutes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg">
              {searchTerm || statusFilter !== "all"
                ? "No routes found with the applied filters"
                : "No routes registered"}
            </div>
            {!searchTerm && statusFilter === "all" && (
              <button
                onClick={handleCreateRoute}
                className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg transition-colors"
              >
                Agregar primera ruta
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-6">
              {paginatedRoutes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  onEdit={handleEditRoute}
                  onDelete={() => handleDeleteClick(route)}
                />
              ))}
            </div>
            {/* Pagination component */}
            <Pagination
              pagination={pagination}
              onPageChange={setPage}
              onItemsPerPageChange={setItemsPerPage}
              isLoading={loading}
            />
          </>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteRoute}
        route={routeToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};