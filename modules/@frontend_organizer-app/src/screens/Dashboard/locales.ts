import i18n from '@frontend/core/lib/utils/i18n';

i18n.addResourceBundle('en', 'dashboard', {
    no_result_notif: 'You don\'t have any event yet',
    no_event: 'You don\'t have any event yet',
    loading_label: 'Loading...',
    reload_msg: 'An error occured, please reload the page',
    error_notif: 'Cannot retrieve your events, please reload the page',
});

i18n.addResourceBundle('fr', 'dashboard', {
    no_result_notif: 'Vous n\'avez aucun évènement pour l\'instant',
    no_event: 'Vous n\'avez aucun évènement pour l\'instant',
    loading_label: 'Chargement...',
    reload_msg: 'Une erreur est survenue, veuillez recharger la page',
    error_notif: 'Impossible de récuperer vos évènements, veuillez recharger la page',
});
