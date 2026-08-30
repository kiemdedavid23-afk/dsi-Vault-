package com.dsivault

import android.app.PictureInPictureParams
import android.content.res.Configuration
import android.os.Build
import android.util.Rational
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactApplication
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.modules.core.DeviceEventManagerModule

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "DSIVault"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  /**
   * Déclenchement réel du Picture-in-Picture natif Android (Partie 4 §18, Partie 7 §13).
   * Appelé depuis le module PipModule (voir PipModule.kt) quand l'utilisateur appuie
   * sur le bouton PiP dans VideoPlayerScreen.tsx, ou automatiquement quand
   * PipModule.setPipEnabled(true) a été appelé et que l'utilisateur quitte l'app
   * pendant une lecture vidéo (bouton Accueil / changement d'app).
   */
  fun enterPipModeIfSupported() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val params = PictureInPictureParams.Builder()
          .setAspectRatio(Rational(16, 9))
          .build()
      enterPictureInPictureMode(params)
    }
    // Sur Android < 8.0 (API 26), le PiP natif n'existe pas : DSI Vault doit se
    // comporter normalement (plein écran classique), sans tenter de le simuler.
  }

  private var pipEnabledFromJs: Boolean = false

  fun setPipEnabledFromJs(enabled: Boolean) {
    pipEnabledFromJs = enabled
  }

  override fun onUserLeaveHint() {
    super.onUserLeaveHint()
    // L'utilisateur quitte l'app (bouton Accueil, changement d'app) pendant une
    // lecture vidéo : bascule automatique en PiP si VideoPlayerScreen l'a autorisé.
    if (pipEnabledFromJs) {
      enterPipModeIfSupported()
    }
  }

  override fun onPictureInPictureModeChanged(
      isInPictureInPictureMode: Boolean,
      newConfig: Configuration,
  ) {
    super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig)
    // Informe le JS du changement d'état pour adapter l'interface
    // (masquer les contrôles en mode PiP réduit — Partie 4 §18).
    val reactContext =
        (application as ReactApplication).reactNativeHost.reactInstanceManager.currentReactContext
    reactContext
        ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        ?.emit("onPipModeChanged", isInPictureInPictureMode)
  }
}
