'use client';

import { useState, useEffect } from 'react';
import { guardarFormularioLeccionAction, obtenerAdministradoresAction } from './actions';

type AdminUser = {
    id_usuario: number;
    nombre: string;
    apellido_paterno: string;
    correo: string;
    nombre_rol: string;
};

type Props = {
    idModulo: number;
    idContenido: number;
    formularioExistente: any;
};

export default function FormularioContactoModal({
    idModulo,
    idContenido,
    formularioExistente,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [administradores, setAdministradores] = useState<AdminUser[]>([]);
    const [cargandoAdmins, setCargandoAdmins] = useState(false);
    const [idAdmin, setIdAdmin] = useState(formularioExistente?.usuario_id_admin || '');
    const [titulo, setTitulo] = useState(formularioExistente?.titulo_formulario || 'Envíanos tu consulta');
    const [descripcion, setDescripcion] = useState(formularioExistente?.descripcion_formulario || '');
    const [error, setError] = useState('');

    useEffect(() => {
        if (formularioExistente) {
            setIdAdmin(formularioExistente.usuario_id_admin || '');
            setTitulo(formularioExistente.titulo_formulario || 'Envíanos tu consulta');
            setDescripcion(formularioExistente.descripcion_formulario || '');
        }
    }, [formularioExistente]);

    useEffect(() => {
        if (isOpen) {
            setCargandoAdmins(true);
            obtenerAdministradoresAction()
                .then((res) => {
                    if (res.success && res.administradores) {
                        setAdministradores(res.administradores);
                    }
                })
                .finally(() => setCargandoAdmins(false));
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!idAdmin) {
            setError('Debes seleccionar un administrador destinatario.');
            return;
        }
        setCargando(true);
        setError('');

        const formData = new FormData();
        formData.append('id_modulo', idModulo.toString());
        formData.append('contenido_id_contenido', idContenido.toString());
        formData.append('usuario_id_admin', idAdmin.toString());
        formData.append('titulo_formulario', titulo);
        formData.append('descripcion_formulario', descripcion);

        const res = await guardarFormularioLeccionAction(formData);
        setCargando(false);

        if (res.success) {
            setIsOpen(false);
        } else {
            setError(res.message || 'Ocurrió un error al guardar el formulario.');
        }
    };

    return (
        <>
            {formularioExistente ? (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                    title="Editar destinatario del formulario"
                >
                    <span className="material-symbols-outlined text-base">mail</span>
                    Editar Formulario
                </button>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                    <span className="material-symbols-outlined text-base">add</span>
                    Agregar Formulario
                </button>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl border border-[#c3c6d0]/40 w-full max-w-md p-6 flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-[#c3c6d0]/30 pb-3">
                            <h3 className="text-base font-bold text-[#002547]">
                                {formularioExistente ? 'Editar Formulario de Contacto' : 'Agregar Formulario de Contacto'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="text-[#737780] hover:text-[#002547]"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-semibold">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
                            <div>
                                <label className="block font-bold text-[#002547] uppercase mb-1">
                                    Título del Formulario
                                </label>
                                <input
                                    type="text"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    placeholder="Ej. Envíanos tu consulta al Tutor"
                                    className="w-full p-2.5 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-indigo-600"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-[#002547] uppercase mb-1">
                                    Descripción u Instrucción (Opcional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    placeholder="Ej. Si tienes dudas sobre esta lección, escríbenos directamente..."
                                    className="w-full p-2.5 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-indigo-600"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-[#002547] uppercase mb-1">
                                    Administrador / Superadmin Destinatario *
                                </label>
                                <select
                                    required
                                    value={idAdmin}
                                    onChange={(e) => setIdAdmin(e.target.value)}
                                    className="w-full p-2.5 border border-[#c3c6d0] rounded-lg focus:outline-none focus:border-indigo-600 bg-white font-medium"
                                >
                                    <option value="">
                                        {cargandoAdmins ? 'Cargando administradores...' : '-- Selecciona Destinatario --'}
                                    </option>
                                    {administradores.map((admin) => (
                                        <option key={admin.id_usuario} value={admin.id_usuario}>
                                            {admin.nombre} {admin.apellido_paterno} - {admin.nombre_rol} - {admin.correo}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg text-[11px] text-indigo-900 leading-relaxed">
                                Este formulario aparecerá <strong>siempre al final de la lección</strong> para los estudiantes. Solo se permite 1 formulario por lección.
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-[#c3c6d0]/30">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    disabled={cargando}
                                    className="px-4 py-2 border border-[#c3c6d0] rounded-lg font-bold text-[#42474f] hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={cargando}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                                >
                                    {cargando ? 'Guardando...' : 'Guardar Formulario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}