package com.dsivault

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * Pont minimal entre VideoPlayerScreen.tsx et le Picture-in-Picture natif Android
 * (Partie 4 §18, Partie 7 §13). Remplace le `// TODO natif` laissé dans
 * declencherPiP() côté JS.
 *
 * Côté JS :
 *   import { NativeModules } from 'react-native';
 *   NativeModules.PipModule.enterPipMode();
 *   NativeModules.PipModule.setPipEnabled(true); // autorise le PiP auto au bouton Accueil
 */
class PipModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "PipModule"

  @ReactMethod
  fun enterPipMode() {
    (currentActivity as? MainActivity)?.enterPipModeIfSupported()
  }

  @ReactMethod
  fun setPipEnabled(enabled: Boolean) {
    (currentActivity as? MainActivity)?.setPipEnabledFromJs(enabled)
  }
}
