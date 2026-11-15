'use client';

import { useEffect, useState } from 'react';

export default function AvatarIniciales() {
  const [iniciales, setIniciales] = useState<string>('U');

  useEffect(() => {
    async function cargarIniciales() {
      try {
        const res = await fetch('/api/modulos');
        if (!res.ok) return;

        const data = await res.json();
        const usuario = data.usuario;
        if (!usuario) return;

        const primerNombre = (usuario.nombre || '').trim().split(' ')[0] || '';
        const primerApellido = (
          usuario.apellido_paterno ||
          usuario.apellidoPaterno ||
          ''
        )
          .trim()
          .split(' ')[0];

        const resultado = `${primerNombre[0] || ''}${primerApellido[0] || ''}`.toUpperCase();
        if (resultado) {
          setIniciales(resultado);
        }
      } catch {
      }
    }

    cargarIniciales();
  }, []);

  return (
    <div className="w-full h-full bg-[#002546] text-white flex items-center justify-center font-bold text-sm">
      {iniciales}
    </div>
  );
}