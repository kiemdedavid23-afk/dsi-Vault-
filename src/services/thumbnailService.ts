import RNFS from 'react-native-fs';

const THUMBNAIL_DIR = `${RNFS.CachesDirectoryPath}/dsi_vault_thumbnails`;

/**
 * Les miniatures sont des données internes DSI Vault (Partie 3 §12) : elles peuvent
 * être supprimées et reconstruites, et ne modifient jamais le fichier original.
 */
export async function ensureThumbnailDir(): Promise<void> {
  const exists = await RNFS.exists(THUMBNAIL_DIR);
  if (!exists) await RNFS.mkdir(THUMBNAIL_DIR);
}

export function thumbnailPathFor(contentId: string): string {
  return `${THUMBNAIL_DIR}/${contentId}.jpg`;
}

export async function hasThumbnail(contentId: string): Promise<boolean> {
  return RNFS.exists(thumbnailPathFor(contentId));
}

/**
 * // TODO natif : la génération réelle dépend du type de contenu :
 * - Vidéo : extraction d'une frame (ex. via un module natif ffmpeg-kit ou équivalent)
 * - PDF : rendu de la première page (ex. via react-native-pdf ou un module de rendu)
 * - Image : redimensionnement simple
 * - Audio : pochette embarquée si disponible (métadonnées ID3)
 * Cette fonction pose l'emplacement de sortie attendu ; le contenu réel de la
 * miniature doit être généré par appareil, jamais côté serveur.
 */
export async function generateThumbnail(): Promise<never> {
  throw new Error('generateThumbnail: génération native non branchée (voir // TODO natif).');
}

export async function clearThumbnailCache(): Promise<void> {
  const exists = await RNFS.exists(THUMBNAIL_DIR);
  if (exists) {
    await RNFS.unlink(THUMBNAIL_DIR);
    await RNFS.mkdir(THUMBNAIL_DIR);
  }
}
