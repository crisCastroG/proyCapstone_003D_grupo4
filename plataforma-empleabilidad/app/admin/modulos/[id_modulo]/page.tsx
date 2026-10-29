import Link from 'next/link';
import { query } from '@/lib/db';
import FormularioContenidoModal from '../FormularioContenidoModal';
import { eliminarContenidoAction } from './actions';

type PageProps = {
  params: Promise<{ id_modulo: string }>;
};

async function getModulo(id: number) {
  const res = await query('SELECT * FROM modulo WHERE id_modulo = $1', [id]);
  return res.rows[0];
}

async function getContenidos(idModulo: number) {
  // Se usa exactamente modulo_id_modulo y orden_contenido
  const res = await query(
    'SELECT * FROM contenido WHERE modulo_id_modulo = $1 ORDER BY orden_contenido ASC',
    [idModulo]
  );
  return res.rows;
}

export default async function DetalleModuloAdminPage({ params }: PageProps) {
  const { id_modulo } = await params;
  const moduloId = parseInt(id_modulo, 10);

  const modulo = await getModulo(moduloId);
  const contenidos = await getContenidos(moduloId);

  if (!modulo) {
    return (
      <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-red-700 font-semibold">
        Módulo no encontrado.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/modulos"
        className="inline-flex items-center gap-1 text-xs font-bold text-[#006689] hover:underline"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Volver a Módulos
      </Link>

      <div className="bg-white p-6 rounded-xl border border-[#c3c6d0]/30 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-[#006689] uppercase tracking-wider">
            Administración de Lecciones
          </span>
          <h1 className="text-2xl font-extrabold text-[#002547] mt-1">{modulo.titulo_modulo}</h1>
          <p className="text-sm text-[#42474f] mt-1">{modulo.descripcion_modulo}</p>
        </div>

        <FormularioContenidoModal
          idModulo={moduloId}
          siguienteOrden={contenidos.length + 1}
        />
      </div>

      <div className="bg-white p-6 rounded-xl border border-[#c3c6d0]/30 shadow-sm">
        <h2 className="text-base font-bold text-[#002547] mb-4">
          Contenidos Registrados ({contenidos.length})
        </h2>

        {contenidos.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-[#c3c6d0]/40 rounded-xl">
            <span className="material-symbols-outlined text-4xl text-[#737780] mb-2">
              video_library
            </span>
            <p className="text-sm font-bold text-[#42474f]">No se han agregado contenidos a este módulo.</p>
            <p className="text-xs text-[#737780] mt-1">
              Presiona &quot;Nuevo Contenido&quot; para incorporar lecciones.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {contenidos.map((item: any) => {
              const eliminarAccionConId = eliminarContenidoAction.bind(
                null,
                item.id_contenido,
                moduloId
              );

              return (
                <div
                  key={item.id_contenido}
                  className="flex items-center justify-between p-4 rounded-xl border border-[#c3c6d0]/30 bg-[#f7fafc]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#002547] text-white flex items-center justify-center font-bold text-xs">
                      {item.orden_contenido}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#002547]">{item.titulo_contenido}</h3>
                      <p className="text-xs text-[#42474f]">{item.descripcion_contenido}</p>
                      <div className="flex items-center gap-2 text-xs text-[#737780] mt-1">
                        <span>Duración: {item.duracion_estimada} min</span>
                        <span>•</span>
                        <span className="capitalize font-semibold text-[#006689]">{item.estado_contenido}</span>
                      </div>
                    </div>
                  </div>

                  <form action={eliminarAccionConId}>
                    <button
                      type="submit"
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}