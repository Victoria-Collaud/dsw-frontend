import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  crearCompra,
  getAsientosOcupados,
  type CrearCompraDTO,
} from '../services/compraServices';

export function useAsientosOcupados(idFuncion?: number) {
  return useQuery({
    queryKey: ['compras', 'asientosOcupados', idFuncion],
    queryFn: () => getAsientosOcupados(idFuncion!),
    enabled: Boolean(idFuncion),
  });
}

export function useCrearCompra(idFuncion: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (compra: CrearCompraDTO) => crearCompra(compra),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['compras', 'asientosOcupados', idFuncion],
        }),
        queryClient.invalidateQueries({ queryKey: ['funciones'] }),
        queryClient.invalidateQueries({ queryKey: ['misCompras'] }),
      ]);
    },
  });
}
