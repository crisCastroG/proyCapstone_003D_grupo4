'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SidebarNavegacion, { ModuloSidebar } from '../../_components/SidebarNavegacion';
import { procesarIntentoEvaluacionAction, EntregaRespuesta } from './actionsRendicion';

type Alternativa = {
  id_alternativa: number;
  texto_alternativa: string;
  orden: number;
};

type Pregunta = {
  id_pregunta: number;
  enunciado: string;
  puntaje: number;
  orden: number;
  alternativas: Alternativa[];
};

type Evaluacion = {
  id_evaluacion: number;
  titulo_evaluacion: string;
  descripcion_evaluacion?: string;
  duracion_minutos: number;
  porcentaje_minimo_aprobacion: number;
  modulo_id_modulo: number;
};

type ItemNav = {
  id: number;
  id_modulo: number;
  titulo: string;
  tipo: 'contenido' | 'evaluacion';
};

type Props = {
  usuarioId: number;
  evaluacionData: {
    evaluacion: Evaluacion;
    preguntas: Pregunta[];
    modulos: ModuloSidebar[];
    navegacion?: {
      anterior: ItemNav | null;
      siguiente: ItemNav | null;
    };
    resumenProgreso?: {
      porcentajeGlobal: number;
      totalItems: number;
      completadosItems: number;
    };
  };
};

