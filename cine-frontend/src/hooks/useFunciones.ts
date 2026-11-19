import { useQuery } from '@tanstack/react-query';
import {
  getFuncionesDePelicula,
  getFuncionPorId,
} from '../services/funcionesServices';

// Funciones asociadas a una película
export function useFuncionesDePelicula(idPelicula?: number) {
  return useQuery({
    queryKey: ['funciones', 'pelicula', idPelicula],
    queryFn: () => getFuncionesDePelicula(idPelicula!),
    enabled: Boolean(idPelicula),
  });
}

// Detalle de una función por ID (útil para compra o edición)
export function useFuncionPorId(idFuncion?: number) {
  return useQuery({
    queryKey: ['funciones', 'detalle', idFuncion],
    queryFn: () => getFuncionPorId(idFuncion!),
    enabled: Boolean(idFuncion),
  });
}