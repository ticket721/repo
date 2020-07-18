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
    ticket_not_found: 'Error #1: Ticket not found',
    internal_server_error: 'Error #2: Internal server error',
    invalid_event: 'Error #3: Invalid event',
    invalid_user: 'Error #4: Invalid User',
    invalid_date: 'Error #5: Invalid Date',
    invalid_category: 'Error #6: Invalid Category',
    expired_qr: 'Error #7: Expired qrcode',
    invalid_time_zone: 'Error #8: Invalid timezone',
    retry: 'Retry',
});
i18n.addResourceBundle('fr', 'verify_errors', {
    ticket_not_found: 'Error #1: Ticket non existant',
    internal_server_error: 'Error #2: Erreur de serveur interne',
    invalid_event: 'Error #3: Evènement invalide',
    invalid_user: 'Error #4: Utilisateur invalide',
    invalid_date: 'Error #5: Date invalide',
    invalid_category: 'Error #6: Catégorie invalide',
    expired_qr: 'Error #7: Qrcode expiré',
    invalid_time_zone: 'Error #8: Timezone invalide',
    retry: 'Essayez à nouveau',
});
