import Link from 'next/link';
import { VERSION_TERMINOS } from '@/lib/terminos';

export const metadata = { title: 'Términos y Condiciones | Empleamás' };

// TEXTO PROVISORIO: la empresa definirá los términos definitivos.
// Para reemplazarlo basta con editar el contenido de <section> y actualizar VERSION_TERMINOS en lib/terminos.ts.
export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-[#f7fafc] px-6 py-12">
      <article className="max-w-3xl mx-auto bg-white p-8 rounded-xl border border-[#c3c6d0]/30">
        <p className="text-xs font-bold uppercase tracking-wider text-[#B45309] bg-[#FEF3C7] inline-block px-3 py-1 rounded-full">
          Borrador · versión {VERSION_TERMINOS}
        </p>
        <h1 className="text-2xl font-extrabold text-[#002547] mt-4">Términos y Condiciones</h1>
        <p className="text-sm text-[#42474f] mt-2">
          Este texto es provisorio y será reemplazado por los términos definitivos de la empresa.
        </p>

        <section className="mt-6 flex flex-col gap-4 text-sm text-[#1f2933] leading-relaxed">
          <h2 className="text-lg font-bold text-[#002547]">1. Objeto</h2>
          <p>[Pendiente: descripción del servicio que ofrece la plataforma Empleamás.]</p>
          <h2 className="text-lg font-bold text-[#002547]">2. Registro y cuenta</h2>
          <p>[Pendiente: requisitos para registrarse, veracidad de los datos y responsabilidad sobre la cuenta.]</p>
          <h2 className="text-lg font-bold text-[#002547]">3. Planes y pagos</h2>
          <p>[Pendiente: planes, precios, medios de pago, renovación y política de reembolsos.]</p>
          <h2 className="text-lg font-bold text-[#002547]">4. Uso del contenido</h2>
          <p>[Pendiente: propiedad intelectual del material educativo y uso permitido.]</p>
          <h2 className="text-lg font-bold text-[#002547]">5. Datos personales</h2>
          <p>[Pendiente: tratamiento de datos personales conforme a la normativa vigente.]</p>
          <h2 className="text-lg font-bold text-[#002547]">6. Baja de la cuenta</h2>
          <p>[Pendiente: condiciones para desactivar o reactivar la cuenta.]</p>
        </section>

        <Link href="/registro" className="inline-block mt-8 text-sm font-semibold text-[#006689] hover:underline">
          ← Volver al registro
        </Link>
      </article>
    </main>
  );
}
