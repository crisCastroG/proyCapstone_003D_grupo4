export type TipoBloque = 'texto' | 'video' | 'pdf' | 'recurso' | string;

export type Recurso = {
  id_recurso: number;
  titulo_recurso: string;
  url_recurso?: string;
  nombre_archivo?: string;
  tamano_bytes?: number;
  es_descargable: boolean;
  bloque_contenido_id_bloque: number;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
};

export type BloqueContenido = {
  id_bloque: number;
  tipo_bloque: TipoBloque;
  titulo_bloque?: string;
  contenido_texto?: string;
  url_recurso?: string;
  orden_bloque: number;
  es_obligatorio: boolean;
  contenido_id_contenido: number;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  recursos?: Recurso[];
};