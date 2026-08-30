import RNFS from 'react-native-fs';
import { upsertContent, markUnavailable, listByType } from '../data/contentRepository';
import type { Content, ContentType } from '../data/models';

/**
 * DÉCISION REQUISE (Partie 6 §13, voir ARCHITECTURE.md §I.1) :
 * sur Android 10+, un simple chemin absolu ne suffit pas toujours. Cette implémentation
 * suppose un accès déjà autorisé (dossier choisi via un sélecteur, ou permission
 * MediaStore déjà obtenue en amont). Le point d'entrée `scanLocations` reste stable
 * quelle que soit la stratégie d'accès finalement retenue.
 */

const EXTENSION_TYPE: Record<string, ContentType> = {
  mp3: 'audio', wav: 'audio', flac: 'audio', m4a: 'audio', ogg: 'audio',
  mp4: 'video', mkv: 'video', avi: 'video', mov: 'video', webm: 'video',
  pdf: 'pdf',
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image',
};

function detectType(extension: string): ContentType {
  return EXTENSION_TYPE[extension.toLowerCase()] ?? 'autre';
}

/**
 * Identifiant fiable (Partie 8 §12) : le nom de fichier seul est insuffisant.
 * Stratégie hybride : taille + date de modification + chemin, pour rester rapide
 * sur de gros fichiers vidéo (un hash de contenu complet serait trop coûteux —
 * voir ARCHITECTURE.md §I.4, à valider).
 */
function computeIdentificationHash(path: string, size: number, mtimeMs: number): string {
  return `${path}::${size}::${mtimeMs}`;
}

export interface ScanProgress {
  traites: number;
  total: number;
}

/**
 * Analyse en arrière-plan (Partie 3 §8) : cette fonction est prévue pour être appelée
 * depuis une tâche de fond (ex. réutilisable par WorkManager côté natif), pas
 * bloquante pour l'interface. `onProgress` permet d'alimenter l'écran
 * "Analyse en cours en arrière-plan…" (Partie 3 §8).
 */
export async function scanLocations(
  locations: string[],
  onProgress?: (progress: ScanProgress) => void,
): Promise<void> {
  const allPaths: string[] = [];

  for (const location of locations) {
    try {
      const items = await RNFS.readDir(location);
      // Scan récursif simple — à raffiner (Partie 8 §11) pour éviter de rescanner
      // inutilement les sous-dossiers inchangés sur de grandes bibliothèques.
      for (const item of items) {
        if (item.isFile()) allPaths.push(item.path);
      }
    } catch (err) {
      console.warn(`Emplacement inaccessible ignoré : ${location}`, err);
      // Un emplacement inaccessible ne doit pas interrompre le scan des autres (Partie 3 §27).
    }
  }

  let traites = 0;
  for (const path of allPaths) {
    try {
      const stat = await RNFS.stat(path);
      const extension = path.split('.').pop() ?? '';
      const type = detectType(extension);
      const nom = path.split('/').pop() ?? path;

      const content: Content = {
        id: computeIdentificationHash(path, stat.size, Number(stat.mtime)),
        uri: path,
        nom,
        extension,
        type,
        taille: stat.size,
        dateModification: Number(stat.mtime),
        hashIdentification: computeIdentificationHash(path, stat.size, Number(stat.mtime)),
        emplacement: path.substring(0, path.lastIndexOf('/')),
        disponible: true,
      };

      await upsertContent(content);
    } catch (err) {
      // Un fichier individuel problématique ne doit jamais faire planter le scan (Partie 3 §27).
      console.warn(`Fichier ignoré (erreur de lecture) : ${path}`, err);
    } finally {
      traites += 1;
      onProgress?.({ traites, total: allPaths.length });
    }
  }

  await detectMissingFiles();
}

/** Détecte les fichiers précédemment indexés devenus introuvables (Partie 3 §25-26). */
async function detectMissingFiles(): Promise<void> {
  const known = await listByType('tous');
  for (const content of known) {
    const exists = await RNFS.exists(content.uri);
    if (!exists && content.disponible) {
      await markUnavailable(content.id);
    }
  }
}
