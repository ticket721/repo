import i18n from '@frontend/core/lib/utils/i18n'

i18n.addResourceBundle('en', 'scanner', {
    scan_again: 'Scan',
    valid: 'Ticket valid',
    filter_btn_label: 'Filter categories',
    category: '{{count}} category',
    category_plural: '{{count}} categories',
    every_categories: 'Every categories',
});
i18n.addResourceBundle('fr', 'scanner', {
    scan_again: 'Scannez',
    valid: 'Ticket valide',
    filter_btn_label: 'Filtrer les catégories',
    category: '{{count}} catégorie',
    category_plural: '{{count}} catégories',
    every_categories: 'Toutes les catégories',
});

i18n.addResourceBundle('en', 'verify_errors', {
    error_title: 'Error #{{count}}',
    ticket_not_found: 'Ticket not found',
    internal_server_error: 'Internal server error',
    invalid_event: 'Invalid event',
    invalid_user: 'Invalid User',
    invalid_date: 'Invalid Date',
    invalid_category: 'Invalid Category',
    expired_qr: 'Expired qrcode',
    invalid_time_zone: 'Invalid timezone',
    already_checked: 'Already checked',
    invalid_qrcode: 'Invalid qrcode',
});
i18n.addResourceBundle('fr', 'verify_errors', {
    error_title: 'Erreur #{{count}}',
    ticket_not_found: 'Ticket non existant',
    internal_server_error: 'Erreur de serveur interne',
    invalid_event: 'Évènement invalide',
    invalid_user: 'Utilisateur invalide',
    invalid_date: 'Date invalide',
    invalid_category: 'Catégorie invalide',
    expired_qr: 'Qrcode expiré',
    invalid_time_zone: 'Timezone invalide',
    already_checked: 'Déjà vérifié',
    invalid_qrcode: 'Qrcode invalide',
});
