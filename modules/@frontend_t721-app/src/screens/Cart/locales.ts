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
    remove_tickets_title: 'Cart too heavy !',
    remove_amount: 'Remove {{count}} ticket to proceed',
    remove_amount_plural: 'Remove {{count}} tickets to proceed',
    remove_validate: 'Validate Cart',
    remove_tickets_cart_total: 'New Total',
    fees: 'fees',

    error_category_sold_out: 'Tickets Sold Out',
    error_category_sold_out_description: 'The following tickets are not available anymore',
    error_sale_ended: 'Tickets Sale Ended',
    error_sale_ended_description: 'The following tickets are not available anymore',
    error_sale_not_started: 'Tickets Sale not Started',
    error_sale_not_started_description: 'The following tickets are not in sale at the moment',
    error_category_not_available: 'Ticket category unavailable',
    error_category_not_available_description: 'You should not be able to see this category ...',

    errors_tickets_explainer:
        'Errors have occured with your cart, The following tickets are being removed from it.',
    errors_tickets_title: 'Oh no ... something went wrong',
    errors_validate: 'Ok ... I\'m not mad at you',
    errors_tickets_cart_total: 'New Total',
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
    remove_tickets_title: 'Panier trop lourd !',
    remove_amount: 'Retirez {{count}} ticket pour continuer',
    remove_amount_plural: 'Retirez {{count}} tickets pour continuer',
    remove_validate: 'Valider Panier',
    remove_tickets_cart_total: 'Nouveau Total',
    fees: 'taxes',

    error_category_sold_out: 'Tickets Epuises',
    error_category_sold_out_description: 'Ces tickets ne sont plus disponibles',
    error_sale_ended: 'Fin de vente',
    error_sale_ended_description: 'Ces tickets ne sont plus en vente',
    error_sale_not_started: 'Vente non debutee',
    error_sale_not_started_description: 'Ces tickets ne sont pas encore en vente',
    error_category_not_available: 'Categorie de tickets non disponible',
    error_category_not_available_description: 'Vous ne devriez pas pouvoir voir ces tickets ...',

    errors_tickets_explainer:
        'Des erreurs ont eu lieu avec votre panier. Les tickets suivants sont retires.',
    errors_tickets_title: 'Oops ... un probleme est survenu',
    errors_validate: 'Ok ... c\'est pas grave',
    errors_tickets_cart_total: 'Nouveau Total',
});
