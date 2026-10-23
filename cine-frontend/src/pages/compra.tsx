// src/pages/compra.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { crearCompra, Metodopago } from '../services/compraServices';
import { getFuncionPorId } from '../services/funcionesServices';
import type { Funcion } from '../services/funcionesServices';

export default function Compra() {
  const { funcionId } = useParams<{ funcionId: string }>();
  const navigate = useNavigate();

  const [funcion, setFuncion] = useState<Funcion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [cantidad, setCantidad] = useState<number>(1);
  const [metodoPago, setMetodoPago] = useState<Metodopago>(Metodopago.MERCADO_PAGO);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  // 1. Obtenemos el usuario logueado del localStorage
  const usuarioStr = localStorage.getItem('usuario');
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;

  // 2. Cargamos los datos de la función al montar el componente
  useEffect(() => {
    async function cargarFuncion() {
      if (!funcionId) return;
      try {
        const data = await getFuncionPorId(Number(funcionId));
        setFuncion(data);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la función seleccionada.');
      } finally {
        setCargando(false);
      }
    }
    cargarFuncion();
  }, [funcionId]);

  if (cargando) {
    return <p style={{ textAlign: 'center', marginTop: '40px' }}>Cargando datos de la función...</p>;
  }

  if (!funcion) {
    return <p style={{ textAlign: 'center', color: 'red', marginTop: '40px' }}>Función no encontrada.</p>;
  }

  // 3. Calculamos el precio real usando el precio de la sala
  const precioUnitario = funcion.sala.PrecioSala;
  const total = cantidad * precioUnitario;

  async function handleComprar(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    // Validaciones previas
    if (!usuario || !usuario.IdUsuario) {
      setError('Tenés que iniciar sesión para comprar.');
      return;
    }
    const funcionActual = funcion;
       if (!funcionActual) {
    setError('No se encontró la función.');
    return;
  }
     if (cantidad > funcionActual.CapacidadDisponible) {
    setError(`Solo quedan ${funcionActual.CapacidadDisponible} entradas disponibles para esta función.`);
    return;
  }
    try {
      // 4. Enviamos EXACTAMENTE lo que espera el backend
      await crearCompra({
        MetodoPago: metodoPago,
        CantEntradas: cantidad,
        IdUsuario: usuario.IdUsuario, 
        IdFuncion: Number(funcionId)   
      });

      setExito(true);
      setTimeout(() => {
        navigate('/'); // Redirigimos al inicio después de 2 segundos
      }, 2000);

    } catch (err) {
      console.error(err);
      setError('Hubo un error al procesar la compra.');
    }
  }

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', fontFamily: 'sans-serif', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>🎟️ Finalizar Compra</h2>

      {/* Resumen de la Función seleccionada */}
      <div style={{ backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>{funcion.pelicula.TituloPelicula}</h3>
        <p style={{ margin: '0 0 5px 0' }}>📅 Fecha: {new Date(funcion.Fecha).toLocaleDateString('es-AR')}</p>
        <p style={{ margin: '0 0 5px 0' }}>🕒 Horario: {funcion.Horario}</p>
        <p style={{ margin: '0 0 5px 0' }}>🏛️ Sala #{funcion.sala.NumSala} - {funcion.sala.TipoPantalla}</p>
        <p style={{ margin: '0', fontWeight: 'bold', color: '#555' }}>💺 Asientos disponibles: {funcion.CapacidadDisponible}</p>
      </div>

      {error && <p style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '8px', borderRadius: '4px' }}>{error}</p>}
      {exito && <p style={{ color: 'green', backgroundColor: '#e6ffe6', padding: '8px', borderRadius: '4px' }}>¡Compra exitosa! Redirigiendo...</p>}

      <form onSubmit={handleComprar} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Cantidad de Entradas:</label>
          <input
            type="number"
            min="1"
            max={funcion.CapacidadDisponible}
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Método de Pago:</label>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value as Metodopago)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          >
            <option value={Metodopago.MERCADO_PAGO}>Mercado Pago</option>
            <option value={Metodopago.TARJETA_CREDITO}>Tarjeta de Crédito</option>
            <option value={Metodopago.TARJETA_DEBITO}>Tarjeta de Débito</option>
            <option value={Metodopago.TRANSFERENCIA}>Transferencia Bancaria</option>
          </select>
        </div>

        <div style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px' }}>
          <p style={{ margin: '0 0 5px 0', color: '#666' }}>Precio por entrada: ${precioUnitario}</p>
          <h3 style={{ margin: 0 }}>Total a Pagar: ${total}</h3>
        </div>

        <button 
          type="submit" 
          disabled={exito}
          style={{ 
            padding: '12px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            fontWeight: 'bold', 
            cursor: exito ? 'not-allowed' : 'pointer' 
          }}
        >
          {exito ? 'Procesando...' : 'Confirmar y Pagar'}
        </button>
      </form>
    </div>
  );
}