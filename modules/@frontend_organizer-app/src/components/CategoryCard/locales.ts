import i18n from '@frontend/core/lib/utils/i18n';

i18n.addResourceBundle('en', 'category_card', {
    sold_tickets: 'sold tickets',
    seats: 'seats',
    free: 'Free',
    preview: 'Preview',
    live: 'Live',
    ticket_count_fetch_error: 'Unable to fetch tickets count',
    status_already_in_state: 'This category is already in {{status}} mode',
    no_live_date: 'No live date for this category',
    toggle_error: 'An error occured while updating category status',
});

i18n.addResourceBundle('fr', 'category_card', {
    sold_tickets: 'billets vendus',
    seats: 'places',
    free: 'Gratuit',
    preview: 'Preview',
    live: 'Live',
    ticket_count_fetch_error: 'Impossible de récuperer le compte des billets',
    status_already_in_state: 'Cette catégorie est déjà en {{status}}',
    no_live_date: 'Aucune date de cette catégorie n\'est actuellement live',
    toggle_error: 'Une erreur est survenue durant le changement de statut de la catégorie',
});
