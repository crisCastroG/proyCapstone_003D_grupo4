import nodemailer from 'nodemailer';



export type ResultadoCorreo = { enviado: boolean; simulado: boolean };

export async function enviarCorreo(opts: {
  para: string;
  asunto: string;
  texto: string;
  responderA?: string;
}): Promise<ResultadoCorreo> {
  const host = process.env.SMTP_HOST;

  if (!host) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('El envío de correos no está configurado (falta SMTP_HOST).');
    }
    console.log(`[correo simulado] Para: ${opts.para}\nAsunto: ${opts.asunto}\n\n${opts.texto}\n`);
    return { enviado: false, simulado: true };
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: opts.para,
    subject: opts.asunto,
    text: opts.texto,
    replyTo: opts.responderA,
  });
  return { enviado: true, simulado: false };
}
