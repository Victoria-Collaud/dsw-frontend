import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getGeneros,
  createGenero,
  updateGenero,
  deleteGenero,
  type Genero,
} from '../services/generosServices';

const GENEROS_QUERY_KEY = ['generos'] as const;

// Consulta de géneros (se cachean por 15 minutos porque cambian poco)
export function useGeneros() {
  return useQuery({
    queryKey: GENEROS_QUERY_KEY,
    queryFn: getGeneros,
    staleTime: 1000 * 60 * 15,
  });
}

// Crear género e invalidar caché
export function useCrearGenero() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nuevoGenero: Genero) => createGenero(nuevoGenero),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GENEROS_QUERY_KEY });
    },
  });
}

// Actualizar género e invalidar caché
export function useActualizarGenero() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, genero }: { id: number; genero: Genero }) =>
      updateGenero(id, genero),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GENEROS_QUERY_KEY });
    },
  });
}

// Eliminar género e invalidar caché
export function useEliminarGenero() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteGenero(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GENEROS_QUERY_KEY });
    },
  });
}