import { getDatabase } from './db';
import type { Content } from './models';

/** ⭐ Favori (Partie 5 §4-6) : disponible pour audio/vidéo/pdf/image, stocké localement. */
export async function addFavorite(contentId: string): Promise<void> {
  const db = getDatabase();
  await db.executeSql(
    'INSERT OR REPLACE INTO Favorite (content_id, ajoute_le) VALUES (?, ?)',
    [contentId, Date.now()],
  );
}

export async function removeFavorite(contentId: string): Promise<void> {
  const db = getDatabase();
  await db.executeSql('DELETE FROM Favorite WHERE content_id = ?', [contentId]);
}

export async function isFavorite(contentId: string): Promise<boolean> {
  const db = getDatabase();
  const [result] = await db.executeSql('SELECT 1 FROM Favorite WHERE content_id = ?', [contentId]);
  return result.rows.length > 0;
}

export async function listFavorites(): Promise<Content[]> {
  const db = getDatabase();
  const [result] = await db.executeSql(
    `SELECT c.* FROM Content c
     JOIN Favorite f ON f.content_id = c.id
     ORDER BY f.ajoute_le DESC`,
  );
  const items: Content[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    const row = result.rows.item(i);
    items.push({
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
    });
  }
  return items;
}
