import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createFuncion,
  deleteFuncion,
  getFuncionesDePelicula,
  getFuncionPorId,
  updateFuncion,
  type CrearFuncionDTO,
  type Funcion,
} from '../services/funcionesServices';

const FUNCIONES_QUERY_KEY = ['funciones'] as const;

// Funciones asociadas a una película
export function useFuncionesDePelicula(idPelicula?: number) {
  return useQuery({
    queryKey: ['funciones', 'pelicula', idPelicula],
    queryFn: () => getFuncionesDePelicula(idPelicula!),
    enabled: Boolean(idPelicula),
  });
}

export function useFuncionesDisponiblesPorPeliculas(idsPeliculas: number[]) {
  return useQuery({
    queryKey: ['funciones', 'disponibles', idsPeliculas],
    enabled: idsPeliculas.length > 0,
    queryFn: async () => {
      const ahora = new Date();
      const resultados = await Promise.all(
        idsPeliculas.map(async (id) => {
          try {
            const funciones = await getFuncionesDePelicula(id);
            const funcionesValidas = funciones.filter((funcion) => {
              const fechaHora = new Date(`${funcion.Fecha.split('T')[0]}T${funcion.Horario}`);
              return fechaHora > ahora && (funcion.CapacidadDisponible ?? 0) > 0;
            });
            return { id, funciones: funcionesValidas };
          } catch {
            return { id, funciones: [] };
          }
        })
      );

      const funcionesPorPelicula: Record<number, Funcion[]> = {};
      resultados.forEach(({ id, funciones }) => {
        funcionesPorPelicula[id] = funciones;
      });
      return funcionesPorPelicula;
    },
  });
}

export function useCrearFuncion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (funcion: CrearFuncionDTO) => createFuncion(funcion),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FUNCIONES_QUERY_KEY }),
  });
}

export function useActualizarFuncion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, funcion }: { id: number; funcion: CrearFuncionDTO }) =>
      updateFuncion(id, funcion),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FUNCIONES_QUERY_KEY }),
  });
}

export function useEliminarFuncion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteFuncion(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FUNCIONES_QUERY_KEY }),
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