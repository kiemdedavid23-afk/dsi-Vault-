export type ContentType = 'audio' | 'video' | 'pdf' | 'image' | 'autre';

/** Fichier détecté sur le téléphone. Le fichier original n'est jamais modifié (Partie 3 §3). */
export interface Content {
  id: string; // identifiant interne DSI Vault (voir hashIdentification)
  uri: string; // référence Android (chemin ou content:// selon la stratégie d'accès)
  nom: string;
  extension: string;
  type: ContentType;
  taille: number; // octets
  dateModification: number; // epoch ms
  hashIdentification: string; // Partie 8 §12 — le nom seul n'est pas fiable
  emplacement: string;
  disponible: boolean; // false si le fichier est devenu introuvable (Partie 3 §25-26)
  // métadonnées optionnelles selon le type
  metadonnees?: {
    titre?: string;
    artiste?: string;
    album?: string;
    duree?: number; // secondes, audio/vidéo
    pages?: number; // pdf
    largeur?: number; // image/vidéo
    hauteur?: number;
  };
}

export interface Progress {
  contentId: string;
  positionSecondes?: number; // audio/vidéo
  page?: number; // pdf
  misAJourLe: number;
}

export interface Favorite {
  contentId: string;
  ajouteLe: number;
}

export interface Note {
  id: string;
  contentId: string;
  texte: string;
  positionSecondes?: number;
  page?: number;
  creeLe: number;
}

export interface Bookmark {
  id: string;
  contentId: string;
  positionSecondes?: number;
  page?: number;
  creeLe: number;
}

export interface Playlist {
  id: string;
  nom: string;
  creeLe: number;
}

export interface PlaylistItem {
  playlistId: string;
  contentId: string;
  ordre: number;
}

export interface HistoryEntry {
  id: string;
  contentId: string;
  consulteLe: number;
}
