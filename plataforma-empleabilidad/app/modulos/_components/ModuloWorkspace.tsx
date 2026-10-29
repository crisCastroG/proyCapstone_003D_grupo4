"use client";

import { useEffect, useState } from "react";
import {
  CURRICULUM_UPDATED_EVENT,
  DEFAULT_CURRICULUM,
  loadCurriculum,
  type Curriculum,
} from "../../../lib/curriculum";

type ModuloWorkspaceProps = {
  mode?: "learner" | "admin";
};

export default function ModuloWorkSpace({ mode = "learner" }: ModuloWorkspaceProps) {
  const [curriculum, setCurriculum] = useState<Curriculum>(DEFAULT_CURRICULUM);

  useEffect(() => {
    const syncCurriculum = () => setCurriculum(loadCurriculum());

    syncCurriculum();
    window.addEventListener("storage", syncCurriculum);
    window.addEventListener(CURRICULUM_UPDATED_EVENT, syncCurriculum);

    return () => {
      window.removeEventListener("storage", syncCurriculum);
      window.removeEventListener(CURRICULUM_UPDATED_EVENT, syncCurriculum);
    };
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(13,59,102,0.05)] border border-[#c3c6d0]/30">
        <div>
          <h1 className="text-2xl font-extrabold text-[#002547] tracking-tight mb-1">
            ¡Hola, Alejandro! 👋
          </h1>
          <p className="text-sm font-medium text-[#42474f]">
            Estás en un buen momento para impulsar tu carrera. Continúa con tu ruta de aprendizaje.
          </p>
        </div>
        <div className="w-full md:w-1/3 flex flex-col gap-2 min-w-[250px]">
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold text-[#002547]">Progreso General</span>
            <span className="text-xs font-extrabold text-[#44c5fd]">25%</span>
          </div>
          <div className="w-full h-2 bg-[#E6F2FB] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#38BDF5] to-[#2566A8] w-1/4 rounded-full"></div>
          </div>
          <span className="text-[11px] font-medium text-[#42474f] text-right">1 de 4 módulos completados</span>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-[#002547] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#44c5fd]">route</span>
            Mi Ruta de Aprendizaje
          </h2>

          <div className="flex flex-col gap-3">
            <article className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(13,59,102,0.05)] border border-[#E6F2FB] flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-transform hover:-translate-y-0.5 hover:shadow-[0px_8px_30px_rgba(13,59,102,0.10)] duration-200">
              <div className="w-12 h-12 rounded-full bg-[#E6F2FB]/50 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#006689] font-bold">check_circle</span>
              </div>
              <div className="flex-grow">
                <span className="inline-block px-3 py-0.5 rounded-full bg-[#E6F2FB] text-[#006689] text-xs font-semibold mb-1.5">
                  Completado
                </span>
                <h3 className="text-base font-bold text-[#002547] mb-1">
                  1. Autoconocimiento y Objetivo Laboral
                </h3>
                <p className="text-sm text-[#42474f]">
                  Identifica tus fortalezas y define hacia dónde quieres dirigir tu carrera profesional.
                </p>
              </div>
              <button className="mt-3 sm:mt-0 px-4 py-2 text-[#006689] font-semibold text-xs border border-[#c3c6d0] rounded-lg hover:bg-[#f1f4f6] transition-colors whitespace-nowrap">
                Revisar Material
              </button>
            </article>

            <article className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(13,59,102,0.05)] border-l-4 border-l-[#0d3b66] border-t border-r border-b border-[#E6F2FB] flex flex-col sm:flex-row items-start sm:items-center gap-4 relative overflow-hidden transition-transform hover:-translate-y-0.5 hover:shadow-[0px_8px_30px_rgba(13,59,102,0.10)] duration-200">
              <div className="w-12 h-12 rounded-full bg-[#E6F2FB] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#44c5fd] font-bold">play_circle</span>
              </div>
              <div className="flex-grow">
                <span className="inline-block px-3 py-0.5 rounded-full bg-[#38BDF5]/10 text-[#004f6b] text-xs font-semibold mb-1.5 border border-[#38BDF5]/20">
                  En curso
                </span>
                <h3 className="text-base font-bold text-[#002547] mb-1">
                  2. Currículum de Alto Impacto
                </h3>
                <p className="text-sm text-[#42474f]">
                  Aprende a estructurar un CV que capte la atención de los reclutadores desde el primer segundo.
                </p>
              </div>
              <button className="mt-3 sm:mt-0 px-5 py-2 bg-[#44c5fd] text-[#001e2c] font-bold text-xs rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap shadow-sm">
                Continuar
              </button>
            </article>

            <article className="bg-[#f1f4f6] rounded-xl p-6 border border-[#c3c6d0]/30 flex flex-col sm:flex-row items-start sm:items-center gap-4 opacity-75">
              <div className="w-12 h-12 rounded-full bg-[#e0e3e5] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#737780]">lock</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-base font-bold text-[#42474f] mb-1">
                  3. Estrategias de Búsqueda y LinkedIn
                </h3>
                <p className="text-sm text-[#737780]">
                  Optimiza tu perfil digital y descubre cómo acceder al mercado laboral oculto.
                </p>
              </div>
              <span className="text-xs text-[#737780] hidden sm:block">
                Desbloquea al completar el Módulo 2
              </span>
            </article>


            <article className="bg-[#f1f4f6] rounded-xl p-6 border border-[#c3c6d0]/30 flex flex-col sm:flex-row items-start sm:items-center gap-4 opacity-75">
              <div className="w-12 h-12 rounded-full bg-[#e0e3e5] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#737780]">lock</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-base font-bold text-[#42474f] mb-1">
                  4. Entrevistas Exitosas
                </h3>
                <p className="text-sm text-[#737780]">
                  Prepárate para enfrentar entrevistas con confianza, estructurando tus respuestas efectivamente.
                </p>
              </div>
            </article>
          </div>
        </div>

        <aside className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-[#002547] to-[#0d3b66] rounded-xl p-6 shadow-[0px_4px_20px_rgba(13,59,102,0.05)] text-white relative overflow-hidden group cursor-pointer">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="absolute right-8 -bottom-8 w-24 h-24 rounded-full bg-[#44c5fd]/20 group-hover:scale-110 transition-transform duration-500 delay-100"></div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-white">assignment_ind</span>
                </div>
                <h3 className="text-lg font-bold mb-2">Perfil Profesional Digital</h3>
                <p className="text-xs text-white/80 mb-6">
                  Muestra tu mejor versión. Actualiza tus datos y portafolio para las asesorías.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#44c5fd] group-hover:text-white transition-colors">
                Ver y editar perfil
                <span className="material-symbols-outlined text-sm transform group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}