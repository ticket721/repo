import i18n from '@frontend/core/lib/utils/i18n'

i18n.addResourceBundle('en', 'cart', {
    select_group_id_total: 'Total',
    select_group_id_option: 'Option #{{number}}',
    select_group_id_price: '{{price}} € + fees',
    select_group_id_explainer:
        'To help preventing robots and scripts from perfoming massive purchases, we restrict the cart content to one event only.',
    select_group_id_dates: '{{count}} dates',
    select_group_id_title: 'Select an option',
    remove_tickets_explainer:
        'To help preventing robots and scripts from perfoming massive purchases, we restrict the cart content to max 5 tickets.',
    remove_tickets_title: 'Cart too heavy !'
});

i18n.addResourceBundle('fr', 'cart', {
    select_group_id_total: 'Total',
    select_group_id_option: 'Option #{{number}}',
    select_group_id_price: '{{price}} € + taxes',
    select_group_id_explainer:
        'Pour minimiser les abus et achats massifs de robots et scripts, nous empechons le panier de contenir des places pour plusieurs evenements.',
    select_group_id_dates: '{{count}} dates',
    select_group_id_title: 'Selectionnez une option',
    remove_tickets_explainer:
        'Pour minimiser les abus et achats massifs de robots et scripts, nous empechons le panier de contenir plus de 5 tickets.',
    remove_tickets_title: 'Panier trop lourd !'
});
