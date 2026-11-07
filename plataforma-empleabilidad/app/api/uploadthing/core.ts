import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // Para imagenes de maximo 8mb
  imagenUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.ufsUrl, name: file.name };
  }),

  // Videos de maximo 64MB
  videoUploader: f({
    video: { maxFileSize: "64MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.ufsUrl, name: file.name };
  }),

  // Documentos y recursos de maximo 32MB 
  documentoUploader: f({
    pdf: { maxFileSize: "32MB", maxFileCount: 1 },
    blob: { maxFileSize: "32MB", maxFileCount: 1 }, 
  }).onUploadComplete(async ({ file }) => {
    return { url: file.ufsUrl, name: file.name };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;