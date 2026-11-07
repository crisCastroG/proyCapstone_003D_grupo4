import { query } from '@/lib/db';
import FormularioModulo from './FormularioModulo';
import ListaModulos from './ListaModulos';

async function getModulosConTodo() {
  // 1. Obtener todos los módulos
  const resModulos = await query(
    'SELECT * FROM modulo ORDER BY posicion_modulo ASC, id_modulo ASC'
  );
  const modulos = resModulos.rows;

  // 2. Obtener todos los contenidos (lecciones)
  const resContenidos = await query(
    'SELECT * FROM contenido ORDER BY orden_contenido ASC'
  );
  const contenidos = resContenidos.rows;

  // 3. Obtener todas las evaluaciones (tests)
  const resEvaluaciones = await query(
    'SELECT * FROM evaluacion ORDER BY orden_evaluacion ASC'
  );
  const evaluaciones = resEvaluaciones.rows;

  // 4. Agrupar lecciones y evaluaciones en sus respectivos módulos
  return modulos.map((mod: any) => ({
    ...mod,
    contenidos: contenidos.filter((c: any) => c.modulo_id_modulo === mod.id_modulo),
    evaluaciones: evaluaciones.filter((e: any) => e.modulo_id_modulo === mod.id_modulo),
  }));
}

export default async function Page() {
  const modulos = await getModulosConTodo();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-[#c3c6d0]/30 shadow-sm">
        <div>
          <span className="text-xs font-bold text-[#006689] uppercase tracking-wider">
            Panel de Administración
          </span>
          <h1 className="text-2xl font-extrabold text-[#002547] tracking-tight">
            Gestión de Módulos, Contenidos y Evaluaciones
          </h1>
          <p className="text-sm font-medium text-[#42474f] mt-1">
            Haz clic en un módulo para desplegar sus contenidos y configurar sus tests de alternativas.
          </p>
        </div>

        <FormularioModulo />
      </div>

      <ListaModulos modulos={modulos} />
    </div>
  );
}