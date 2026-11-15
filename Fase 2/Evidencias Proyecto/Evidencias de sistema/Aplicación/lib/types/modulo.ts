export interface Modulo {
  id_modulo: number;
  titulo_modulo: string;
  descripcion_modulo: string | null;
  posicion_modulo: number;
  esta_publicado: boolean;
  es_gratuito: boolean;
  fecha_creacion: string;
}

export type ModuloInput = Omit<Modulo, 'id_modulo' | 'fecha_creacion'>;