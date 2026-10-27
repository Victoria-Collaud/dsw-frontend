import { fetchApi } from '../utils/fetchApi';
import type { Funcion } from './funcionesServices'; // 👈 Importamos la interfaz de Función
import type { Usuario } from './usuarioServices';   // 👈 Importamos la de Usuario


const API_URL = `${import.meta.env.VITE_API_URL}`;

export const Metodopago = {
  TARJETA_CREDITO: 'TARJETA_CREDITO',
  TARJETA_DEBITO: 'TARJETA_DEBITO',
  TRANSFERENCIA: 'TRANSFERENCIA',
  MERCADO_PAGO: 'MERCADO_PAGO',
} as const;

export type Metodopago = typeof Metodopago[keyof typeof Metodopago];

//interfaz para leer
export interface Compra {
  IdCompra?: number;
  MetodoPago: Metodopago;
  Fecha: string | Date;
  CantEntradas: number;
  Precio: number;
  QREntradas: string; 
  usuario: number | Usuario;   
  funcion: number | Funcion;  
}

// interfaz para crear
export interface CrearCompraDTO {
  MetodoPago: Metodopago;
  CantEntradas: number;
  IdUsuario: number;
  IdFuncion: number;
}

export async function crearCompra(compra: CrearCompraDTO): Promise<Compra> {
  // Validación del límite de entradas en el cliente
  if (!compra.CantEntradas || compra.CantEntradas < 1) {
    throw new Error('Debes seleccionar al menos 1 entrada.');
  }
  if (compra.CantEntradas > 5) {
    throw new Error('Solo puedes comprar un máximo de 5 entradas por transacción.');
  }
  const res = await fetchApi(`${API_URL}/compras`, {
    method: 'POST',
    body: JSON.stringify(compra)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.mensaje || 'Error al procesar la compra');
  }
  return await res.json();
}

export async function getCompras(): Promise<Compra[]> {
  const res = await fetchApi(`${API_URL}/compras`);
  
  if (!res.ok) throw new Error('Error al obtener las compras');
  
  const json = await res.json();
  return json.data || json;
}