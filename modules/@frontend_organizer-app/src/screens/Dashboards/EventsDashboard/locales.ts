import i18n from '@frontend/core/lib/utils/i18n';

i18n.addResourceBundle('en', 'events_dashboard', {
    no_event_msg: 'You don\'t have any event yet',
    from: 'From',
    to: 'to',
    events_fetch_error: 'Unable to fetch your events',
    dates_fetch_error: 'Unable to fetch dates',
});

i18n.addResourceBundle('fr', 'events_dashboard', {
    no_event_msg: 'Vous n\'avez aucun évènement pour l\'instant',
    from: 'Du',
    to: 'au',
    events_fetch_error: 'Impossible de récuperer vos évènements',
    dates_fetch_error: 'Impossible de récuperer les dates',
});
