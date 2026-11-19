import { useQuery } from '@tanstack/react-query';
import {
  getPeliculas,
  getPeliculasActivas,
  buscarPeliculaPorTitulo,
  getPeliculaPorId,
} from '../services/peliculaServices';

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

// Detalle de una película por ID
export function usePeliculaPorId(id?: number) {
  return useQuery({
    queryKey: ['peliculas', 'detalle', id],
    queryFn: () => getPeliculaPorId(id!),
    enabled: Boolean(id), // Solo ejecuta la consulta si hay un id válido
  });
}