import RNFS from 'react-native-fs';
import { getDatabase } from '../data/db';

/**
 * Sauvegarde locale non chiffrée (Partie 5 §31-32, Partie 6 §17) : décision V1 assumée.
 * L'utilisateur est explicitement averti que le fichier contient ses données DSI Vault
 * et doit le protéger lui-même.
 */
const TABLES_EXPORTEES = [
  'Favorite',
  'Note',
  'Bookmark',
  'Playlist',
  'PlaylistItem',
  'HistoryEntry',
  'Progress',
  'Preference',
];

export interface BackupPayload {
  version: 1;
  exporteLe: number;
  avertissement: string;
  donnees: Record<string, any[]>;
}

export async function exportBackup(destinationPath: string): Promise<void> {
  const db = getDatabase();
  const donnees: Record<string, any[]> = {};

  for (const table of TABLES_EXPORTEES) {
    const [result] = await db.executeSql(`SELECT * FROM ${table}`);
    const rows: any[] = [];
    for (let i = 0; i < result.rows.length; i++) rows.push(result.rows.item(i));
    donnees[table] = rows;
  }

  const payload: BackupPayload = {
    version: 1,
    exporteLe: Date.now(),
    avertissement:
      'Cette sauvegarde contient vos données DSI Vault. Conservez-la dans un emplacement sûr.',
    donnees,
  };

  await RNFS.writeFile(destinationPath, JSON.stringify(payload, null, 2), 'utf8');
}

/**
 * Restauration volontaire (Partie 5 §33) : DSI Vault doit prévenir si la restauration
 * risque de remplacer des données existantes — la confirmation reste à la charge de
 * l'écran appelant (Paramètres > Confidentialité et sécurité > Données locales).
 */
export async function restoreBackup(sourcePath: string): Promise<void> {
  const content = await RNFS.readFile(sourcePath, 'utf8');
  const payload: BackupPayload = JSON.parse(content);

  if (payload.version !== 1) {
    throw new Error('Format de sauvegarde non reconnu.');
  }

  const db = getDatabase();
  for (const [table, rows] of Object.entries(payload.donnees)) {
    for (const row of rows) {
      const colonnes = Object.keys(row);
      const placeholders = colonnes.map(() => '?').join(', ');
      const valeurs = colonnes.map((c) => row[c]);
      await db.executeSql(
        `INSERT OR REPLACE INTO ${table} (${colonnes.join(', ')}) VALUES (${placeholders})`,
        valeurs,
      );
      // Réassociation aux fichiers du nouvel appareil (Partie 5 §35) : ici on réinsère
      // tel quel ; la réconciliation avec les Content.id du nouvel appareil doit être
      // faite par un scan de bibliothèque après restauration, avec prudence (pas
      // d'association automatique agressive risquant de lier une note au mauvais fichier).
    }
  }
}

/** Réinitialisation des données internes — ne touche jamais aux fichiers originaux (Partie 5 §36). */
export async function resetAllData(): Promise<void> {
  const db = getDatabase();
  for (const table of TABLES_EXPORTEES) {
    await db.executeSql(`DELETE FROM ${table}`);
  }
}
