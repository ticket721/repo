import { ScreenOrientation } from '@ionic-native/screen-orientation';

ScreenOrientation.lock(ScreenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY)
    .then(() => {
        console.log(`[native]: properly locked orientation to portrait`)
    })
    .catch((e: Error) => {
        console.warn('[native] unable to lock orientation')
    });
