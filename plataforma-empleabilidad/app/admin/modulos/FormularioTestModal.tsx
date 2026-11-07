'use client';

import { useState, useTransition } from 'react';
import {
  crearEvaluacionCompletaAction,
  actualizarEvaluacionAction,
  getEvaluacionPorId,
  PreguntaDTO,
} from './actionsTest';

type Props = {
  idModulo: number;
  siguienteOrden?: number;
  evaluacionEditar?: any;
};

export default function FormularioTestModal({
  idModulo,
  siguienteOrden = 1,
  evaluacionEditar,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [errorForm, setErrorForm] = useState('');
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [duracion, setDuracion] = useState(15);
  const [porcentajeMin, setPorcentajeMin] = useState(70);
  const [orden, setOrden] = useState(siguienteOrden);
  const [estado, setEstado] = useState<'publicada' | 'borrador'>('publicada');

  const [preguntas, setPreguntas] = useState<PreguntaDTO[]>([
    {
      enunciado: '',
      puntaje: 1,
      orden: 1,
      alternativas: [
        { texto_alternativa: '', es_correcta: true, orden: 1 },
        { texto_alternativa: '', es_correcta: false, orden: 2 },
      ],
    },
  ]);

  const handleOpenModal = async () => {
    setErrorForm('');
    setIsOpen(true);

    if (evaluacionEditar) {
      setCargandoDatos(true);
      setTitulo(evaluacionEditar.titulo_evaluacion || '');
      setDescripcion(evaluacionEditar.descripcion_evaluacion || '');
      setDuracion(evaluacionEditar.duracion_minutos || 15);
      setPorcentajeMin(Number(evaluacionEditar.porcentaje_minimo_aprobacion) || 70);
      setOrden(evaluacionEditar.orden_evaluacion || 1);
      setEstado(
        evaluacionEditar.estado_evaluacion?.toLowerCase() === 'borrador' ? 'borrador' : 'publicada'
      );

      // Cargar preguntas y opciones desde el servidor
      const datosCompletos = await getEvaluacionPorId(evaluacionEditar.id_evaluacion);
      if (datosCompletos && datosCompletos.preguntas?.length > 0) {
        setPreguntas(datosCompletos.preguntas);
      }
      setCargandoDatos(false);
    } else {
      setTitulo('');
      setDescripcion('');
      setDuracion(15);
      setPorcentajeMin(70);
      setOrden(siguienteOrden);
      setEstado('publicada');
      setPreguntas([
        {
          enunciado: '',
          puntaje: 1,
          orden: 1,
          alternativas: [
            { texto_alternativa: '', es_correcta: true, orden: 1 },
            { texto_alternativa: '', es_correcta: false, orden: 2 },
          ],
        },
      ]);
    }
  };

  const handleAgregarPregunta = () => {
    setPreguntas((prev) => [
      ...prev,
      {
        enunciado: '',
        puntaje: 1,
        orden: prev.length + 1,
        alternativas: [
          { texto_alternativa: '', es_correcta: true, orden: 1 },
          { texto_alternativa: '', es_correcta: false, orden: 2 },
        ],
      },
    ]);
  };

  const handleEliminarPregunta = (indexPreg: number) => {
    setPreguntas((prev) =>
      prev.filter((_, idx) => idx !== indexPreg).map((p, i) => ({ ...p, orden: i + 1 }))
    );
  };

  const handleAgregarAlternativa = (indexPreg: number) => {
    setPreguntas((prev) =>
      prev.map((p, idx) => {
        if (idx !== indexPreg) return p;
        if (p.alternativas.length >= 5) return p;
        return {
          ...p,
          alternativas: [
            ...p.alternativas,
            { texto_alternativa: '', es_correcta: false, orden: p.alternativas.length + 1 },
          ],
        };
      })
    );
  };

  const handleEliminarAlternativa = (indexPreg: number, indexAlt: number) => {
    setPreguntas((prev) =>
      prev.map((p, idx) => {
        if (idx !== indexPreg) return p;
        if (p.alternativas.length <= 1) return p;
        const filtradas = p.alternativas.filter((_, aIdx) => aIdx !== indexAlt);
        return {
          ...p,
          alternativas: filtradas.map((a, i) => ({ ...a, orden: i + 1 })),
        };
      })
    );
  };

  const handleMarcarCorrecta = (indexPreg: number, indexAlt: number) => {
    setPreguntas((prev) =>
      prev.map((p, pIdx) => {
        if (pIdx !== indexPreg) return p;
        return {
          ...p,
          alternativas: p.alternativas.map((a, aIdx) => ({
            ...a,
            es_correcta: aIdx === indexAlt,
          })),
        };
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm('');

    if (!titulo.trim()) {
      setErrorForm('El título de la evaluación es requerido.');
      return;
    }

    if (!orden || orden < 1) {
      setErrorForm('El orden debe ser un número mayor o igual a 1.');
      return;
    }

    for (let i = 0; i < preguntas.length; i++) {
      const p = preguntas[i];
      if (!p.enunciado.trim()) {
        setErrorForm(`La pregunta #${i + 1} requiere un enunciado.`);
        return;
      }
      if (p.alternativas.some((a) => !a.texto_alternativa.trim())) {
        setErrorForm(`Completa el texto de todas las alternativas en la pregunta #${i + 1}.`);
        return;
      }
      if (!p.alternativas.some((a) => a.es_correcta)) {
        setErrorForm(`Selecciona la respuesta correcta para la pregunta #${i + 1}.`);
        return;
      }
    }

    startTransition(async () => {
      const payload = {
        modulo_id_modulo: idModulo,
        titulo_evaluacion: titulo,
        descripcion_evaluacion: descripcion,
        porcentaje_minimo_aprobacion: porcentajeMin,
        duracion_minutos: duracion,
        orden_evaluacion: Number(orden),
        estado_evaluacion: estado,
        preguntas,
      };

      let res;
      if (evaluacionEditar) {
        res = await actualizarEvaluacionAction(evaluacionEditar.id_evaluacion, payload);
      } else {
        res = await crearEvaluacionCompletaAction(payload);
      }

      if (res && !res.success) {
        setErrorForm(res.message);
      } else {
        setIsOpen(false);
      }
    });
  };

  return (
    <>
      {evaluacionEditar ? (
        <button
          type="button"
          onClick={handleOpenModal}
          className="p-1.5 text-[#006689] hover:bg-[#e6f2fb] rounded-md transition-colors flex items-center justify-center"
          title="Editar evaluación / test"
        >
          <span className="material-symbols-outlined text-base">edit</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpenModal}
          className="px-3.5 py-1.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <span className="material-symbols-outlined text-base">quiz</span>
          + NUEVO TEST
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-[#c3c6d0]/40 w-full max-w-3xl my-8 p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#c3c6d0]/30 pb-3">
              <h3 className="text-base font-bold text-[#002547] flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">quiz</span>
                {evaluacionEditar ? 'Editar Evaluación / Test' : 'Crear Evaluación / Test'}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[#737780] hover:text-[#002547]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {cargandoDatos ? (
              <div className="py-12 text-center text-xs text-[#737780] font-bold">
                Cargando preguntas y alternativas...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs">
                {errorForm && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 font-semibold rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    {errorForm}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#f8fafc] p-4 rounded-xl border border-[#c3c6d0]/30">
                  <div className="md:col-span-2">
                    <label className="block font-bold text-[#002547] uppercase mb-1">
                      Título de la Evaluación *
                    </label>
                    <input
                      type="text"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      required
                      placeholder="Ej. Examen de Certificación Módulo 1"
                      className="w-full p-2.5 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-indigo-600 bg-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-[#002547] uppercase mb-1">Instrucciones</label>
                    <textarea
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      rows={2}
                      placeholder="Instrucciones para el alumno..."
                      className="w-full p-2.5 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-indigo-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#002547] uppercase mb-1">Duración (Minutos)</label>
                    <input
                      type="number"
                      min={1}
                      value={duracion}
                      onChange={(e) => setDuracion(Number(e.target.value))}
                      required
                      className="w-full p-2.5 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-indigo-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#002547] uppercase mb-1">Porcentaje Mínimo Aprobación (%)</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={porcentajeMin}
                      onChange={(e) => setPorcentajeMin(Number(e.target.value))}
                      required
                      className="w-full p-2.5 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-indigo-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#002547] uppercase mb-1">Orden de Aparición en Módulo *</label>
                    <input
                      type="number"
                      min={1}
                      value={orden}
                      onChange={(e) => setOrden(Number(e.target.value))}
                      required
                      className="w-full p-2.5 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-indigo-600 bg-white font-bold text-[#002547]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#002547] uppercase mb-1">Estado de la Evaluación *</label>
                    <select
                      value={estado}
                      onChange={(e) => setEstado(e.target.value as 'publicada' | 'borrador')}
                      className="w-full p-2.5 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-indigo-600 bg-white font-bold text-[#002547]"
                    >
                      <option value="publicada">Publicada</option>
                      <option value="borrador">No publicada</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-[#002547] uppercase tracking-wider text-xs">
                      Preguntas ({preguntas.length})
                    </h4>
                    <button
                      type="button"
                      onClick={handleAgregarPregunta}
                      className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-base">add</span>
                      Añadir Pregunta
                    </button>
                  </div>

                  {preguntas.map((p, pIdx) => (
                    <div key={pIdx} className="p-4 bg-white rounded-xl border border-[#c3c6d0]/40 flex flex-col gap-3 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#002547]">Pregunta #{pIdx + 1}</span>
                        {preguntas.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleEliminarPregunta(pIdx)}
                            className="text-red-600 hover:text-red-800 text-xs font-bold"
                          >
                            Eliminar Pregunta
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={p.enunciado}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPreguntas((prev) =>
                            prev.map((item, idx) => (idx === pIdx ? { ...item, enunciado: val } : item))
                          );
                        }}
                        placeholder="Escribe el enunciado de la pregunta..."
                        className="w-full p-2.5 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-indigo-600 font-medium"
                      />

                      <div className="flex flex-col gap-2.5 pt-3 border-t border-[#c3c6d0]/20">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-[#737780] uppercase">
                            Alternativas (Selecciona la Correcta)
                          </span>

                          {p.alternativas.length < 5 && (
                            <button
                              type="button"
                              onClick={() => handleAgregarAlternativa(pIdx)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                            >
                              <span className="material-symbols-outlined text-sm">add</span>
                              Añadir Opción ({p.alternativas.length}/5)
                            </button>
                          )}
                        </div>

                        {p.alternativas.map((alt, aIdx) => (
                          <div key={aIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correcta_${pIdx}`}
                              checked={alt.es_correcta}
                              onChange={() => handleMarcarCorrecta(pIdx, aIdx)}
                              className="w-4 h-4 text-indigo-600 cursor-pointer shrink-0"
                            />
                            <input
                              type="text"
                              value={alt.texto_alternativa}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPreguntas((prev) =>
                                  prev.map((item, idx) => {
                                    if (idx !== pIdx) return item;
                                    return {
                                      ...item,
                                      alternativas: item.alternativas.map((a, i) =>
                                        i === aIdx ? { ...a, texto_alternativa: val } : a
                                      ),
                                    };
                                  })
                                );
                              }}
                              placeholder={`Opción ${aIdx + 1}`}
                              className="flex-1 p-2 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-indigo-600"
                            />
                            {p.alternativas.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleEliminarAlternativa(pIdx, aIdx)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Eliminar opción"
                              >
                                <span className="material-symbols-outlined text-base">close</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#c3c6d0]/30">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isPending}
                    className="px-4 py-2 border border-[#c3c6d0] rounded-lg font-bold text-[#42474f] hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                  >
                    {isPending
                      ? 'Guardando...'
                      : evaluacionEditar
                      ? 'Guardar Cambios'
                      : 'Guardar Evaluación'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}