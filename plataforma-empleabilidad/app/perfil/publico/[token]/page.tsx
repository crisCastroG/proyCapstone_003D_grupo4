import { Metadata } from 'next';
import { obtenerPerfilPublicoPorTokenAction } from '../../actions';

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const res = await obtenerPerfilPublicoPorTokenAction(token);

  if (!res.success || !res.perfil) {
    return { title: 'Perfil No Encontrado' };
  }

  return {
    title: `Perfil Profesional - ${res.perfil.nombre} ${res.perfil.apellido_paterno}`,
    description: res.perfil.resumen || 'Perfil profesional digital verificado.',
  };
}

export default async function PerfilPublicoPage({ params }: Props) {
  const { token } = await params;
  const res = await obtenerPerfilPublicoPorTokenAction(token);

  if (!res.success || !res.perfil) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#E6F2FB] text-[#0D3B66] flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl">person_off</span>
        </div>
        <h1 className="text-xl font-bold text-[#0D3B66] mb-2">Perfil No Disponible</h1>
        <p className="text-xs text-[#737780] max-w-sm">
          {res.message || 'El enlace provisto es inválido o el perfil no se encuentra público.'}
        </p>
      </div>
    );
  }

  const perfil = res.perfil;
  const logrosModulos = res.logrosModulos || [];

  return (
    <div className="min-h-screen bg-[#F7FAFC] py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 md:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            {perfil.foto ? (
              <img
                src={perfil.foto}
                alt={`Foto de ${perfil.nombre}`}
                className="w-20 h-20 rounded-full object-cover border-2 border-[#38BDF5]/50 shadow-xs shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#0D3B66] text-white font-black text-3xl flex items-center justify-center shrink-0 shadow-xs">
                {perfil.nombre?.[0]}
                {perfil.apellido_paterno?.[0]}
              </div>
            )}

            <div>
              <h1 className="text-2xl font-extrabold text-[#0D3B66]">
                {perfil.nombre} {perfil.apellido_paterno} {perfil.apellido_materno || ''}
              </h1>

              <p className="text-sm font-bold text-[#2566A8] mt-0.5">
                {perfil.profesion || 'Profesional'} {perfil.area_trabajo ? `• Área: ${perfil.area_trabajo}` : ''}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#737780] mt-2.5">
                {perfil.ciudad && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#2566A8]">location_on</span>
                    {perfil.ciudad}{perfil.region ? `, ${perfil.region}` : ''}
                  </span>
                )}
                {perfil.correo && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#2566A8]">mail</span>
                    {perfil.correo}
                  </span>
                )}
                {perfil.telefono && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#2566A8]">call</span>
                    {perfil.telefono}
                  </span>
                )}
              </div>
            </div>
          </div>

          {perfil.link_linkedin && (
            <div className="self-end md:self-center shrink-0">
              <a
                href={perfil.link_linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#2566A8] hover:bg-[#0D3B66] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                LinkedIn
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#0D3B66] uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[#38BDF5] text-lg">description</span>
              Resumen Profesional
            </h3>
            <p className="text-xs text-[#42474f] leading-relaxed whitespace-pre-line">
              {perfil.resumen || 'El usuario aún no ha ingresado una descripción profesional.'}
            </p>
          </div>

          <div className="md:col-span-4 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#0D3B66] uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[#38BDF5] text-lg">psychology</span>
              Habilidades Clave
            </h3>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {perfil.habilidades && perfil.habilidades.length > 0 ? (
                perfil.habilidades.map((h: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-[#E6F2FB] border border-[#38BDF5]/30 text-[#0D3B66] rounded-md font-bold text-[11px]"
                  >
                    {h}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#737780] italic">No registradas.</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col gap-4">
          <h3 className="text-sm font-bold text-[#0D3B66] uppercase tracking-wider flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
            <span className="material-symbols-outlined text-[#38BDF5] text-lg">verified</span>
            Formación Acreditada
          </h3>

          <div className="flex flex-col gap-2.5">
            {logrosModulos.length > 0 ? (
              logrosModulos.map((m: any) => (
                <div
                  key={m.id_modulo}
                  className="p-3.5 bg-[#F7FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#38BDF5] text-lg">check_circle</span>
                    <span className="text-xs font-bold text-[#0D3B66]">
                      Módulo {m.posicion_modulo}: {m.titulo_modulo}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-[#E6F2FB] text-[#0D3B66]">
                    Completado
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#737780] italic">No hay módulos registrados en la plataforma.</p>
            )}
          </div>
        </div>

        <footer className="text-center py-4 border-t border-[#E2E8F0] mt-2">
          <p className="text-[11px] text-[#737780]">
            Documento digital acreditado y emitido mediante el sistema de formación Empleamás.
          </p>
        </footer>

      </div>
    </div>
  );
}