import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { initDatabase } from './src/data/db';

export default function App() {
  const scheme = useColorScheme();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Ouverture rapide de l'app : on n'attend pas le scan complet de la
    // bibliothèque, seulement l'ouverture de la base locale (Partie 7 §39).
    initDatabase()
      .then(() => setReady(true))
      .catch((err) => {
        console.warn('Erreur initialisation base locale', err);
        setReady(true); // l'app doit rester utilisable même en cas de souci de base
      });
  }, []);

  if (!ready) {
    return null; // TODO: écran de démarrage minimal si l'ouverture DB devient lente
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
