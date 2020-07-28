import {Plugins}  from '@capacitor/core';

if (Plugins.IosSwipeBack) {
    Plugins.IosSwipeBack
        .enable()
        .catch(e => console.warn('Cannot set IOSSwipeBack'))
}
