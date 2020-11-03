import i18n from '@frontend/core/lib/utils/i18n'

i18n.addResourceBundle('en', 'event_ticket_list', {
    title: 'Select a category',
    ticket_for_event: 'Ticket for event ',
    ticket_for_event_on: ' on ',
    ticket_for_event_and: ' and ',
    ticket_for_event_other_events: ' other events',
    fees: 'fees',
    total: 'Total',
    sold_out: 'Sold out',
    left: 'left',
    regular_category_description: 'These categories give you access to one event',
    global_category_description: 'These categories give you access to several events',
    checkout: 'Add to cart',
    available_in: 'Available in',
    sale_ends_in: 'Sale ends in',
    online: 'Online',
    free: 'Free',
    no_categories: 'Ticket sale coming soon.',
    login_or_register: 'Login or Register',

    error_cannot_fetch_global_categories: 'Cannot fetch event',
    error_cannot_fetch_categories: 'Cannot fetch event',
    error_cannot_fetch_event: 'Cannot fetch event',
    error_cannot_fetch_dates: 'Cannot fetch event',

    category_limit_reached: 'You reached the maximum amount of tickets for this category !',
    online_category_limit_reached: 'You reached the maximum amount of tickets for this category !',
    ticket_per_cart_limit_reached: 'You reached the maximum amount of tickets allowed in a cart !',
    no_tickets_left: 'There are no tickets left for this category !',
    sale_ended: 'The sale for this category ended !',
    category_not_live: 'This category is not available at the moment !',
    multiple_group_ids: 'You cannot add tickets from different events in the cart !'
});

i18n.addResourceBundle('fr', 'event_ticket_list', {
    title: 'Sélectionnez une catégorie',
    ticket_for_event: 'Ticket pour l\'évènement ',
    ticket_for_event_on: ' le ',
    ticket_for_event_and: ' et ',
    ticket_for_event_other_events: ' autres évènements',
    fees: 'taxes',
    total: 'Total',
    sold_out: 'Epuisé',
    left: 'restant',
    regular_category_description: 'Ces catégories donnent accès à un évènement',
    global_category_description: 'Ces categories donnent accès à plusieurs évènements',
    checkout: 'Ajouter au panier',
    available_in: 'Disponible dans',
    sale_ends_in: 'Fin de la vente dans',
    online: 'En ligne',
    free: 'Gratuit',
    no_categories: 'Vente de billets bientôt disponible.',
    login_or_register: 'Connectez vous',

    error_cannot_fetch_global_categories: 'Informations indisponibles',
    error_cannot_fetch_categories: 'Informations indisponibles',
    error_cannot_fetch_event: 'Informations indisponibles',
    error_cannot_fetch_dates: 'Informations indisponibles',

    category_limit_reached: 'Vous avez atteint la limite de tickets pour cette catégorie !',
    online_category_limit_reached: 'Vous avez atteint la limite de tickets pour cette catégorie !',
    ticket_per_cart_limit_reached: 'Vous avez atteint la limite de tickets que peut contenir un panier !',
    no_tickets_left: 'Aucun ticket disponible pour cette catégorie !',
    sale_ended: 'La vente pour cette catégorie est finie !',
    category_not_live: 'Cette catégorie n\'est pas disponible !',
    multiple_group_ids: 'Vous ne pouvez pas ajouter de tickets d\'événements differents dans le panier !'
});
