import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Schéma local — voir ARCHITECTURE.md section D.
 * Toutes les données ici sont des DONNÉES INTERNES DSI Vault, jamais les fichiers
 * originaux (Partie 3 §3). Aucune de ces tables ne quitte l'appareil, sauf export
 * volontaire (backupService.ts).
 */
const SCHEMA_V1 = `
CREATE TABLE IF NOT EXISTS Content (
  id TEXT PRIMARY KEY,
  uri TEXT NOT NULL,
  nom TEXT NOT NULL,
  extension TEXT,
  type TEXT NOT NULL,
  taille INTEGER,
  date_modification INTEGER,
  hash_identification TEXT UNIQUE,
  emplacement TEXT,
  disponible INTEGER DEFAULT 1,
  metadonnees_json TEXT
);

CREATE TABLE IF NOT EXISTS Progress (
  content_id TEXT PRIMARY KEY REFERENCES Content(id),
  position_secondes REAL,
  page INTEGER,
  mis_a_jour_le INTEGER
);

CREATE TABLE IF NOT EXISTS Favorite (
  content_id TEXT PRIMARY KEY REFERENCES Content(id),
  ajoute_le INTEGER
);

CREATE TABLE IF NOT EXISTS Note (
  id TEXT PRIMARY KEY,
  content_id TEXT REFERENCES Content(id),
  texte TEXT NOT NULL,
  position_secondes REAL,
  page INTEGER,
  cree_le INTEGER
);

CREATE TABLE IF NOT EXISTS Bookmark (
  id TEXT PRIMARY KEY,
  content_id TEXT REFERENCES Content(id),
  position_secondes REAL,
  page INTEGER,
  cree_le INTEGER
);

CREATE TABLE IF NOT EXISTS Playlist (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  cree_le INTEGER
);

CREATE TABLE IF NOT EXISTS PlaylistItem (
  playlist_id TEXT REFERENCES Playlist(id),
  content_id TEXT REFERENCES Content(id),
  ordre INTEGER,
  PRIMARY KEY (playlist_id, content_id)
);

CREATE TABLE IF NOT EXISTS HistoryEntry (
  id TEXT PRIMARY KEY,
  content_id TEXT REFERENCES Content(id),
  consulte_le INTEGER
);

CREATE TABLE IF NOT EXISTS Preference (
  cle TEXT PRIMARY KEY,
  valeur TEXT
);

CREATE TABLE IF NOT EXISTS OcrText (
  content_id TEXT REFERENCES Content(id),
  page INTEGER,
  texte TEXT,
  PRIMARY KEY (content_id, page)
);
`;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await SQLite.openDatabase({ name: 'dsi_vault.db', location: 'default' });

  // Exécution du schéma. Une évolution future (Partie 8 §14) devra passer par un
  // mécanisme de migration versionné plutôt que par des ALTER TABLE ad hoc ici.
  await dbInstance.executeSql(SCHEMA_V1);

  return dbInstance;
}

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    throw new Error('Base locale non initialisée — appeler initDatabase() au démarrage.');
  }
  return dbInstance;
}
