import { getDatabase } from './db';
import type { Progress } from './models';

/** Reprise de lecture — audio/vidéo (secondes) ou PDF (page). Partie 5 §19-22. */
export async function saveProgress(
  contentId: string,
  data: { positionSecondes?: number; page?: number },
): Promise<void> {
  const db = getDatabase();
  await db.executeSql(
    `INSERT INTO Progress (content_id, position_secondes, page, mis_a_jour_le)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(content_id) DO UPDATE SET
        position_secondes = excluded.position_secondes,
        page = excluded.page,
        mis_a_jour_le = excluded.mis_a_jour_le`,
    [contentId, data.positionSecondes ?? null, data.page ?? null, Date.now()],
  );
}

export async function getProgress(contentId: string): Promise<Progress | null> {
  const db = getDatabase();
  const [result] = await db.executeSql('SELECT * FROM Progress WHERE content_id = ?', [contentId]);
  if (result.rows.length === 0) return null;
  const row = result.rows.item(0);
  return {
    contentId: row.content_id,
    positionSecondes: row.position_secondes ?? undefined,
    page: row.page ?? undefined,
    misAJourLe: row.mis_a_jour_le,
  };
}
