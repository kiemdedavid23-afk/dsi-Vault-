import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import LibraryScreen from '../screens/LibraryScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ContentInfoScreen from '../screens/ContentInfoScreen';
import AudioPlayerScreen from '../screens/players/AudioPlayerScreen';
import VideoPlayerScreen from '../screens/players/VideoPlayerScreen';
import PdfViewerScreen from '../screens/players/PdfViewerScreen';
import ImageViewerScreen from '../screens/players/ImageViewerScreen';

import type { MainTabParamList, RootStackParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Structure fonctionnelle validée (Partie 2 §2) :
 * 4 espaces principaux — Accueil, Bibliothèque, Favoris, Paramètres.
 * Les écrans internes (lecteurs, fiche info) ne sont volontairement PAS
 * transformés en sections principales (Partie 2 §21).
 */
function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Bibliotheque" component={LibraryScreen} />
      <Tab.Screen name="Favoris" component={FavoritesScreen} />
      <Tab.Screen name="Parametres" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="ContentInfo" component={ContentInfoScreen} />
        <Stack.Screen
          name="AudioPlayer"
          component={AudioPlayerScreen}
          options={{ presentation: 'card' }}
        />
        <Stack.Screen
          name="VideoPlayer"
          component={VideoPlayerScreen}
          options={{ orientation: 'landscape' }}
        />
        <Stack.Screen name="PdfViewer" component={PdfViewerScreen} />
        <Stack.Screen name="ImageViewer" component={ImageViewerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
