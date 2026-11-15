import { notFound, redirect } from 'next/navigation';
import { obtenerSesionActual } from '@/lib/auth';
import { getTestParaRendir } from './actionsRendicion';
import RendicionTestView from './RendicionTestView';

type PageProps = {
  params: Promise<{ idEvaluacion: string }> | { idEvaluacion: string };
};

export default async function Page({ params }: PageProps) {
  const sesion = await obtenerSesionActual();
  if (!sesion) {
    redirect('/login');
  }

  const resolvedParams = await params;
  const idRaw = resolvedParams?.idEvaluacion;
  const id = parseInt(idRaw, 10);

  if (!idRaw || isNaN(id)) {
    notFound();
  }

  const testData = await getTestParaRendir(id, sesion.id_usuario);

  if (!testData) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-xl border border-[#c3c6d0]/30 text-center shadow-sm">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="material-symbols-outlined text-2xl">error</span>
        </div>
        <h2 className="text-base font-bold text-[#002547]">Evaluación no disponible</h2>
        <p className="text-xs text-[#737780] mt-1">
          La evaluación #{id} no existe o no se encuentra publicada actualmente.
        </p>
      </div>
    );
  }

  return (
    <RendicionTestView
      usuarioId={sesion.id_usuario}
      evaluacionData={testData}
    />
  );
}