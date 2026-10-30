import Link from 'next/link';
import { notFound } from 'next/navigation';
import ListaBloques from './ListaBloques';
import { getBloquesPorContenido, getContenidoPorId } from './actions';

type PageProps = {
  params: Promise<{
    id_modulo: string;
    id_contenido: string;
  }>;
};

export default async function EditorBloquesPage({ params }: PageProps) {
  const { id_modulo, id_contenido } = await params;
  const idModuloNum = parseInt(id_modulo, 10);
  const idContenidoNum = parseInt(id_contenido, 10);

  if (isNaN(idModuloNum) || isNaN(idContenidoNum)) {
    notFound();
  }

  const [contenido, bloques] = await Promise.all([
    getContenidoPorId(idContenidoNum),
    getBloquesPorContenido(idContenidoNum),
  ]);

  if (!contenido) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between border-b border-[#c3c6d0]/30 pb-4">
        <div className="flex items-center gap-2 text-xs text-[#737780]">
          <Link href="/admin/modulos" className="hover:text-[#006689] font-medium">
            Gestión de Módulos
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#002547]">Módulo #{idModuloNum}</span>
          <span>/</span>
          <span className="font-semibold text-[#006689]">{contenido.titulo_contenido}</span>
        </div>

        <Link
          href="/admin/modulos"
          className="px-3 py-1.5 border border-[#c3c6d0] rounded-lg text-xs font-bold text-[#42474f] hover:bg-gray-50 flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Volver a Módulos
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[#c3c6d0]/30 p-6 shadow-sm">
        <span className="text-xs font-bold text-[#006689] uppercase tracking-wider">
          Editor de Contenido
        </span>
        <h1 className="text-2xl font-extrabold text-[#002547] mt-1">
          {contenido.titulo_contenido}
        </h1>
        {contenido.descripcion_contenido && (
          <p className="text-xs text-[#42474f] mt-1">
            {contenido.descripcion_contenido}
          </p>
        )}
      </div>

      <ListaBloques
        bloques={bloques}
        idModulo={idModuloNum}
        idContenido={idContenidoNum}
      />
    </div>
  );
}