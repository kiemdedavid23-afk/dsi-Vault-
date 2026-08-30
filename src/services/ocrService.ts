import { getDatabase } from '../data/db';

/**
 * OCR strictement local (Partie 3 §17, Partie 6 §9) : le document n'est jamais envoyé
 * vers un service cloud. Implémentation de référence via ML Kit (Android natif, hors ligne).
 *
 * // TODO natif : brancher @react-native-ml-kit/text-recognition ici. La signature de
 * cette fonction (page → image → texte) est volontairement stable pour permettre de
 * changer de moteur OCR sans toucher aux appelants (indexation, recherche PDF).
 */
export async function runOcrOnPageImage(imagePath: string): Promise<string> {
  // Exemple d'intégration réelle (à activer après installation du module natif) :
  //
  // import TextRecognition from '@react-native-ml-kit/text-recognition';
  // const result = await TextRecognition.recognize(imagePath);
  // return result.text;
  //
  throw new Error(
    'runOcrOnPageImage: module OCR natif non branché (voir commentaire // TODO natif).',
  );
}

/**
 * Traitement en arrière-plan d'un PDF scanné (Partie 4 §25) : ne doit pas bloquer
 * l'utilisateur. Pensé pour être appelé depuis une tâche de fond, page par page.
 */
export async function indexOcrForContent(
  contentId: string,
  pages: { page: number; imagePath: string }[],
): Promise<void> {
  const db = getDatabase();
  for (const { page, imagePath } of pages) {
    try {
      const texte = await runOcrOnPageImage(imagePath);
      await db.executeSql(
        'INSERT OR REPLACE INTO OcrText (content_id, page, texte) VALUES (?, ?, ?)',
        [contentId, page, texte],
      );
    } catch (err) {
      // Une page illisible ne doit pas interrompre l'indexation des autres pages.
      console.warn(`OCR ignoré pour ${contentId} page ${page}`, err);
    }
  }
}
