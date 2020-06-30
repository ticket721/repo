import i18n from '@frontend/core/lib/utils/i18n';

i18n.addResourceBundle('en', 'update_location', {
    location_label: 'Location',
    location_placeholder: 'Provide a location',
    save_changes: 'Save Changes',
});

i18n.addResourceBundle('fr', 'update_location', {
    location_label: 'Localisation',
    location_placeholder: 'Veuillez fournir une adresse',
    save_changes: 'Valider les changements',
});

i18n.addResourceBundle('en', 'validation', {
    location_required: 'location required',
});

i18n.addResourceBundle('fr', 'validation', {
    location_required: 'addresse requise',
});

i18n.addResourceBundle('en', 'errors', {
    google_api_error: 'something went wrong with location retrieve, please try again',
});

i18n.addResourceBundle('fr', 'errors', {
    google_api_error: 'echec de la récupération de l\'adresse, veuillez réessayer',
});
