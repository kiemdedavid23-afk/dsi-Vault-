# DSI Vault V1 — Rapport d'architecture

## A. Compréhension du projet

DSI Vault est une application Android native (React Native) qui indexe et donne accès aux
fichiers déjà présents sur le téléphone (audio, vidéo, PDF, images), sans les déplacer ni
les modifier. Elle fonctionne principalement hors ligne ; Internet ne sert qu'à vérifier
et récupérer une nouvelle version de l'application via l'API REST GitHub. Le principe
directeur est "Professionnalisme dans la simplicité" : peu de fonctionnalités, mais fiables
et bien intégrées à Android (permissions, lecture arrière-plan, Picture-in-Picture,
partage, réception de fichiers).

## B. Architecture proposée

```
DSI Vault
├── UI (React Native + React Navigation)
├── Bibliothèque (scan, index, filtres, tri)
├── Recherche locale (nom, métadonnées, texte PDF, OCR)
├── Lecteurs (Audio / Vidéo / PDF / Images)
├── Données personnelles (Favoris, Notes, Marque-pages, Historique, Playlists, Progression)
├── Indexation (SQLite local)
├── OCR (ML Kit local, en arrière-plan)
├── Stockage local (SQLite + fichiers internes : miniatures, cache)
├── Intégration Android (permissions, PiP, notifications media, partage, intents)
└── Mise à jour (vérification GitHub Releases)
```

Chaque module est indépendant et ne connaît des autres que via des interfaces
(`src/data/*Repository.ts`, `src/services/*.ts`), pour rester évolutif sans sur-architecture.

## C. Technologies proposées

| Besoin | Choix | Pourquoi | Limites |
|---|---|---|---|
| Stockage structuré local | SQLite (`expo-sqlite` / `react-native-sqlite-storage`) | Robuste, transactionnel, fonctionne hors ligne, adapté à une bibliothèque potentiellement grande | Nécessite des migrations gérées manuellement (prévu dans `src/data/db.ts`) |
| Accès fichiers | `react-native-fs` | API simple pour lister/lire les emplacements autorisés | Sur Android 10+, doit composer avec le stockage scellé (SAF) — voir Partie 6 §13 |
| Audio | `react-native-track-player` | Lecture arrière-plan native, notification media, contrôles écran verrouillé/Bluetooth déjà gérés par la librairie | Nécessite configuration native (service Android) — à tester sur appareil réel |
| Vidéo | `react-native-video` | Picture-in-Picture natif Android supporté, contrôle plein écran | PiP nécessite l'activité Android en mode `supportsPictureInPicture` — modification `AndroidManifest.xml` fournie |
| PDF | `react-native-pdf` | Navigation par page, zoom, recherche texte si le PDF contient du texte réel | Recherche non disponible sur PDF scanné sans OCR préalable |
| OCR | ML Kit Text Recognition (via `@react-native-ml-kit/text-recognition`) | 100% local, hors ligne, pas d'envoi cloud | Précision variable selon qualité du scan ; exécution en arrière-plan à planifier (§25 Partie 4) |
| Mise à jour | `fetch` vers l'API REST GitHub (`/repos/{owner}/{repo}/releases/latest`) | Décision validée dans le cahier des charges (Partie 7 §17) | Dépend de la disponibilité de GitHub ; géré en best-effort, jamais bloquant |

Aucune de ces bibliothèques n'a été choisie "parce qu'elle est populaire" (Partie 8 §5) :
chacune correspond à une exigence fonctionnelle explicite du cahier des charges.

## D. Modèle de données (SQLite local)

```
Content (id, uri, nom, type[audio|video|pdf|image|autre], taille, date_modif,
         chemin_affichage, hash_identification, cree_le)
Progress        (content_id → Content, position_secondes | page, mis_a_jour_le)
Favorite        (content_id → Content, ajoute_le)
Note            (id, content_id → Content, texte, position_secondes | page | null, cree_le)
Bookmark        (id, content_id → Content, position_secondes | page, cree_le)
Playlist        (id, nom, cree_le)
PlaylistItem    (playlist_id → Playlist, content_id → Content, ordre)
HistoryEntry    (id, content_id → Content, consulte_le)
Preference      (cle, valeur)
```

`hash_identification` répond à la Partie 8 §12 : le nom de fichier seul n'est pas fiable
(deux fichiers homonymes). Le hash combine taille + date de modification + un extrait du
contenu (fallback si le hash complet est trop coûteux sur un gros fichier), recalculé et
réconcilié lors d'un nouveau scan (Partie 3 §9).

