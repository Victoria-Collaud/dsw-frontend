import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cambiarEstadoPelicula,
  createPelicula,
  deletePelicula,
  getPeliculas,
  getPeliculasActivas,
  buscarPeliculaPorTitulo,
  getPeliculaPorId,
  updatePelicula,
  type CreargroPelicula,
} from '../services/peliculaServices';

const PELICULAS_QUERY_KEY = ['peliculas'] as const;

// Cartelera activa o búsqueda por título
export function usePeliculas(busqueda: string = '') {
  const texto = busqueda.trim();

  return useQuery({
    queryKey: ['peliculas', 'activas', { busqueda: texto }],
    queryFn: () => {
      if (texto !== '') {
        return buscarPeliculaPorTitulo(texto);
      }
      return getPeliculasActivas();
    },
  });
}

// Todas las películas (útil para administración)
export function useTodasLasPeliculas() {
  return useQuery({
    queryKey: ['peliculas', 'todas'],
    queryFn: getPeliculas,
  });
}

export function useCrearPelicula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pelicula: CreargroPelicula) => createPelicula(pelicula),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PELICULAS_QUERY_KEY }),
  });
}

export function useActualizarPelicula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, pelicula }: { id: number; pelicula: CreargroPelicula }) =>
      updatePelicula(id, pelicula),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PELICULAS_QUERY_KEY }),
  });
}

export function useEliminarPelicula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deletePelicula(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PELICULAS_QUERY_KEY }),
  });
}

export function useCambiarEstadoPelicula() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cambiarEstadoPelicula(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PELICULAS_QUERY_KEY }),
  });
}

// Detalle de una película por ID
export function usePeliculaPorId(id?: number) {
  return useQuery({
    queryKey: ['peliculas', 'detalle', id],
    queryFn: () => getPeliculaPorId(id!),
    enabled: Boolean(id), // Solo ejecuta la consulta si hay un id válido
  });
}