import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";


const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Empleamás | Tu próximo empleo comienza aquí",
  description:
    "Asesoría laboral, herramientas digitales y acompañamiento profesional para impulsar tu carrera.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
