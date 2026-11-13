import { redirect } from 'next/navigation';
import { obtenerSesionActual } from '@/lib/auth';
import { obtenerMetricasDashboard } from '@/lib/metricas';
import TarjetaKpi from './_componentes/TarjetaKpi';
import GraficoBarras from './_componentes/GraficoBarras';
import BarrasHorizontales from './_componentes/BarrasHorizontales';

export const dynamic = 'force-dynamic';

const clp = (v: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(v);
const entero = (v: number) => new Intl.NumberFormat('es-CL').format(v);
const pct = (v: number) => `${v.toFixed(1).replace('.', ',')}%`;

export default async function AdminDashboardPage() {
  const sesion = await obtenerSesionActual();
  if (!sesion) redirect('/inicio_sesion');
  if (sesion.rol !== 'administrador' && sesion.rol !== 'superadministrador') redirect('/modulos?error=403');

  const m = await obtenerMetricasDashboard();

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-extrabold text-[#002547] tracking-tight">Dashboard</h1>
        <p className="text-sm text-[#42474f] mt-1">
          Resumen del uso y el desempeño de la plataforma. Los datos se calculan al abrir la página.
        </p>
      </header>

      <section aria-labelledby="h-usuarios" className="flex flex-col gap-4">
        <h2 id="h-usuarios" className="text-lg font-bold text-[#002547]">Usuarios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TarjetaKpi titulo="Usuarios registrados" valor={entero(m.usuarios.total)} icono="group"
            detalle={`${entero(m.usuarios.activos)} activos · ${entero(m.usuarios.desactivados)} dados de baja`} />
          <TarjetaKpi titulo="Nuevos (30 días)" valor={entero(m.usuarios.nuevos30d)} icono="person_add" />
          <TarjetaKpi titulo="Suscripciones vigentes" valor={entero(m.pagos.suscripcionesVigentes)} icono="workspace_premium" />
          <TarjetaKpi titulo="Perfiles digitales" valor={entero(m.perfiles.creados)} icono="badge"
            detalle={`${pct(m.perfiles.porcentajeUsuarios)} de los usuarios · ${entero(m.perfiles.conQr)} con QR`} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GraficoBarras titulo="Registros por mes" datos={m.usuarios.registrosPorMes} formato={entero} />
          <BarrasHorizontales titulo="Suscripciones vigentes por plan" datos={m.pagos.suscripcionesPorPlan} vacio="No hay suscripciones vigentes." />
        </div>
      </section>

      <section aria-labelledby="h-pagos" className="flex flex-col gap-4">
        <h2 id="h-pagos" className="text-lg font-bold text-[#002547]">Pagos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TarjetaKpi titulo="Ingresos totales" valor={clp(m.pagos.ingresosTotales)} icono="payments"
            detalle="Solo pagos aprobados" />
          <TarjetaKpi titulo="Ingresos (30 días)" valor={clp(m.pagos.ingresos30d)} icono="trending_up" />
          <TarjetaKpi titulo="Pagos aprobados" valor={entero(m.pagos.pagosAprobados)} icono="receipt_long" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GraficoBarras titulo="Ingresos por mes" datos={m.pagos.ingresosPorMes} formato={clp} />
          <BarrasHorizontales titulo="Pagos por estado" datos={m.pagos.pagosPorEstado} vacio="Aún no hay pagos registrados." />
        </div>
      </section>

      <section aria-labelledby="h-tests" className="flex flex-col gap-4">
        <h2 id="h-tests" className="text-lg font-bold text-[#002547]">Evaluaciones y contenido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TarjetaKpi titulo="Intentos de test" valor={entero(m.tests.intentosTotales)} icono="quiz"
            detalle={`${entero(m.tests.usuariosQueRindieron)} usuarios distintos`} />
          <TarjetaKpi titulo="Tasa de aprobación" valor={pct(m.tests.tasaAprobacion)} icono="task_alt"
            detalle={`${entero(m.tests.intentosAprobados)} de ${entero(m.tests.intentosTotales)} intentos`} />
          <TarjetaKpi titulo="Evaluaciones publicadas" valor={entero(m.tests.evaluacionesPublicadas)} icono="fact_check" />
          <TarjetaKpi titulo="Lecciones completadas" valor={entero(m.contenido.leccionesCompletadas)} icono="school"
            detalle={`${entero(m.contenido.modulosPublicados)} módulos · ${entero(m.contenido.leccionesPublicadas)} lecciones publicadas`} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GraficoBarras titulo="Intentos de test por mes" datos={m.tests.intentosPorMes} formato={entero} />
          <BarrasHorizontales
            titulo="Resultado de los intentos"
            vacio="Aún no hay intentos de test."
            datos={[
              { etiqueta: 'Aprobados', valor: m.tests.intentosAprobados },
              { etiqueta: 'No aprobados', valor: m.tests.intentosTotales - m.tests.intentosAprobados },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
