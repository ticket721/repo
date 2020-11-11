import i18n from '@frontend/core/lib/utils/i18n';

i18n.addResourceBundle('en', 'event_menu', {
    dates_title: 'Dates',
    general_infos: 'General Informations',
    publish: 'Make event visible',
    published: 'Event visible',
    preview_banner: 'Preview',
    event_fetch_error: 'Unable to fetch event',
    no_stripe_interface: 'You need to provide your bank account and other informations first',
    stripe_not_ready: 'Please complete your KYC forms and wait for validation',
    invalid_stripe_interface: 'An error occured, please provide your informations again',
});

i18n.addResourceBundle('fr', 'event_menu', {
    dates_title: 'Dates',
    general_infos: 'Informations générales',
    publish: 'Rendre l\'évènement visible',
    published: 'Évènement visible',
    preview_banner: 'Prévisualisation',
    event_fetch_error: 'Impossible de récuperer l\'évènement',
    no_stripe_interface: 'Vous devez fournir un compte bancaire et d\'autres informations pour commencer',
    stripe_not_ready: 'Veuillez completer les formulaires de KYC et attendre leurs validations',
    invalid_stripe_interface: 'Une erreur est survenue, veuillez fournir vos informations à nouveau',
});
