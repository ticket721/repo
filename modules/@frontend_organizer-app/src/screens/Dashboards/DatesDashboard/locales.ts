import i18n from '@frontend/core/lib/utils/i18n';

i18n.addResourceBundle('en', 'dates_dashboard', {
    no_date_msg: 'There is no date for this event',
    create_date: 'Create date',
    seats: 'seats',
    from: 'From',
    free: 'Free',
    preview: 'Preview',
    live: 'Live',
    event_fetch_error: 'Unable to fetch event',
    dates_fetch_error: 'Unable to fetch dates',
    categories_fetch_error: 'Unable to fetch categories',
    status_already_in_state: 'This date is already in {{status}} mode',
    toggle_error: 'An error occured while updating date status',
});

i18n.addResourceBundle('fr', 'dates_dashboard', {
    no_date_msg: 'Il n\'y a aucune date pour cet évènement',
    create_date: 'Créer une date',
    seats: 'places',
    from: 'À partir de',
    free: 'Gratuit',
    preview: 'Preview',
    live: 'Live',
    event_fetch_error: 'Impossible de récuperer l\'évènement',
    dates_fetch_error: 'Impossible de récuperer les dates',
    categories_fetch_error: 'Impossible de récuperer les catégories',
    status_already_in_state: 'Cette date est déjà en {{status}}',
    toggle_error: 'Une erreur est survenue durant le changement de statut de la date',
});
