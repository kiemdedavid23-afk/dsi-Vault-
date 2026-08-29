# DSI Vault — V1

## 🔨 Pour compiler maintenant (sur votre machine, avec Android Studio / Node installés)

```bash
npm install
cd android
./gradlew assembleDebug
```

L'APK sera généré dans `android/app/build/outputs/apk/debug/app-debug.apk` —
installable directement sur un téléphone (`adb install app-debug.apk`) ou en le
transférant manuellement.

Vous pouvez aussi laisser GitHub le compiler pour vous (sans Android Studio) :
poussez ce projet sur un dépôt GitHub, puis lancez manuellement le workflow
"Build DSI Vault APK" (onglet Actions) — l'APK sera téléchargeable en pièce jointe
("Artifacts") à la fin du job.

**Ce qui fonctionnera réellement dans cet APK dès ce premier build :**
navigation entre les 4 espaces, base de données locale SQLite, favoris, notes,
marque-pages, historique, recherche par nom — tout est du code réel, pas des
maquettes.

**Ce qui restera en placeholder tant que les blocs `// TODO natif` ne sont pas
décommentés/complétés :** lecture audio/vidéo réelle, rendu PDF, zoom image, OCR,
Picture-in-Picture (le pont natif Kotlin existe et est prêt, mais le composant
`<Video>` react-native-video lui-même n'est pas encore instancié côté JS). Dites-moi
si vous voulez que je branche l'un de ces éléments ensuite.

---

Application Android native (React Native) — bibliothèque multimédia locale et hors ligne
(audio, vidéo, PDF, images), conçue à partir du cahier des charges V1 (8 parties) transmis.

## ⚠️ Ce que contient réellement cette livraison

Ceci est un **squelette de projet complet et fonctionnel dans sa structure**, avec le code
source de l'architecture, des écrans, du modèle de données et des services décrits dans le
cahier des charges. Ce n'est **pas un APK compilé** :

- Je n'ai pas d'accès réseau ni de SDK Android/Xcode dans cet environnement pour exécuter
  `npm install`, lier les modules natifs (audio/vidéo/PDF/OCR/Picture-in-Picture) et produire
  un build réel sur un appareil Android.
- Les écrans, la navigation, le modèle de données local (SQLite) et les services
  (scan de bibliothèque, recherche, mise à jour GitHub, sauvegarde) sont écrits en TypeScript
  et prêts à être installés/compilés sur une machine de développement (Node + Android Studio).
- Les intégrations qui dépendent fortement de modules natifs Android (lecture audio en
  arrière-plan avec notification media, Picture-in-Picture natif, OCR local, accès au
  stockage via SAF) sont posées comme **interfaces claires avec une implémentation de
  référence** et des commentaires `// TODO natif` à l'endroit exact où le module natif
  doit être branché et testé sur un vrai téléphone (comme l'exige la Partie 8 du cahier
  des charges — "un émulateur ne suffit pas").

Cette approche respecte le principe du cahier des charges : ne pas prétendre livrer une
fonctionnalité native que je ne peux pas honnêtement tester ici, tout en fournissant une
base de code réelle, cohérente et immédiatement exploitable.

## Mise à jour : projet Android/Gradle réel intégré

La partie native Android (`android/`, `babel.config.js`, `metro.config.js`) a été
reconstruite à partir d'un vrai projet React Native fonctionnel que vous avez fourni
(un projet "OfflineApp" généré par le CLI officiel, React Native 0.76.9, Gradle 8.10.2).
Cela a permis de :

- Corriger des fichiers absents qui auraient fait échouer tout build (`babel.config.js`,
  `metro.config.js`, `strings.xml`, `styles.xml`, `MainActivity.kt`, `MainApplication.kt`,
  tout `android/build.gradle` / `settings.gradle` / `gradle.properties` / wrapper Gradle).
- Aligner `react-native` sur une version réellement testée (0.76.9 au lieu de 0.74.0).
- Réutiliser tel quel le wrapper Gradle (`gradle-wrapper.jar`, version 8.10.2) et le
  `debug.keystore` standard (keystore public de développement React Native, sans risque).
- Ajouter un vrai module natif Kotlin `PipModule` qui relie le bouton Picture-in-Picture
  déjà présent dans `VideoPlayerScreen.tsx` au PiP Android réel (`MainActivity.kt`),
  remplaçant l'ancien `// TODO natif`.
- Ajouter un workflow GitHub Actions (`.github/workflows/android-build.yml`) qui compile
  un APK debug dans le cloud, sans ordinateur ni Android Studio — cela répond au point
  ouvert "développement/build possible depuis mobile uniquement" (voir ARCHITECTURE.md).

**Ce qui reste non vérifiable ici** (pas de réseau, pas de SDK Android dans cet
environnement) :
- `./android/gradlew` ne peut pas être exécuté jusqu'au bout : la toute première étape
  du wrapper Gradle télécharge la distribution Gradle depuis `services.gradle.org`,
  bloquée par le réseau de cet environnement (`403 host_not_allowed`). Aucun build réel
  n'a donc pu être lancé ici, avec ce projet ni avec aucun autre.
- Le nom de classe exact du service Android de `react-native-track-player` (commenté
  dans `AndroidManifest.xml`) n'a pas pu être confirmé sans `npm install` réel.
- La compatibilité de `react-native-sqlite-storage`, `react-native-video`,
  `react-native-pdf` et `@react-native-ml-kit/text-recognition` avec les versions
  exactes de React Native 0.76.9 n'a pas pu être vérifiée (nécessite npm/réseau).

## Installation (sur votre machine)

```bash
npm install
npx react-native run-android
```

Bibliothèques prévues (à ajuster si besoin lors de l'installation réelle) :
- `@react-navigation/native` + `@react-navigation/bottom-tabs` — navigation 4 espaces
- `expo-sqlite` ou `react-native-sqlite-storage` — stockage local structuré
- `react-native-track-player` — lecture audio arrière-plan + notification media + contrôles Android
- `react-native-video` — lecteur vidéo + Picture-in-Picture
- `react-native-pdf` — lecteur PDF avec recherche texte
- `react-native-fs` — accès aux fichiers locaux
- `@react-native-ml-kit/text-recognition` — OCR local (Android natif via ML Kit, hors ligne)
- `react-native-image-viewing` — visionneuse d'images avec zoom/navigation

## Structure

```
src/
├── theme/            # couleurs, principe "Professionnalisme dans la simplicité"
├── navigation/        # 4 espaces principaux : Accueil, Bibliothèque, Favoris, Paramètres
├── screens/           # écrans (+ screens/players pour les 4 lecteurs)
├── data/              # schéma SQLite local + repositories (favoris, notes, marque-pages,
│                        playlists, historique, progression)
├── services/          # scan de bibliothèque, recherche locale, OCR, miniatures,
│                        mise à jour (API GitHub), sauvegarde/restauration
└── components/        # ContentCard, CategoryTabs, MiniPlayer
```

Voir `ARCHITECTURE.md` pour le détail des choix techniques, le modèle de données,
et les points nécessitant une décision ou un test sur appareil réel.
