import i18n from '@frontend/core/lib/utils/i18n';

i18n.addResourceBundle('en', 'categories', {
    global_tab: 'Global Passes',
    global_desc: 'A Global Pass corresponds to a ticket valid for all dates',
    date_specific_tab: 'Tickets',
    date_specific_desc: 'A Normal Category corresponds to a ticket which can be applied to several dates',
    create_category: 'Create New Category',
    select_dates_label: 'Dates',
    select_dates_placeholder: 'select date(s)',
    all_dates: 'All dates',
});

i18n.addResourceBundle('fr', 'categories', {
    global_tab: 'Pass globaux',
    global_desc: 'Un pass globale correspond à une catégorie valide pour toutes les dates',
    date_specific_tab: 'Tickets',
    date_specific_desc: 'Un ticket classique correspond a une catégorie qui peut être appliquée à plusieurs dates',
    create_category: 'Créer Une Catégorie',
    select_dates_label: 'Dates',
    select_dates_placeholder: 'sélectionner une/des dates',
    all_dates: 'Toutes les dates',
});

i18n.addResourceBundle('en', 'create_date', {
    create_date: 'Create New Date',
});

i18n.addResourceBundle('fr', 'create_date', {
    create_date: 'Créer une date',
});
