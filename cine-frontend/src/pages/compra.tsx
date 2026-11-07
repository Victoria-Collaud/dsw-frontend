import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { crearCompra, getAsientosOcupados, Metodopago } from '../services/compraServices';
import { getFuncionPorId } from '../services/funcionesServices';
import Loader from '../components/Loader';
import type { Funcion } from '../services/funcionesServices';
import { getAsientosDeSala } from '../services/salaServices.ts';


export default function Compra() {
  const { funcionId } = useParams<{ funcionId: string }>();
  const navigate = useNavigate();


  const [funcion, setFuncion] = useState<Funcion | null>(null);
  const [cargando, setCargando] = useState(true);
  //const [cantidad, setCantidad] = useState<number>(1);
  const [metodoPago, setMetodoPago] = useState<Metodopago>(Metodopago.MERCADO_PAGO);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);


  const usuarioStr = localStorage.getItem('usuario');
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
   //  Estados para los asientos
  const [asientosDisponibles, setAsientosDisponibles] = useState<string[]>([]);
  const [asientosOcupados, setAsientosOcupados] = useState<string[]>([]);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState<string[]>([]);


  useEffect(() => {
    async function cargarFuncion() {
      if (!funcionId) return;
      try {
        const data = await getFuncionPorId(Number(funcionId));
        setFuncion(data);


        // Traemos los asientos de la sala y los ocupados de la función
        const [asientos, ocupados] = await Promise.all([
          getAsientosDeSala(data.sala.NumSala),
          getAsientosOcupados(Number(funcionId))
        ]);
        setAsientosDisponibles(asientos);
        setAsientosOcupados(ocupados);


      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la función seleccionada.');
      } finally {
        setCargando(false);
      }
    }
    cargarFuncion();
  }, [funcionId]);


    function toggleAsiento(asiento: string) { //!!
    if (asientosOcupados.includes(asiento)) return;
   
    if (asientosSeleccionados.includes(asiento)) {
      setAsientosSeleccionados(asientosSeleccionados.filter(a => a !== asiento));
    } else {
      if (asientosSeleccionados.length >= 5) {
        setError('Solo podés seleccionar hasta 5 asientos.');
        return;
      }
      setAsientosSeleccionados([...asientosSeleccionados, asiento]);
    }
  }


  if (cargando) {
    return <Loader mensaje="Cargando..." />
  }


  if (!funcion) {
    return <p style={{ textAlign: 'center', color: '#ff4d4d', marginTop: '40px' }}>Función no encontrada.</p>;
  }


  const precioUnitario = funcion.sala.PrecioSala;
  const total = asientosSeleccionados.length * precioUnitario;


  async function handleComprar(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!usuario || !usuario.IdUsuario) {
      setError('Tenés que iniciar sesión para comprar.');
      return;
    }
    if (asientosSeleccionados.length === 0) {
      setError('Seleccioná al menos un asiento.');
      return;
    }
    const funcionActual = funcion;
    if (!funcionActual) {
      setError('No se encontró la función.');
      return;
    }
    const capacidadMaxima = funcionActual.CapacidadDisponible ?? 0;
    if (asientosSeleccionados.length > capacidadMaxima) {
      setError(`Solo quedan ${capacidadMaxima} entradas disponibles para esta función.`);
      return;
    }
    try {
      await crearCompra({
        MetodoPago: metodoPago,
        AsientosElegidos: asientosSeleccionados,
        CantEntradas: asientosSeleccionados.length,
        IdUsuario: usuario.IdUsuario,
        IdFuncion: Number(funcionId)    
      });


      setExito(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);


    } catch (err) {
      console.error(err);
     
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Hubo un error al procesar la compra.');
      }
    }
  }


  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'system-ui, sans-serif', padding: '30px', backgroundColor: '#141414', border: '1px solid #222', borderRadius: '4px', color: '#fff' }}>
     
      <div style={{ margin: '0 0 25px 0' }}>
        <h2 style={{ fontSize: '1.25rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '2px solid #e50914', paddingBottom: '8px', display: 'inline-block', color: '#fff' }}>
          Finalizar Compra
        </h2>
      </div>


{/* Resumen de la Función seleccionada */}
      <div style={{ backgroundColor: '#0b0c10', border: '1px solid #222', padding: '20px', borderRadius: '4px', marginBottom: '25px' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#fff', fontSize: '1.2rem' }}>{funcion.pelicula.TituloPelicula}</h3>
        <p style={{ margin: '0 0 6px 0', color: '#aaa', fontSize: '0.9rem' }}> Fecha: {new Date(funcion.Fecha).toLocaleDateString('es-AR')}</p>
        <p style={{ margin: '0 0 6px 0', color: '#aaa', fontSize: '0.9rem' }}> Horario: {funcion.Horario}</p>
        <p style={{ margin: '0 0 6px 0', color: '#aaa', fontSize: '0.9rem' }}> Sala #{funcion.sala.NumSala} </p>
        <p style={{ margin: '0 0 5px 0' }}> 
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-tv-minimal preview-icon"><path d="M7 21h10"/><rect width="20" height="14" x="2" y="3" rx="2"/></svg> Pantalla: {funcion.sala.TipoPantalla} 
          | <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-armchair preview-icon"><path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z"/><path d="M5 18v2"/><path d="M19 18v2"/></svg> Asientos: {funcion.sala.TipoAsientos}
</p>
        <p style={{ margin: '0', fontWeight: 'bold', color: '#e50914', fontSize: '0.9rem' }}> Asientos disponibles: {funcion.CapacidadDisponible}</p>
      </div>


      {error && <p style={{ color: '#ff4d4d', backgroundColor: '#2d1515', border: '1px solid #e50914', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>{error}</p>}
      {exito && <p style={{ color: '#4ade80', backgroundColor: '#14291c', border: '1px solid #4ade80', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>¡Compra exitosa! Redirigiendo...</p>}


      {/* MAPA DE ASIENTOS */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Seleccioná tus asientos:</h3>
       
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ backgroundColor: '#e50914', height: '8px', width: '60%', margin: '0 auto', borderRadius: '5px' }}></div>
          <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '5px' }}>PANTALLA</p>
        </div>


        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          {Array.from(new Set(asientosDisponibles.map(a => a[0]))).map(fila => (
            <div key={fila} style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#888', width: '20px' }}>{fila}</span>
              {asientosDisponibles.filter(a => a[0] === fila).map(asiento => {
                const ocupado = asientosOcupados.includes(asiento);
                const seleccionado = asientosSeleccionados.includes(asiento);
                return (
                  <button
                    key={asiento}
                    type="button"
                    onClick={() => toggleAsiento(asiento)}
                    disabled={ocupado}
                    style={{
                      width: '35px', height: '35px', borderRadius: '4px',
                      backgroundColor: ocupado ? '#333' : seleccionado ? '#4ade80' : '#222',
                      color: ocupado ? '#555' : seleccionado ? '#000' : '#fff',
                      border: '1px solid #444',
                      cursor: ocupado ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {asiento.slice(1)}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
       
        <div style={{ marginTop: '15px', textAlign: 'center', color: '#4ade80' }}>
          {asientosSeleccionados.length > 0
            ? `Seleccionados: ${asientosSeleccionados.join(', ')}`
            : 'Ningún asiento seleccionado'}
        </div>
      </div>


      <form onSubmit={handleComprar} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* NUEVO PANEL DE RESUMEN DINÁMICO */}
        <div style={{ backgroundColor: '#0b0c10', border: '1px solid #222', padding: '15px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem' }}>
           Entradas a comprar: <strong style={{ color: '#fff' }}>{asientosSeleccionados.length}</strong>
          </p>
        <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem' }}>
         Precio por entrada: <strong style={{ color: '#fff' }}>${precioUnitario}</strong>
          </p>
       <h3 style={{ margin: '10px 0 0 0', color: '#e50914', fontSize: '1.3rem' }}>
           Total a Pagar: ${total}
      </h3>
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
          disabled={exito || asientosSeleccionados.length === 0}
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
          {exito
        ? 'Procesando...'
        : asientosSeleccionados.length === 0
        ? 'Seleccioná un asiento'
        : `Confirmar y Pagar (${asientosSeleccionados.length} ${asientosSeleccionados.length === 1 ? 'entrada' : 'entradas'})`
  }


        </button>
      </form>
    </div>
  );
}


