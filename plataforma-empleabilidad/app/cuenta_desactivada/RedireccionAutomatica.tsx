'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RedireccionAutomatica({
  destino,
  segundos,
}: {
  destino: string;
  segundos: number;
}) {
  const router = useRouter();
  const [restante, setRestante] = useState(segundos);

  useEffect(() => {
    if (restante <= 0) {
      router.push(destino);
      return;
    }
    const temporizador = setTimeout(() => setRestante((s) => s - 1), 1000);
    return () => clearTimeout(temporizador);
  }, [restante, destino, router]);

  return (
    <p className="text-sm text-[#42474f]" aria-live="polite">
      Te llevaremos al inicio en {restante} {restante === 1 ? 'segundo' : 'segundos'}.
    </p>
  );
}