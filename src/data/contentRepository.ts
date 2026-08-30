import { getDatabase } from './db';
import type { Content, ContentType } from './models';

function rowToContent(row: any): Content {
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

export async function upsertContent(content: Content): Promise<void> {
  const db = getDatabase();
  await db.executeSql(
    `INSERT INTO Content (id, uri, nom, extension, type, taille, date_modification,
        hash_identification, emplacement, disponible, metadonnees_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
        uri=excluded.uri, nom=excluded.nom, taille=excluded.taille,
        date_modification=excluded.date_modification, emplacement=excluded.emplacement,
        disponible=excluded.disponible, metadonnees_json=excluded.metadonnees_json`,
    [
      content.id,
      content.uri,
      content.nom,
      content.extension,
      content.type,
      content.taille,
      content.dateModification,
      content.hashIdentification,
      content.emplacement,
      content.disponible ? 1 : 0,
      content.metadonnees ? JSON.stringify(content.metadonnees) : null,
    ],
  );
}

export async function markUnavailable(contentId: string): Promise<void> {
  const db = getDatabase();
  await db.executeSql('UPDATE Content SET disponible = 0 WHERE id = ?', [contentId]);
}

export async function getById(contentId: string): Promise<Content | null> {
  const db = getDatabase();
  const [result] = await db.executeSql('SELECT * FROM Content WHERE id = ?', [contentId]);
  if (result.rows.length === 0) return null;
  return rowToContent(result.rows.item(0));
}

export async function listByType(type: ContentType | 'tous'): Promise<Content[]> {
  const db = getDatabase();
  const query =
    type === 'tous'
      ? 'SELECT * FROM Content ORDER BY nom COLLATE NOCASE ASC'
      : 'SELECT * FROM Content WHERE type = ? ORDER BY nom COLLATE NOCASE ASC';
  const params = type === 'tous' ? [] : [type];
  const [result] = await db.executeSql(query, params);
  const items: Content[] = [];
  for (let i = 0; i < result.rows.length; i++) items.push(rowToContent(result.rows.item(i)));
  return items;
}

export async function countByType(): Promise<Record<string, number>> {
  const db = getDatabase();
  const [result] = await db.executeSql('SELECT type, COUNT(*) as n FROM Content GROUP BY type');
  const counts: Record<string, number> = {};
  for (let i = 0; i < result.rows.length; i++) {
    const row = result.rows.item(i);
    counts[row.type] = row.n;
  }
  return counts;
}
