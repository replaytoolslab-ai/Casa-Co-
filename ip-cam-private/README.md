# IP CAM PRIVATE

App Android nativa per usare uno o più telefoni come telecamere IP sulla rete Wi-Fi locale e un telefono come unità CONTROLLO con archivio centrale.

## Requisiti
- Android Studio recente
- JDK 17
- Android SDK API 36
- Connessione Wi-Fi locale condivisa tra i dispositivi

## Apertura
1. Aprire in Android Studio la cartella `ip-cam-private`.
2. Attendere la sincronizzazione Gradle.
3. Collegare un dispositivo Android o avviare un emulatore.
4. Eseguire la variante `debug`.

## Build da terminale
```bash
./gradlew clean testDebugUnitTest assembleDebug
```

L'APK debug viene generato in `app/build/outputs/apk/debug/`.

## Build con Codemagic
Collegare il repository GitHub a Codemagic e selezionare il file `codemagic.yaml`. Per la prima build debug non serve una chiave di firma personale.

## Privacy e rete
- Streaming e controllo sono progettati per la rete locale.
- Camera e microfono richiedono i permessi Android.
- Le riprese devono essere avviate in modo visibile dall'utente.
- Non configurare chiavi o password nel repository.
