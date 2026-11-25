import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSala,
  deleteSala,
  getAsientosDeSala,
  getallSala,
  updateSala,
  type Sala,
} from '../services/salaServices';

const SALAS_QUERY_KEY = ['salas'] as const;

export function useSalas() {
  return useQuery({
    queryKey: SALAS_QUERY_KEY,
    queryFn: getallSala,
  });
}

export function useAsientosDeSala(numSala?: number) {
  return useQuery({
    queryKey: ['salas', 'asientos', numSala],
    queryFn: () => getAsientosDeSala(numSala!),
    enabled: Boolean(numSala),
  });
}

export function useCrearSala() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sala: Sala) => createSala(sala),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SALAS_QUERY_KEY }),
  });
}

export function useActualizarSala() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ numSala, sala }: { numSala: number; sala: Sala }) =>
      updateSala(numSala, sala),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SALAS_QUERY_KEY }),
  });
}

export function useEliminarSala() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (numSala: number) => deleteSala(numSala),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SALAS_QUERY_KEY }),
  });
}
