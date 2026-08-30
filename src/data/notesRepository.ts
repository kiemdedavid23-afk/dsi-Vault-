import { getDatabase } from './db';
import type { Note } from './models';

function uid(): string {
  return `note_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

/**
 * 📝 Note (générale ou positionnelle) — distincte du marque-page (Partie 5 §11) :
 * la note contient un texte, le marque-page non.
 */
export async function createNote(
  contentId: string,
  texte: string,
  position?: { positionSecondes?: number; page?: number },
): Promise<Note> {
  const db = getDatabase();
  const note: Note = {
    id: uid(),
    contentId,
    texte,
    positionSecondes: position?.positionSecondes,
    page: position?.page,
    creeLe: Date.now(),
  };
  await db.executeSql(
    'INSERT INTO Note (id, content_id, texte, position_secondes, page, cree_le) VALUES (?, ?, ?, ?, ?, ?)',
    [note.id, note.contentId, note.texte, note.positionSecondes ?? null, note.page ?? null, note.creeLe],
  );
  return note;
}

export async function updateNote(id: string, texte: string): Promise<void> {
  const db = getDatabase();
  await db.executeSql('UPDATE Note SET texte = ? WHERE id = ?', [texte, id]);
}

export async function deleteNote(id: string): Promise<void> {
  const db = getDatabase();
  await db.executeSql('DELETE FROM Note WHERE id = ?', [id]);
}

export async function listNotesForContent(contentId: string): Promise<Note[]> {
  const db = getDatabase();
  const [result] = await db.executeSql(
    'SELECT * FROM Note WHERE content_id = ? ORDER BY cree_le DESC',
    [contentId],
  );
  return mapRows(result);
}

export async function listAllNotes(): Promise<Note[]> {
  const db = getDatabase();
  const [result] = await db.executeSql('SELECT * FROM Note ORDER BY cree_le DESC');
  return mapRows(result);
}

function mapRows(result: any): Note[] {
  const items: Note[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    const row = result.rows.item(i);
    items.push({
      id: row.id,
      contentId: row.content_id,
      texte: row.texte,
      positionSecondes: row.position_secondes ?? undefined,
      page: row.page ?? undefined,
      creeLe: row.cree_le,
    });
  }
  return items;
}
