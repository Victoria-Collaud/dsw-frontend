import { useState } from 'react'; 
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; 
import { createFuncion, deleteFuncion, getFuncionesDePelicula, updateFuncion } from '../../services/funcionesServices';
import type { Funcion } from '../../services/funcionesServices';
import { getPeliculas } from '../../services/peliculaServices';
import { getallSala } from '../../services/salaServices';
import Loader from '../../components/Loader';
import './AdminFunciones.css';
import { useAlerta } from '../../hooks/useAlerta';
import { useForm } from 'react-hook-form';

interface FuncionFormData {
  Idioma: string;
  Fecha: string;
  Horario: string;
  peliculaId: number;
  salaId: number;
}

interface BusquedaFormData {
  peliculaABuscar: number;
}

export default function AdminFunciones() {
  const queryClient = useQueryClient(); 
  const [peliculaBuscadaId, setPeliculaBuscadaId] = useState<number | null>(null); 
  const [funcionEditando, setFuncionEditando] = useState<number | null>(null);
  const { alertaConfirmacion, alertaExito, alertaError, alertaAdvertencia } = useAlerta();

  const {
    register: registerFuncion,
    handleSubmit: handleSubmitFuncion,
    reset: resetFuncion,
    setValue: setValueFuncion,
  } = useForm<FuncionFormData>();

  const {
    register: registerBusqueda,
    handleSubmit: handleSubmitBusqueda,
  } = useForm<BusquedaFormData>();

  // Películas y salas con useQuery 
  const {
    data: peliculas = [],
    isLoading: cargandoPeliculas,
    isError: errorPeliculas,
  } = useQuery({
    queryKey: ['peliculas', 'todas'],
    queryFn: getPeliculas,
  });

  const {
    data: salas = [],
    isLoading: cargandoSalas,
    isError: errorSalas,
  } = useQuery({
    queryKey: ['salas'],
    queryFn: getallSala,
  });

  // Funciones de la película buscada
  const {
    data: funciones = [],
    isLoading: cargandoFunciones,
    isError: errorFunciones,
  } = useQuery({
    queryKey: ['funciones', 'pelicula', peliculaBuscadaId],
    queryFn: () => getFuncionesDePelicula(peliculaBuscadaId!),
    enabled: peliculaBuscadaId !== null && peliculaBuscadaId > 0,
  });

  const peliculaBuscada =
    peliculaBuscadaId !== null
      ? peliculas.find((p) => p.IdPelicula === peliculaBuscadaId) || null
      : null; 

  //  Mutación para crear o actualizar función
  const guardarFuncionMutation = useMutation({
    mutationFn: async ({
      idEditando,
      funcionData,
    }: {
      idEditando: number | null;
      funcionData: Omit<Funcion, 'IdFuncion'>;
    }) => {
      if (idEditando) {
        return updateFuncion(idEditando, funcionData);
      }
      return createFuncion(funcionData);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['funciones'] });
      if (peliculaBuscadaId !== null) {
        queryClient.invalidateQueries({ queryKey: ['funciones', 'pelicula', peliculaBuscadaId] });
      }
      limpiarFormulario();
      if (variables.idEditando) {
        alertaExito('¡Actualizada!', 'La función fue actualizada exitosamente.');
      } else {
        alertaExito('¡Creada!', 'La función fue creada exitosamente.');
      }
    },
    onError: (err: unknown) => {
      console.error('Error al guardar la función', err);
      const mensajeError = err instanceof Error ? err.message : 'No se pudo guardar la función.';
      alertaError('Error', mensajeError);
    },
  });

  //  Mutación para eliminar función
  const eliminarFuncionMutation = useMutation({
    mutationFn: (idFuncion: number) => deleteFuncion(idFuncion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funciones'] });
      if (peliculaBuscadaId !== null) {
        queryClient.invalidateQueries({ queryKey: ['funciones', 'pelicula', peliculaBuscadaId] });
      }
      alertaExito('¡Eliminado!', 'La función ha sido eliminada correctamente.');
    },
    onError: (error: unknown) => {
      console.error(error);
      alertaError('Error', 'No se pudo eliminar la función.');
    },
  });

  // Función para limpiar el formulario
  function limpiarFormulario() {
    resetFuncion({ Idioma: '', Fecha: '', Horario: '', peliculaId: 0, salaId: 0 });
    setFuncionEditando(null);
  }

  // Función para cargar los datos en el formulario al editar
  function handleEditar(func: Funcion) {
    setValueFuncion('Idioma', func.Idioma);
    setValueFuncion('Fecha', func.Fecha.split('T')[0]);
    setValueFuncion('Horario', func.Horario);
    setValueFuncion('peliculaId', func.pelicula.IdPelicula!);
    setValueFuncion('salaId', func.sala.NumSala);
    setFuncionEditando(func.IdFuncion!);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Crear o Actualizar función
    const onSubmitFuncion = (data: FuncionFormData) => { 
    const fechaHoraFuncion = new Date(`${data.Fecha}T${data.Horario}`);
    const ahora = new Date();
    if (fechaHoraFuncion < ahora) {
      alertaAdvertencia('Fecha inválida', 'No podés crear una función con una fecha u horario que ya pasó.');
      return;
    }

    const peliculaSeleccionada = peliculas.find((p) => p.IdPelicula === data.peliculaId);
    const salaSeleccionada = salas.find((s) => s.NumSala === data.salaId);

    if (!peliculaSeleccionada || !salaSeleccionada) {
      alertaError('Error', 'Película o sala no válida.');
      return;
    }

    const funcionData: Omit<Funcion, 'IdFuncion'> = {
      Idioma: data.Idioma,
      Fecha: data.Fecha,
      Horario: data.Horario,
      pelicula: peliculaSeleccionada,
      sala: salaSeleccionada,
    };

    guardarFuncionMutation.mutate({ idEditando: funcionEditando, funcionData }); 
  };

  const onSubmitBusqueda = (data: BusquedaFormData) => { 
    if (!data.peliculaABuscar) {
      alertaAdvertencia('Atención', 'Seleccioná una película primero.');
      return;
    }
    setPeliculaBuscadaId(Number(data.peliculaABuscar)); 
  };

  async function handleDelete(IdFuncion?: number) {
    if (!IdFuncion) return;
    const confirmado = await alertaConfirmacion(
      '¿Estás seguro?',
      '¿Seguro que querés eliminar esta función?',
      'Si, Eliminar'
    );
    if (!confirmado) return;
    eliminarFuncionMutation.mutate(IdFuncion); 
  }

  const formatearFecha = (f: string) => {
    try {
      return new Date(f).toLocaleDateString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      });
    } catch {
      return f;
    }
  };

  if (cargandoPeliculas || cargandoSalas) { 
    return <Loader mensaje="Cargando funciones..." />;
  }

  return (
    <div className="admin-funciones-container">

      <div className="admin-funciones-header">
        <h2 className="admin-funciones-title">
          Gestión de Funciones
        </h2>
      </div>

      {(errorPeliculas || errorSalas) && ( 
        <p className="admin-funciones-empty">
          No se pudieron obtener las películas o salas. Por favor, intentá nuevamente.
        </p>
      )}

      {/* FORMULARIO DE CREACIÓN / EDICIÓN */}
      <form onSubmit={handleSubmitFuncion(onSubmitFuncion)} className="admin-funciones-form">
        <h3 className="admin-funciones-form-title">
          {funcionEditando ? ` Editar Función #${funcionEditando}` : 'Agregar Nueva Función'}
        </h3>

        <div className="admin-funciones-field">
          <label className="admin-funciones-label">Película:</label>
          <select
            {...registerFuncion('peliculaId', { required: true, valueAsNumber: true })}
            className="admin-funciones-select"
          >
            <option value="">-- Seleccioná una película --</option>
            {peliculas.map((p) => (
              <option key={p.IdPelicula} value={p.IdPelicula}>{p.TituloPelicula}</option>
            ))}
          </select>
        </div>

        <div className="admin-funciones-field">
          <label className="admin-funciones-label">Sala:</label>
          <select
            {...registerFuncion('salaId', { required: true, valueAsNumber: true })}
            className="admin-funciones-select"
          >
            <option value="">-- Seleccioná una sala --</option>
            {salas.map((s) => (
              <option key={s.NumSala} value={s.NumSala}>
                Sala #{s.NumSala} - {s.TipoPantalla} ({s.Capacidad} asientos)
              </option>
            ))}
          </select>
        </div>

        <div className="admin-funciones-field">
          <label className="admin-funciones-label">Idioma:</label>
          <select
            {...registerFuncion('Idioma', { required: true })}
            className="admin-funciones-select"
          >
            <option value="">-- Seleccioná --</option>
            <option value="Español">Español</option>
            <option value="Subtitulada">Subtitulada</option>
          </select>
        </div>

        <div className="admin-funciones-field">
          <label className="admin-funciones-label">Fecha:</label>
          <input
            type="date"
            {...registerFuncion('Fecha', { required: true })}
            className="admin-funciones-input"
          />
        </div>

        <div className="admin-funciones-field">
          <label className="admin-funciones-label">Horario:</label>
          <input
            type="time"
            {...registerFuncion('Horario', { required: true })}
            className="admin-funciones-input"
          />
        </div>

        <div className="admin-funciones-actions">
          <button
            type="submit"
            disabled={guardarFuncionMutation.isPending} 
            className="admin-funciones-btn-submit"
          >
            {guardarFuncionMutation.isPending 
              ? 'Guardando...'
              : funcionEditando
              ? 'Guardar Cambios'
              : 'Crear Función'}
          </button>
          {funcionEditando && (
            <button
              type="button"
              onClick={limpiarFormulario}
              className="admin-funciones-btn-cancel"
            >
              Cancelar
            </button>
          )}
        </div>

      </form>

      {/* SECCIÓN DE BÚSQUEDA */}
      <div className="admin-funciones-search-section">
        <h3 className="admin-funciones-search-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg> Buscar Funciones de una Película
        </h3>

        <form onSubmit={handleSubmitBusqueda(onSubmitBusqueda)} className="admin-funciones-search-bar">
          <select
            {...registerBusqueda('peliculaABuscar', { required: true, valueAsNumber: true })}
            className="admin-funciones-search-select"
          >
            <option value="">-- Seleccioná una película --</option>
            {peliculas.map((p) => (
              <option key={p.IdPelicula} value={p.IdPelicula}>{p.TituloPelicula}</option>
            ))}
          </select>

          <button
            type="submit"
            className="admin-funciones-btn-search"
          >
            Buscar
          </button>
        </form>

        {/* LISTADO DE RESULTADOS */}
        {peliculaBuscada && (
          <div className="admin-funciones-results">
            <h4 className="admin-funciones-results-title">Funciones de: {peliculaBuscada.TituloPelicula}</h4>
            {cargandoFunciones ? ( 
              <Loader mensaje="Buscando funciones..." /> 
            ) : errorFunciones ? ( 
              <p className="admin-funciones-empty">No se pudieron obtener las funciones de esta película.</p> 
            ) : funciones.length === 0 ? (
              <p className="admin-funciones-empty">Esta película no tiene funciones programadas.</p>
            ) : (
              <ul className="admin-funciones-list">
                {funciones.map((f) => (
                  <li key={f.IdFuncion} className="admin-funciones-card">

                    <div className="admin-funciones-card-info">
                      <strong>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 14v2.2l1.6 1"/><path d="M16 2v3"/><path d="M21 7.338V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h2.338"/><path d="M3 9h5.859"/><path d="M8 2v3"/><circle cx="16" cy="16" r="6"/></svg>
                        {formatearFecha(f.Fecha)} a las {f.Horario}
                      </strong>
                      <br />
                      <small>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg> {f.Idioma} |
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 18v-7"/><path d="M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/></svg> Sala #{f.sala.NumSala}
                      </small>
                    </div>

                    <div className="admin-funciones-card-actions">
                      <button
                        onClick={() => handleEditar(f)}
                        className="admin-funciones-btn-edit"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => handleDelete(f.IdFuncion)}
                        disabled={eliminarFuncionMutation.isPending} 
                        className="admin-funciones-btn-delete"
                      >
                        Eliminar
                      </button>

                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}