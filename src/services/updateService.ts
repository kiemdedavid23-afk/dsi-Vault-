/**
 * Mise à jour (Partie 7 §17-27) : utilise l'API REST GitHub, jamais bloquant,
 * jamais agressif. Internet reste secondaire — l'échec ne doit jamais empêcher
 * l'usage normal de DSI Vault (Partie 1 §6, Partie 6 §24).
 *
 * DÉCISION REQUISE : nom du dépôt GitHub hébergeant les releases (owner/repo).
 * Laissé en configuration plutôt qu'en dur.
 */
export interface UpdateConfig {
  owner: string;
  repo: string;
}

export interface ReleaseInfo {
  version: string;
  datePublication: string | null;
  notes: string;
  urlApk: string | null;
}

const APP_VERSION = '1.0.0'; // doit rester synchronisé avec app.json / build.gradle

export async function checkForUpdate(config: UpdateConfig): Promise<ReleaseInfo | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/releases/latest`,
    );
    if (!response.ok) {
      // Serveur indisponible : ne pas bloquer, ne pas afficher d'erreur critique (Partie 7 §25).
      return null;
    }
    const data = await response.json();
    const tag: string = data.tag_name?.replace(/^v/, '') ?? '';

    if (!tag || tag === APP_VERSION) return null; // pas de nouvelle version

    const apkAsset = (data.assets ?? []).find((a: any) => a.name?.endsWith('.apk'));

    return {
      version: tag,
      datePublication: data.published_at ?? null,
      notes: data.body ?? '',
      urlApk: apkAsset?.browser_download_url ?? null,
    };
  } catch (err) {
    // Absence de réseau ou erreur réseau : silencieux, la bibliothèque reste disponible.
    console.warn('Vérification de mise à jour impossible pour le moment.', err);
    return null;
  }
}

export function getInstalledVersion(): string {
  return APP_VERSION;
}

/**
 * // TODO natif : le téléchargement + lancement de l'installateur Android (hors Play
 * Store) nécessite un intent natif (ACTION_VIEW avec FileProvider) — Partie 7 §21-22.
 * DSI Vault ne doit jamais contourner les mécanismes de sécurité Android.
 */
export async function downloadAndInstall(): Promise<never> {
  throw new Error('downloadAndInstall: intégration native non branchée (voir // TODO natif).');
}
