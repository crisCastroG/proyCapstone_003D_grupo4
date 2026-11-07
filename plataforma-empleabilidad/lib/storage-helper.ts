import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

/* Guarda un archivo localmnente */
export async function guardarArchivoLocal(file: File): Promise<string> {
  const extension = path.extname(file.name);
  const nombreLimpio = file.name
    .substring(0, file.name.lastIndexOf('.'))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');
  
  const nombreUnico = `${Date.now()}_${nombreLimpio}${extension}`;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const rutaDestino = path.join(process.cwd(), 'public', 'uploads', nombreUnico);

  await writeFile(rutaDestino, buffer);
  return `/uploads/${nombreUnico}`;
}

/* Elimina el archivo detectando automáticamente si es local o de Uploadthing */
export async function eliminarArchivoStorage(urlRecurso?: string | null) {
  if (!urlRecurso) return;

  try {
    if (urlRecurso.startsWith('/uploads/')) {
      const nombreArchivo = urlRecurso.replace('/uploads/', '');
      const rutaDisco = path.join(process.cwd(), 'public', 'uploads', nombreArchivo);
      await unlink(rutaDisco).catch(() => null); 
    }
    else if (urlRecurso.includes('utfs.io') || urlRecurso.includes('ufs.sh')) {
      const urlObj = new URL(urlRecurso);
      const pathSegments = urlObj.pathname.split('/').filter(Boolean);
      
      const indexF = pathSegments.indexOf('f');
      const fileKey = indexF !== -1 && pathSegments[indexF + 1] 
        ? pathSegments[indexF + 1] 
        : pathSegments[pathSegments.length - 1];

      if (fileKey) {
        console.log(`[Uploadthing] Borrando fileKey: ${fileKey}`);
        const response = await utapi.deleteFiles(fileKey);
        console.log(`[Uploadthing] Respuesta de eliminación:`, response);
      }
    }
  } catch (error) {
    console.error('Error al borrar recurso del almacenamiento:', error);
  }
}