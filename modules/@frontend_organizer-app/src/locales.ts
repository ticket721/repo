import i18n from '@frontend/core/lib/utils/i18n';

i18n.addResourceBundle('en', 'common', {
    retrying_in: 'retrying in',
    error_cannot_fetch: 'Error occured while fetching {{ entity }} entity',
});

i18n.addResourceBundle('fr', 'common', {
    retrying_in: 'nouvelle tentative dans',
    error_cannot_fetch: 'Une erreur est survenue durant la récupération de l\'entité {{ entity }}',
});