export default function RendicionTestView({ usuarioId, evaluacionData }: Props) {
  const router = useRouter();
  const { evaluacion, preguntas, modulos, navegacion, resumenProgreso } = evaluacionData;

  // Estado para controlar si el estudiante inició formalmente el examen
  const [testIniciado, setTestIniciado] = useState<boolean>(false);

  const [respuestasSeleccionadas, setRespuestasSeleccionadas] = useState<Record<number, number>>({});
  const [tiempoRestante, setTiempoRestante] = useState(evaluacion.duracion_minutos * 60);
  const [resultadoFinal, setResultadoFinal] = useState<any | null>(null);
  const [errorSubmit, setErrorSubmit] = useState('');
  const [isPending, startTransition] = useTransition();

  // El temporizador se activa ÚNICAMENTE si testIniciado === true
  useEffect(() => {
    if (!testIniciado || resultadoFinal || tiempoRestante <= 0) return;

    const timer = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleEnviarTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testIniciado, tiempoRestante, resultadoFinal]);

  const formatTiempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const handleSeleccionarRespuesta = (idPregunta: number, idAlternativa: number) => {
    if (resultadoFinal) return;
    setRespuestasSeleccionadas((prev) => ({
      ...prev,
      [idPregunta]: idAlternativa,
    }));
  };

  const handleEnviarTest = () => {
    setErrorSubmit('');

    const payloadRespuestas: EntregaRespuesta[] = Object.entries(respuestasSeleccionadas).map(
      ([idPregunta, idAlternativa]) => ({
        id_pregunta: Number(idPregunta),
        id_alternativa_seleccionada: Number(idAlternativa),
      })
    );

    startTransition(async () => {
      const res = await procesarIntentoEvaluacionAction(
        usuarioId,
        evaluacion.id_evaluacion,
        payloadRespuestas
      );

      if (res.success) {
        setResultadoFinal(res.resultado);
      } else {
        setErrorSubmit(res.message || 'Ocurrió un error al entregar la evaluación.');
      }
    });
  };

  const handleReintentar = () => {
    setResultadoFinal(null);
    setRespuestasSeleccionadas({});
    setTiempoRestante(evaluacion.duracion_minutos * 60);
    setTestIniciado(false); // Regresa a la pantalla de presentación antes de iniciar otro intento
  };

  const handleAvanzarSiguiente = () => {
    if (navegacion?.siguiente) {
      const url =
        navegacion.siguiente.tipo === 'evaluacion'
          ? `/modulos/evaluaciones/${navegacion.siguiente.id}`
          : `/modulos/${navegacion.siguiente.id_modulo}/contenido/${navegacion.siguiente.id}`;
      router.push(url);
    } else {
      router.push('/modulos');
    }
  };

  const totalPreguntas = preguntas.length;
  const respondidasCount = Object.keys(respuestasSeleccionadas).length;

  return (
    <div className="flex flex-col md:flex-row gap-8 -mt-2">
      <SidebarNavegacion
        modulos={modulos}
        progresoGlobal={resumenProgreso?.porcentajeGlobal || 0}
        totalItems={resumenProgreso?.totalItems || 0}
        completadosItems={resumenProgreso?.completadosItems || 0}
        idActivo={evaluacion.id_evaluacion}
        tipoActivo="evaluacion"
      />

      <main className="flex-1 flex flex-col gap-6 relative">
        {!testIniciado ? (
          /* VISTA INICIAL: INSTRUCCIONES DEL TEST ANTES DE EMPEZAR EL CONTEO */
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 md:p-8 shadow-xs flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
              <div className="w-12 h-12 rounded-xl bg-[#E6F2FB] text-[#0D3B66] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">quiz</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#E6F2FB] text-[#0D3B66]">
                  EVALUACIÓN DE CONOCIMIENTOS
                </span>
                <h1 className="text-xl font-extrabold text-[#0D3B66] mt-1">
                  {evaluacion.titulo_evaluacion}
                </h1>
              </div>
            </div>

            {evaluacion.descripcion_evaluacion && (
              <p className="text-xs text-[#42474F] leading-relaxed">
                {evaluacion.descripcion_evaluacion}
              </p>
            )}

            {/* TARJETAS RESUMEN DE PARÁMETROS DEL TEST */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#F7FAFC] rounded-xl border border-[#E2E8F0] flex items-center gap-3">
                <span className="material-symbols-outlined text-[#2566A8] text-2xl">format_list_bulleted</span>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#737780] block">
                    N° de Preguntas
                  </span>
                  <span className="text-sm font-extrabold text-[#0D3B66]">
                    {totalPreguntas} preguntas
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#F7FAFC] rounded-xl border border-[#E2E8F0] flex items-center gap-3">
                <span className="material-symbols-outlined text-[#2566A8] text-2xl">timer</span>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#737780] block">
                    Tiempo Disponible
                  </span>
                  <span className="text-sm font-extrabold text-[#0D3B66]">
                    {evaluacion.duracion_minutos} minutos
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#F7FAFC] rounded-xl border border-[#E2E8F0] flex items-center gap-3">
                <span className="material-symbols-outlined text-[#2566A8] text-2xl">verified</span>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#737780] block">
                    Exigencia Mínima
                  </span>
                  <span className="text-sm font-extrabold text-[#0D3B66]">
                    {Number(evaluacion.porcentaje_minimo_aprobacion).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* AVISO IMPORTANTE SOBRE MÁXIMO PUNTAJE */}
            <div className="p-4 bg-[#E6F2FB] border border-[#38BDF5]/40 rounded-xl flex items-start gap-3">
              <span className="material-symbols-outlined text-[#2566A8] text-xl shrink-0 mt-0.5">
                info
              </span>
              <div className="text-xs text-[#0D3B66] leading-relaxed">
                <strong className="font-bold">Información de intentos:</strong> Si ya realizaste este test anteriormente, el sistema conservará automáticamente el resultado del intento que obtenga la <span className="font-bold underline">mayor puntuación</span>.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setTestIniciado(true)}
                className="px-6 py-3 bg-[#0D3B66] hover:bg-[#2566A8] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 shadow-xs"
              >
                <span>Comenzar Test</span>
                <span className="material-symbols-outlined text-base">play_arrow</span>
              </button>
            </div>
          </div>
        ) : (
          /* VISTA DEL TEST EN CURSO (CON CONTEO Y PREGUNTAS VISIBLES) */
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#E6F2FB] text-[#0D3B66]">
                    EVALUACIÓN EN CURSO
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-[#0D3B66]">{evaluacion.titulo_evaluacion}</h1>
                {evaluacion.descripcion_evaluacion && (
                  <p className="text-sm text-[#42474F] mt-1">{evaluacion.descripcion_evaluacion}</p>
                )}
              </div>

              <div className="flex items-center gap-2.5 bg-[#E6F2FB] px-3.5 py-2 rounded-xl border border-[#38BDF5]/40 shrink-0 self-start sm:self-center">
                <span className="material-symbols-outlined text-[#2566A8] text-lg">schedule</span>
                <span className="font-mono text-sm font-bold text-[#0D3B66]">
                  {formatTiempo(tiempoRestante)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {errorSubmit && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  {errorSubmit}
                </div>
              )}

              {preguntas.map((preg, index) => (
                <div
                  key={preg.id_pregunta}
                  className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col gap-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-md bg-[#E6F2FB] text-[#0D3B66] font-extrabold text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <h3 className="text-sm font-bold text-[#0D3B66] leading-snug mt-0.5">
                      {preg.enunciado}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-2.5 pl-0 md:pl-10">
                    {preg.alternativas.map((alt) => {
                      const seleccionada = respuestasSeleccionadas[preg.id_pregunta] === alt.id_alternativa;

                      return (
                        <button
                          key={alt.id_alternativa}
                          type="button"
                          onClick={() => handleSeleccionarRespuesta(preg.id_pregunta, alt.id_alternativa)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-3 ${
                            seleccionada
                              ? 'bg-[#E6F2FB] border-[#2566A8] text-[#0D3B66] shadow-xs font-bold'
                              : 'bg-white border-[#E2E8F0] text-[#42474f] hover:border-[#38BDF5] hover:bg-[#F7FAFC]'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              seleccionada ? 'border-[#2566A8] bg-[#2566A8]' : 'border-gray-300'
                            }`}
                          >
                            {seleccionada && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <span>{alt.texto_alternativa}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <footer className="mt-4 pt-5 border-t border-[#E2E8F0] flex items-center justify-between gap-4">
                <span className="text-xs text-[#737780] font-medium">
                  Respondidas: {respondidasCount} de {totalPreguntas}
                </span>

                <button
                  type="button"
                  onClick={handleEnviarTest}
                  disabled={isPending || respondidasCount === 0}
                  className="px-6 py-2.5 bg-[#0D3B66] hover:bg-[#2566A8] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-xs"
                >
                  {isPending ? 'Entregando...' : 'Entregar Evaluación'}
                </button>
              </footer>
            </div>
          </>
        )}

        {/* MODAL DE RESULTADO FINAL */}
        {resultadoFinal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-[#E2E8F0] flex flex-col items-center gap-5 text-center animate-in fade-in zoom-in-95 duration-200">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  resultadoFinal.aprobado ? 'bg-[#E6F2FB] text-[#0D3B66]' : 'bg-rose-100 text-rose-600'
                }`}
              >
                <span className="material-symbols-outlined text-3xl">
                  {resultadoFinal.aprobado ? 'check_circle' : 'cancel'}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-[#0D3B66]">
                  {resultadoFinal.aprobado ? '¡Evaluación Aprobada!' : 'Evaluación No Aprobada'}
                </h2>
                <p className="text-xs text-[#737780] mt-1">
                  Intento #{resultadoFinal.numeroIntento} evaluado
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full bg-[#F7FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <div>
                  <span className="text-[10px] font-bold text-[#737780] uppercase block">
                    Porcentaje Logrado
                  </span>
                  <span
                    className={`text-2xl font-extrabold ${
                      resultadoFinal.aprobado ? 'text-[#2566A8]' : 'text-rose-600'
                    }`}
                  >
                    {resultadoFinal.porcentajeLogrado}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#737780] uppercase block">
                    Exigencia Mínima
                  </span>
                  <span className="text-2xl font-extrabold text-[#0D3B66]">
                    {evaluacion.porcentaje_minimo_aprobacion}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#42474f]">
                Puntaje obtenido: <strong>{resultadoFinal.puntajeObtenido}</strong> /{' '}
                <strong>{resultadoFinal.puntajeTotalPosible}</strong> pts.
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5 w-full pt-2">
                {resultadoFinal.aprobado ? (
                  <>
                    <button
                      type="button"
                      onClick={handleReintentar}
                      className="flex-1 px-4 py-2.5 border border-[#E2E8F0] text-[#0D3B66] rounded-xl text-xs font-bold hover:bg-[#F7FAFC] transition-colors"
                    >
                      Reintentar Test
                    </button>
                    <button
                      type="button"
                      onClick={handleAvanzarSiguiente}
                      className="flex-1 px-4 py-2.5 bg-[#0D3B66] hover:bg-[#2566A8] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>Siguiente Lección</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleReintentar}
                      className="flex-1 px-4 py-2.5 bg-[#0D3B66] hover:bg-[#2566A8] text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Reintentar Test
                    </button>
                    <Link
                      href="/modulos"
                      className="flex-1 px-4 py-2.5 border border-[#E2E8F0] text-[#0D3B66] rounded-xl text-xs font-bold hover:bg-[#F7FAFC] transition-colors flex items-center justify-center"
                    >
                      Volver a Módulos
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}