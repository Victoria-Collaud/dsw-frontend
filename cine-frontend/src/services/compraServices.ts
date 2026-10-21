import { fetchApi } from '../utils/fetchApi';

const API_URL = `${import.meta.env.VITE_API_URL}`

const getHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

export const Metodopago = {
  TARJETA_CREDITO: 'TARJETA_CREDITO',
  TARJETA_DEBITO: 'TARJETA_DEBITO',
  TRANSFERENCIA: 'TRANSFERENCIA',
  MERCADO_PAGO: 'MERCADO_PAGO',
} as const

export type Metodopago = typeof Metodopago[keyof typeof Metodopago]

export interface Compra {
  IdCompra?: number
  MetodoPago: Metodopago
  Fecha: string | Date
  CantEntradas: number
  Precio: number
  QREntradas: string
  usuario: number | { idUsuario?: number }
  funcion: number | { IdFuncion?: number }
}

export async function crearCompra(compra: Compra): Promise<Compra> {
  const res = await fetchApi(`${API_URL}/compras`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(compra)
  })
  if (!res.ok) throw new Error('Error al procesar la compra')
  return await res.json()
}

export async function getCompras(): Promise<Compra[]> {
  const res = await fetchApi(`${API_URL}/compras`, {
    headers: getHeaders()
  })
  if (!res.ok) throw new Error('Error al obtener las compras')
  const json = await res.json()
  return json.data || json
}