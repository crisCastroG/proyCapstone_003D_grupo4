import RegisterForm from './RegisterForm';
import { rutaInternaSegura } from '@/lib/redirect';

type Props = {
  searchParams: Promise<{ [clave: string]: string | string[] | undefined }>;
};

export default async function RegistroPage({ searchParams }: Props) {
  const { next } = await searchParams;
  return <RegisterForm next={rutaInternaSegura(next)} />;
}