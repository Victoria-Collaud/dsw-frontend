
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

  const usuarioStr = localStorage.getItem('usuario');
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;

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
    return <p style={{ textAlign: 'center', marginTop: '40px', color: '#888' }}>Cargando datos de la función...</p>;
  }

  if (!funcion) {
    return <p style={{ textAlign: 'center', color: '#ff4d4d', marginTop: '40px' }}>Función no encontrada.</p>;
  }

  const precioUnitario = funcion.sala.PrecioSala;
  const total = cantidad * precioUnitario;

  async function handleComprar(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!usuario || !usuario.IdUsuario) {
      setError('Tenés que iniciar sesión para comprar.');
      return;
    }
    const funcionActual = funcion;
    if (!funcionActual) {
      setError('No se encontró la función.');
      return;
    }
    const capacidadMaxima = funcionActual.CapacidadDisponible ?? 0;
    if (cantidad > capacidadMaxima) {
      setError(`Solo quedan ${capacidadMaxima} entradas disponibles para esta función.`);
      return;
    }
    try {
      await crearCompra({
        MetodoPago: metodoPago,
        CantEntradas: cantidad,
        IdUsuario: usuario.IdUsuario, 
        IdFuncion: Number(funcionId)    
      });

      setExito(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      console.error(err);
      setError('Hubo un error al procesar la compra.');
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'system-ui, sans-serif', padding: '30px', backgroundColor: '#141414', border: '1px solid #222', borderRadius: '4px', color: '#fff' }}>
      
      <div style={{ margin: '0 0 25px 0' }}>
        <h2 style={{ fontSize: '1.25rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '2px solid #e50914', paddingBottom: '8px', display: 'inline-block', color: '#fff' }}>
          🎟️ Finalizar Compra
        </h2>
      </div>

      {/* Resumen de la Función seleccionada */}
      <div style={{ backgroundColor: '#0b0c10', border: '1px solid #222', padding: '20px', borderRadius: '4px', marginBottom: '25px' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#fff', fontSize: '1.2rem' }}>{funcion.pelicula.TituloPelicula}</h3>
        <p style={{ margin: '0 0 6px 0', color: '#aaa', fontSize: '0.9rem' }}>📅 Fecha: {new Date(funcion.Fecha).toLocaleDateString('es-AR')}</p>
        <p style={{ margin: '0 0 6px 0', color: '#aaa', fontSize: '0.9rem' }}>🕒 Horario: {funcion.Horario}</p>
        <p style={{ margin: '0 0 6px 0', color: '#aaa', fontSize: '0.9rem' }}>🏛️ Sala #{funcion.sala.NumSala} - {funcion.sala.TipoPantalla}</p>
        <p style={{ margin: '0', fontWeight: 'bold', color: '#e50914', fontSize: '0.9rem' }}>💺 Asientos disponibles: {funcion.CapacidadDisponible}</p>
      </div>

      {error && <p style={{ color: '#ff4d4d', backgroundColor: '#2d1515', border: '1px solid #e50914', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>{error}</p>}
      {exito && <p style={{ color: '#4ade80', backgroundColor: '#14291c', border: '1px solid #4ade80', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>¡Compra exitosa! Redirigiendo...</p>}

      <form onSubmit={handleComprar} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaa' }}>Cantidad de Entradas:</label>
          <input
            type="number"
            min="1"
            max={funcion.CapacidadDisponible}
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
            style={{ width: '100%', padding: '10px', backgroundColor: '#0b0c10', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaa' }}>Método de Pago:</label>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value as Metodopago)}
            style={{ width: '100%', padding: '10px', backgroundColor: '#0b0c10', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          >
            <option value={Metodopago.MERCADO_PAGO}>Mercado Pago</option>
            <option value={Metodopago.TARJETA_CREDITO}>Tarjeta de Crédito</option>
            <option value={Metodopago.TARJETA_DEBITO}>Tarjeta de Débito</option>
            <option value={Metodopago.TRANSFERENCIA}>Transferencia Bancaria</option>
          </select>
        </div>

        <div style={{ backgroundColor: '#0b0c10', border: '1px solid #222', padding: '15px', borderRadius: '4px' }}>
          <p style={{ margin: '0 0 6px 0', color: '#aaa', fontSize: '0.9rem' }}>Precio por entrada: ${precioUnitario}</p>
          <h3 style={{ margin: 0, color: '#e50914', fontSize: '1.3rem' }}>Total a Pagar: ${total}</h3>
        </div>

        <button 
          type="submit" 
          disabled={exito}
          style={{ 
            padding: '14px', 
            backgroundColor: exito ? '#333' : '#e50914', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            fontWeight: 'bold', 
            fontSize: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            cursor: exito ? 'not-allowed' : 'pointer' 
          }}
        >
          {exito ? 'Procesando...' : 'Confirmar y Pagar'}
        </button>
      </form>
    </div>
  );
}

