import { query } from '@/lib/db';
import FormularioModulo from './FormularioModulo';
import ListaModulos from './ListaModulos';

async function getModulosConContenidos() {
    // Consulta la tabla modulo y la tabla contenido con las columnas exactas
    const resModulos = await query(
        'SELECT * FROM modulo ORDER BY posicion_modulo ASC, id_modulo ASC'
    );
    const modulos = resModulos.rows;

    const resContenidos = await query(
        'SELECT * FROM contenido ORDER BY orden_contenido ASC'
    );
    const contenidos = resContenidos.rows;

    // Agrupa los contenidos dentro de su correspondiente módulo
    return modulos.map((mod: any) => ({
        ...mod,
        contenidos: contenidos.filter((c: any) => c.modulo_id_modulo === mod.id_modulo),
    }));
}

export default async function Page() {
    const modulos = await getModulosConContenidos();

    return (
        <div className="flex flex-col gap-6">
            {/* Encabezado Principal */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-[#c3c6d0]/30 shadow-sm">
                <div>
                    <span className="text-xs font-bold text-[#006689] uppercase tracking-wider">
                        Panel de Administración
                    </span>
                    <h1 className="text-2xl font-extrabold text-[#002547] tracking-tight">
                        Gestión de Módulos y Contenidos
                    </h1>
                    <p className="text-sm font-medium text-[#42474f] mt-1">
                        Haz clic en un módulo para desplegar y administrar sus contenidos.
                    </p>
                </div>

                {/* Modal/Botón para crear un nuevo módulo */}
                <FormularioModulo                />
            </div>

            {/* Lista Desplegable (Acordeón) */}
            <ListaModulos modulos={modulos} />
        </div>
    );
}