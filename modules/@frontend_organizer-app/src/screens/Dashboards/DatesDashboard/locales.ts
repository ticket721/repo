import i18n from '@frontend/core/lib/utils/i18n';

i18n.addResourceBundle('en', 'dates_dashboard', {
    no_date_msg: 'There is no date for this event',
    create_date: 'Create date',
    seats: 'seats',
    no_category: 'No category',
    from: 'From',
    to: 'to',
    price_from: 'From',
    free: 'Free',
    preview: 'Preview',
    live: 'Live',
    status_already_in_state: 'This date is already in {{status}} mode',
    toggle_error: 'An error occured while updating date status',
    no_stripe_interface: 'You need to provide your bank account and other informations first',
    stripe_not_ready: 'Please complete your KYC forms and wait for validation',
});

i18n.addResourceBundle('fr', 'dates_dashboard', {
    no_date_msg: 'Il n\'y a aucune date pour cet évènement',
    create_date: 'Créer une date',
    seats: 'places',
    no_category: 'Aucune catégorie',
    from: 'Du',
    to: 'au',
    price_from: 'À partir de',
    free: 'Gratuit',
    preview: 'Preview',
    live: 'Live',
    status_already_in_state: 'Cette date est déjà en {{status}}',
    toggle_error: 'Une erreur est survenue durant le changement de statut de la date',
    no_stripe_interface: 'Vous devez fournir un compte bancaire et d\'autres informations pour commencer',
    stripe_not_ready: 'Veuillez completer les formulaires de KYC et attendre leurs validations',
});
