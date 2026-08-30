import { getDatabase } from '../data/db';
import type { Content } from '../data/models';

/**
 * Recherche strictement locale (Partie 3 §15, Partie 6 §8) : aucune requête n'est
 * envoyée à un serveur. Cherche dans le nom, puis dans le texte OCR indexé.
 */
export async function searchLibrary(query: string): Promise<Content[]> {
  const db = getDatabase();
  const like = `%${query}%`;

  const [byName] = await db.executeSql(
    'SELECT * FROM Content WHERE nom LIKE ? ORDER BY nom COLLATE NOCASE ASC',
    [like],
  );

  const results: Content[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < byName.rows.length; i++) {
    const row = byName.rows.item(i);
    seen.add(row.id);
    results.push(mapRow(row));
  }

  // Résultats via le texte indexé (PDF natif ou OCR local — Partie 3 §16-18).
  const [byText] = await db.executeSql(
    `SELECT DISTINCT c.* FROM Content c
     JOIN OcrText o ON o.content_id = c.id
     WHERE o.texte LIKE ?`,
    [like],
  );
  for (let i = 0; i < byText.rows.length; i++) {
    const row = byText.rows.item(i);
    if (!seen.has(row.id)) {
      seen.add(row.id);
      results.push(mapRow(row));
    }
  }

  return results;
}

/** Retrouve la ou les pages où le terme a été détecté (utile pour ouvrir le PDF directement). */
export async function searchTextInContent(
  contentId: string,
  query: string,
): Promise<number[]> {
  const db = getDatabase();
  const [result] = await db.executeSql(
    'SELECT page FROM OcrText WHERE content_id = ? AND texte LIKE ? ORDER BY page ASC',
    [contentId, `%${query}%`],
  );
  const pages: number[] = [];
  for (let i = 0; i < result.rows.length; i++) pages.push(result.rows.item(i).page);
  return pages;
}

function mapRow(row: any): Content {
  return {
    id: row.id,
    uri: row.uri,
    nom: row.nom,
    extension: row.extension,
    type: row.type,
    taille: row.taille,
    dateModification: row.date_modification,
    hashIdentification: row.hash_identification,
    emplacement: row.emplacement,
    disponible: !!row.disponible,
    metadonnees: row.metadonnees_json ? JSON.parse(row.metadonnees_json) : undefined,
  };
}