## E. Lecteurs

- **Audio** : `TrackPlayer` avec file de lecture et playlists distinctes (Partie 5 §26) ;
  notification media (titre/artiste/pochette/précédent/pause/suivant) ; mini-lecteur React
  affiché tant qu'un morceau est actif ; reprise via `Progress`.
- **Vidéo** : plein écran avec contrôles auto-masqués ; bouton retour Android quitte
  d'abord le plein écran (Partie 2 §22) ; PiP déclenché à la sortie d'écran si le contexte
  Android le permet.
- **PDF** : navigation page à page, zoom, recherche texte native si disponible, sinon
  fallback sur l'index OCR local.
- **Images** : zoom/pan, navigation entre images du même dossier, diaporama simple
  (pas d'édition photo — hors périmètre V1).

## F. Hors ligne

Toutes les fonctions de la Partie 6 (bibliothèque, recherche, lecteurs, favoris, notes,
marque-pages, historique, playlists, reprise) reposent uniquement sur SQLite + fichiers
locaux — aucun appel réseau n'est fait par ces modules. Seul `updateService.ts` fait un
appel réseau, et uniquement à la demande ou en vérification discrète en arrière-plan,
jamais bloquant (§25 Partie 7).

## G. Mise à jour (GitHub)

`GET https://api.github.com/repos/<owner>/<repo>/releases/latest` → comparaison du tag
avec la version installée (`package.json` / `Config.APP_VERSION`) → si plus récent,
notification + écran d'information (changelog) → téléchargement de l'APK depuis l'asset
de la release → installation via l'intent Android standard (hors Play Store, avec
autorisation utilisateur explicite — Partie 7 §22). Échec réseau = message discret,
jamais d'erreur bloquante.

## H. Sécurité

- Permissions demandées uniquement quand nécessaires, avec explication en langage clair.
- Aucune donnée (fichiers, recherche, OCR) envoyée à un serveur.
- Stockage interne privé Android pour les données de DSI Vault.
- Verrouillage applicatif optionnel (biométrie / verrouillage système), non obligatoire.
- Sauvegarde exportée volontairement, non chiffrée en V1, avec avertissement explicite.

## I. Risques techniques identifiés (honnêtement)

1. **Accès au stockage sur Android 10+** : le modèle de fichiers "chemin absolu" ne
   fonctionne plus partout ; il faudra choisir entre MediaStore, SAF (Storage Access
   Framework), ou une combinaison — décision à valider avant de coder le scanner réel.
2. **OCR en arrière-plan** : ML Kit fonctionne bien pour de petits lots ; sur une grande
   bibliothèque de PDF scannés, il faudra fractionner le travail (WorkManager Android)
   pour respecter la contrainte batterie/CPU (Partie 6 §23-25).
3. **Picture-in-Picture** : comportement variable selon les fabricants Android — à tester
   sur plusieurs appareils réels, pas seulement un émulateur (exigence explicite Partie 8 §24).
4. **Identification fiable des fichiers** : le hash de contenu peut être coûteux sur de
   très gros fichiers vidéo — une stratégie hybride (métadonnées rapides + hash partiel)
   est proposée mais reste à valider en conditions réelles.
5. **Build et signature depuis mobile uniquement** : si le développement doit rester
   gérable sans ordinateur (comme observé sur d'autres projets de cette organisation), les
   builds React Native natifs (Android Studio / Gradle) sont nettement plus contraignants
   à produire depuis un téléphone qu'un simple Worker Cloudflare — point à clarifier tôt.

## J. Questions / points nécessitant une décision

- Quel mécanisme d'accès au stockage privilégier en priorité (MediaStore vs SAF vs
  dossiers sélectionnés manuellement) pour la V1 ?
- Le nom du dépôt GitHub qui hébergera les releases (nécessaire pour coder
  `updateService.ts` en dur ou via configuration) ?
- Le développement doit-il pouvoir se faire aussi depuis mobile (comme pour DSI Academy),
  ce qui orienterait vers GitHub Actions pour le build Android plutôt qu'un Android
  Studio local ?

Aucune de ces zones grises n'a été tranchée arbitrairement dans le code fourni : les
fichiers concernés contiennent des interfaces claires et des commentaires `// DÉCISION
REQUISE` à l'endroit exact où la réponse influence l'implémentation.
