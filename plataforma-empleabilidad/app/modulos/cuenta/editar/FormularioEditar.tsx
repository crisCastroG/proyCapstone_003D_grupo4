'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { normalizarTelefonoChile } from '@/lib/validators';

type Profesion = { id_profesion: number; nombre_profesion: string };
type Area = { id_area: number; nombre_area: string };
type Region = { id_region: number; nombre_region: string };
type Ciudad = { id_ciudad: number; nombre_ciudad: string; region_id_region: number };

const campo = 'border border-[#CBD5E1] rounded-lg px-3 py-2 font-normal text-sm w-full bg-white';
const bloqueado = 'border border-[#E2E8F0] rounded-lg px-3 py-2 font-normal text-sm w-full bg-[#F1F5F9] text-[#64748B]';

export default function FormularioEditar({
  run, correo, inicial, profesiones, areas, regiones, ciudades,
}: {
  run: string;
  correo: string;
  inicial: { telefono: string; profesionId: string; areaId: string; regionId: string; ciudadId: string };
  profesiones: Profesion[];
  areas: Area[];
  regiones: Region[];
  ciudades: Ciudad[];
}) {
  const router = useRouter();
  const [telefono, setTelefono] = useState(inicial.telefono);
  const [profesionId, setProfesionId] = useState(inicial.profesionId);
  const [areaId, setAreaId] = useState(inicial.areaId);
  const [regionId, setRegionId] = useState(inicial.regionId);
  const [ciudadId, setCiudadId] = useState(inicial.ciudadId);
  const [error, setError] = useState('');
  const [guardado, setGuardado] = useState(false);
  const [cargando, setCargando] = useState(false);

  const ciudadesDeLaRegion = ciudades.filter((c) => String(c.region_id_region) === regionId);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!normalizarTelefonoChile(telefono)) {
      setError('Ingresa un teléfono chileno válido de 9 dígitos (ej: 9 1234 5678).');
      return;
    }
    if (!profesionId || !areaId || !regionId || !ciudadId) {
      setError('Selecciona tu profesión, área de trabajo, región y ciudad.');
      return;
    }
    setCargando(true);
    try {
      const res = await fetch('/api/cuenta', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telefono,
          profesion_id: Number(profesionId),
          area_id: Number(areaId),
          region_id: Number(regionId),
          ciudad_id: Number(ciudadId),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'No se pudieron guardar los cambios.');
        return;
      }
      setGuardado(true);
      router.refresh();
      setTimeout(() => router.push('/modulos/cuenta'), 1200);
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={guardar} className="flex flex-col gap-5">
      {error && <div role="alert" className="bg-[#FEE2E2] text-[#991B1B] text-sm font-medium px-3 py-2 rounded-lg">{error}</div>}
      {guardado && (
        <div role="status" className="bg-[#DCFCE7] text-[#166534] text-sm font-medium px-3 py-2 rounded-lg">
          Tus datos fueron actualizados. Volviendo a tu cuenta...
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm font-semibold text-[#002547]">
          RUN (no editable)
          <input value={run} disabled className={bloqueado} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold text-[#002547]">
          Correo electrónico (no editable)
          <input value={correo} disabled className={bloqueado} />
        </label>

        <label className="flex flex-col gap-1 text-sm font-semibold text-[#002547] sm:col-span-2">
          Teléfono
          <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="9 1234 5678" required className={campo} />
        </label>

        <label className="flex flex-col gap-1 text-sm font-semibold text-[#002547]">
          Profesión / Título
          <select value={profesionId} onChange={(e) => setProfesionId(e.target.value)} required className={campo}>
            {profesiones.map((p) => <option key={p.id_profesion} value={p.id_profesion}>{p.nombre_profesion}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold text-[#002547]">
          Área de trabajo
          <select value={areaId} onChange={(e) => setAreaId(e.target.value)} required className={campo}>
            {areas.map((a) => <option key={a.id_area} value={a.id_area}>{a.nombre_area}</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-semibold text-[#002547]">
          Región
          <select
            value={regionId}
            onChange={(e) => { setRegionId(e.target.value); setCiudadId(''); }}
            required
            className={campo}
          >
            {regiones.map((r) => <option key={r.id_region} value={r.id_region}>{r.nombre_region}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold text-[#002547]">
          Ciudad / Comuna
          <select value={ciudadId} onChange={(e) => setCiudadId(e.target.value)} required className={campo}>
            <option value="" disabled>Selecciona una ciudad</option>
            {ciudadesDeLaRegion.map((c) => <option key={c.id_ciudad} value={c.id_ciudad}>{c.nombre_ciudad}</option>)}
          </select>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={cargando || guardado}
          className="text-sm font-bold text-white bg-[#002547] hover:bg-[#0d3b66] px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
        >
          {cargando ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <Link
          href="/modulos/cuenta"
          className="text-sm font-semibold text-[#42474f] border border-[#c3c6d0] hover:bg-[#f1f4f6] px-4 py-2 rounded-lg transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
