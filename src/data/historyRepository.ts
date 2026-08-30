import { getDatabase } from './db';
import type { Content } from './models';

function uid(): string {
  return `hist_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

/** Historique local de consultation (Partie 5 §17-18). Reste local, jamais envoyé. */
export async function recordVisit(contentId: string): Promise<void> {
  const db = getDatabase();
  await db.executeSql('INSERT INTO HistoryEntry (id, content_id, consulte_le) VALUES (?, ?, ?)', [
    uid(),
    contentId,
    Date.now(),
  ]);
}

export async function clearHistory(): Promise<void> {
  const db = getDatabase();
  // Ne supprime que l'historique — jamais les fichiers originaux (Partie 5 §18).
  await db.executeSql('DELETE FROM HistoryEntry');
}

export async function listRecent(limit = 10): Promise<Content[]> {
  const db = getDatabase();
  const [result] = await db.executeSql(
    `SELECT c.*, MAX(h.consulte_le) as derniere_visite FROM Content c
     JOIN HistoryEntry h ON h.content_id = c.id
     GROUP BY c.id
     ORDER BY derniere_visite DESC
     LIMIT ?`,
    [limit],
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
