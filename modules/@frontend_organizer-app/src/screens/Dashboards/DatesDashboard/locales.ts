import i18n from '@frontend/core/lib/utils/i18n';

i18n.addResourceBundle('en', 'dates_dashboard', {
    no_date_msg: 'There is no date for this event',
    create_date: 'Create date',
    seats: 'seats',
    from: 'From',
    free: 'Free',
    preview_mode: 'Preview mode',
    btn_name: '"Make event visible"',
    preview_banner_msg_1: 'This event is currently in ',
    preview_banner_msg_2: '. Click on ',
    preview_banner_msg_3: ' to make it accessible',
    dates_fetch_error: 'Unable to fetch dates',
    categories_fetch_error: 'Unable to fetch categories',
});

i18n.addResourceBundle('fr', 'dates_dashboard', {
    no_date_msg: 'Il n\'y a aucune date pour cet évènement',
    create_date: 'Créer une date',
    seats: 'places',
    from: 'À partir de',
    free: 'Gratuit',
    preview_mode: 'Mode preview',
    btn_name: '"Rendre l\'évènement visible"',
    preview_banner_msg_1: 'Cet évènement est en ',
    preview_banner_msg_2: '. Clickez sur ',
    preview_banner_msg_3: ' pour le rendre accessible',
    dates_fetch_error: 'Impossible de récuperer les dates',
    categories_fetch_error: 'Impossible de récuperer les catégories',
});
