import { getDatabase } from './db';
import type { Bookmark } from './models';

function uid(): string {
  return `bkmk_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

/** 🔖 Marque-page : rapide, sans texte — "je veux revenir ici" (Partie 5 §10-11). */
export async function createBookmark(
  contentId: string,
  position: { positionSecondes?: number; page?: number },
): Promise<Bookmark> {
  const db = getDatabase();
  const bookmark: Bookmark = {
    id: uid(),
    contentId,
    positionSecondes: position.positionSecondes,
    page: position.page,
    creeLe: Date.now(),
  };
  await db.executeSql(
    'INSERT INTO Bookmark (id, content_id, position_secondes, page, cree_le) VALUES (?, ?, ?, ?, ?)',
    [bookmark.id, bookmark.contentId, bookmark.positionSecondes ?? null, bookmark.page ?? null, bookmark.creeLe],
  );
  return bookmark;
}

export async function deleteBookmark(id: string): Promise<void> {
  const db = getDatabase();
  await db.executeSql('DELETE FROM Bookmark WHERE id = ?', [id]);
}

export async function listBookmarksForContent(contentId: string): Promise<Bookmark[]> {
  const db = getDatabase();
  const [result] = await db.executeSql(
    'SELECT * FROM Bookmark WHERE content_id = ? ORDER BY cree_le DESC',
    [contentId],
  );
  return mapRows(result);
}

export async function listAllBookmarks(): Promise<Bookmark[]> {
  const db = getDatabase();
  const [result] = await db.executeSql('SELECT * FROM Bookmark ORDER BY cree_le DESC');
  return mapRows(result);
}

function mapRows(result: any): Bookmark[] {
  const items: Bookmark[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    const row = result.rows.item(i);
    items.push({
      id: row.id,
      contentId: row.content_id,
      positionSecondes: row.position_secondes ?? undefined,
      page: row.page ?? undefined,
      creeLe: row.cree_le,
    });
  }
  return items;
}
