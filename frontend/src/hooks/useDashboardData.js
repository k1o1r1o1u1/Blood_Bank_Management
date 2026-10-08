import { useState, useEffect, useCallback } from 'react';
import { dashboardService, inventoryService, requestService } from '../services/api';

/**
 * useDashboardData — Fetches all dashboard data in parallel via Promise.all.
 * Returns structured data ready for each dashboard component.
 */
export function useDashboardData() {
  const [state, setState] = useState({
    stats: null,
    inventory: [],
    criticalRequests: [],
    allPendingRequests: [],
    loading: true,
    error: null,
  });

  const fetchAll = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [statsRes, inventoryRes, criticalRes, allPendingRes] = await Promise.all([
        dashboardService.getStats(),
        inventoryService.getSummary(),
        requestService.getAll({ status: 'Pending', urgency: 'Critical' }),
        requestService.getAll({ status: 'Pending' }),
      ]);

      setState({
        stats: statsRes.data,
        inventory: inventoryRes.data || [],
        criticalRequests: criticalRes.data || [],
        allPendingRequests: allPendingRes.data || [],
        loading: false,
        error: null,
      });
    } catch (err) {
      const message =
        err?.message ||
        err ||
        'Failed to load dashboard data. Please check your connection and that the backend server is running.';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: typeof message === 'string' ? message : JSON.stringify(message),
      }));
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { ...state, refresh: fetchAll };
}
