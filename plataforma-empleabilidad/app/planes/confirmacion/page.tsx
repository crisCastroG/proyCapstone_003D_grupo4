import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { obtenerSesionActual } from '@/lib/auth';
import { buscarPagoDeUsuario, type PagoGuardado } from '@/lib/pagos';
import { formatearClp } from '@/lib/planes';

export const metadata: Metadata = {
  title: 'Resultado del pago | Empleamás',
};

type Props = {
  searchParams: Promise<{ [clave: string]: string | string[] | undefined }>;
};

const ETIQUETA_TIPO_PAGO: Record<NonNullable<PagoGuardado['tipoPago']>, string> = {
  credito: 'Tarjeta de crédito',
  debito: 'Tarjeta de débito',
  prepago: 'Tarjeta de prepago',
};

const formatoFecha = new Intl.DateTimeFormat('es-CL', { dateStyle: 'long' });

export default async function ConfirmacionPage({ searchParams }: Props) {
  const { orden } = await searchParams;
  const ordenCompra = typeof orden === 'string' ? orden : null;

  const sesion = await obtenerSesionActual();
  if (!sesion) {
    const volver = ordenCompra ? `/planes/confirmacion?orden=${encodeURIComponent(ordenCompra)}` : '/planes';
    redirect(`/inicio_sesion?next=${encodeURIComponent(volver)}`);
  }

  // El resultado SIEMPRE se lee de la BD (lo que dejó la ruta de retorno tras el
  // commit con Transbank), nunca de la URL. Y solo si el pago es de este usuario.
  const pago = ordenCompra ? await buscarPagoDeUsuario(ordenCompra, sesion.id_usuario) : null;

  if (!pago) {
    return (
      <Resultado
        icono="help"
        etiqueta="Pago no encontrado"
        titulo="No encontramos ese pago"
        texto="Si acabas de pagar y ves este mensaje, revisa la sección de planes o contáctanos."
      />
    );
  }

  if (pago.estado === 'pendiente') {
    return (
      <Resultado
        icono="hourglass_top"
        etiqueta="Pago en proceso"
        titulo="Tu pago todavía no se confirma"
        texto="Recarga esta página en unos segundos. No vuelvas a pagar para no duplicar el cobro."
      />
    );
  }

  if (pago.estado !== 'aprobado') {
    return (
      <Resultado
        icono="cancel"
        etiqueta="Pago no realizado"
        titulo="El pago no se completó"
        texto="No se realizó ningún cobro y tu plan no cambió. Puedes intentarlo de nuevo."
        accion={{ href: '/planes/pago', texto: 'Volver a intentar' }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-14">
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center text-sm font-semibold text-amber-800">
        Ambiente de pruebas de Transbank: no se realizó ningún cobro real.
      </p>

      <section className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <span
          aria-hidden="true"
          className="material-symbols-outlined flex h-16 w-16 items-center justify-center rounded-full bg-[#002546] text-3xl text-white"
        >
          verified
        </span>
        <p className="mt-5 text-[11px] font-bold uppercase tracking-wide text-[#006689]">
          Transacción exitosa · Membresía activa
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#002546] md:text-4xl">
          ¡Bienvenido a EmpleaMás Pro, {sesion.nombre}!
        </h1>
        <p className="mt-4 text-[#42474f]">
          Tu plan está activo. Ya puedes entrar a todos los módulos de contenido grabado y avanzar
          aprobando cada prueba.
        </p>
      </section>

      <dl className="mx-auto grid w-full max-w-3xl gap-4 rounded-2xl border border-[#c3c6d0]/60 bg-white p-6 sm:grid-cols-2 lg:grid-cols-4">
        <Dato titulo="Plan" valor={pago.nombrePlan ?? 'Plan Pro'} />
        <Dato titulo="Total pagado" valor={formatearClp(pago.monto)} />
        <Dato titulo="Método de pago" valor={pago.tipoPago ? ETIQUETA_TIPO_PAGO[pago.tipoPago] : 'Tarjeta'} />
        <Dato
          titulo="Vigente hasta"
          valor={pago.fechaTerminoPlan ? formatoFecha.format(pago.fechaTerminoPlan) : '—'}
        />
        <Dato titulo="Orden de compra" valor={pago.ordenCompra} />
        <Dato titulo="Código de autorización" valor={pago.codigoAutorizacion ?? '—'} />
        <Dato titulo="Fecha" valor={pago.fechaPago ? formatoFecha.format(pago.fechaPago) : '—'} />
      </dl>

      <div className="mx-auto">
        <Link
          href="/modulos"
          className="flex items-center gap-2 rounded-lg bg-[#002546] px-6 py-3 text-sm font-bold text-white hover:bg-[#0d3b66]"
        >
          Ir a los módulos
          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs text-[#42474f]">{titulo}</dt>
      <dd className="mt-1 break-words font-bold text-[#002546]">{valor}</dd>
    </div>
  );
}

function Resultado({
  icono,
  etiqueta,
  titulo,
  texto,
  accion = { href: '/planes', texto: 'Ir a planes' },
}: {
  icono: string;
  etiqueta: string;
  titulo: string;
  texto: string;
  accion?: { href: string; texto: string };
}) {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center text-center">
      <span
        aria-hidden="true"
        className="material-symbols-outlined flex h-16 w-16 items-center justify-center rounded-full bg-[#e6f2fb] text-3xl text-[#002546]"
      >
        {icono}
      </span>
      <p className="mt-5 text-[11px] font-bold uppercase tracking-wide text-[#006689]">{etiqueta}</p>
      <h1 className="mt-2 text-3xl font-extrabold text-[#002546]">{titulo}</h1>
      <p className="mt-4 text-[#42474f]">{texto}</p>
      <Link
        href={accion.href}
        className="mt-8 rounded-lg bg-[#002546] px-6 py-3 text-sm font-bold text-white hover:bg-[#0d3b66]"
      >
        {accion.texto}
      </Link>
    </section>
  );
}
