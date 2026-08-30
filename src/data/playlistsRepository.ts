import { getDatabase } from './db';
import type { Content, Playlist } from './models';

function uid(): string {
  return `pl_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

/** Playlists locales — collections enregistrées, distinctes de la file de lecture (Partie 5 §26). */
export async function createPlaylist(nom: string): Promise<Playlist> {
  const db = getDatabase();
  const playlist: Playlist = { id: uid(), nom, creeLe: Date.now() };
  await db.executeSql('INSERT INTO Playlist (id, nom, cree_le) VALUES (?, ?, ?)', [
    playlist.id,
    playlist.nom,
    playlist.creeLe,
  ]);
  return playlist;
}

export async function renamePlaylist(id: string, nom: string): Promise<void> {
  const db = getDatabase();
  await db.executeSql('UPDATE Playlist SET nom = ? WHERE id = ?', [nom, id]);
}

export async function deletePlaylist(id: string): Promise<void> {
  const db = getDatabase();
  // La suppression d'une playlist ne supprime jamais les fichiers originaux (Partie 5 §24).
  await db.executeSql('DELETE FROM PlaylistItem WHERE playlist_id = ?', [id]);
  await db.executeSql('DELETE FROM Playlist WHERE id = ?', [id]);
}

export async function addToPlaylist(playlistId: string, contentId: string): Promise<void> {
  const db = getDatabase();
  const [countResult] = await db.executeSql(
    'SELECT COUNT(*) as n FROM PlaylistItem WHERE playlist_id = ?',
    [playlistId],
  );
  const ordre = countResult.rows.item(0).n;
  await db.executeSql(
    'INSERT OR REPLACE INTO PlaylistItem (playlist_id, content_id, ordre) VALUES (?, ?, ?)',
    [playlistId, contentId, ordre],
  );
}

export async function removeFromPlaylist(playlistId: string, contentId: string): Promise<void> {
  const db = getDatabase();
  await db.executeSql('DELETE FROM PlaylistItem WHERE playlist_id = ? AND content_id = ?', [
    playlistId,
    contentId,
  ]);
}

export async function listPlaylists(): Promise<Playlist[]> {
  const db = getDatabase();
  const [result] = await db.executeSql('SELECT * FROM Playlist ORDER BY cree_le DESC');
  const items: Playlist[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    const row = result.rows.item(i);
    items.push({ id: row.id, nom: row.nom, creeLe: row.cree_le });
  }
  return items;
}

export async function listPlaylistContents(playlistId: string): Promise<Content[]> {
  const db = getDatabase();
  const [result] = await db.executeSql(
    `SELECT c.* FROM Content c
     JOIN PlaylistItem pi ON pi.content_id = c.id
     WHERE pi.playlist_id = ?
     ORDER BY pi.ordre ASC`,
    [playlistId],
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
