import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux.js';
import { fetchHealthStatus } from '../redux/slices/healthSlice.js';

export const useHealthCheck = (autoCheck = true) => {
  const dispatch = useAppDispatch();
  const { data, status, error, lastCheckedAt } = useAppSelector((state) => state.health);

  const refetch = useCallback(() => {
    dispatch(fetchHealthStatus());
  }, [dispatch]);

  useEffect(() => {
    if (autoCheck && status === 'idle') {
      dispatch(fetchHealthStatus());
    }
  }, [autoCheck, status, dispatch]);

  return {
    data,
    status,
    error,
    lastCheckedAt,
    refetch,
    isLoading: status === 'loading',
    isSuccess: status === 'succeeded',
    isError: status === 'failed',
  };
};
