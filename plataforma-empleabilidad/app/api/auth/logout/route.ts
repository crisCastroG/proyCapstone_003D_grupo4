import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ mensaje: 'Sesión cerrada correctamente' });
  response.cookies.delete('empleamas_session');
  return response;
}