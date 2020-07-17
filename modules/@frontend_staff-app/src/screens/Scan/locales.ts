import i18n from '@frontend/core/lib/utils/i18n'

i18n.addResourceBundle('en', 'scanner', {
    scan_again: 'Scan',
    valid: 'Ticket valid',
});
i18n.addResourceBundle('fr', 'scanner', {
    scan_again: 'Scannez',
    valid: 'Ticket valide',
});

i18n.addResourceBundle('en', 'verify_errors', {
    ticket_not_found: 'Error #1: Ticket not found',
    internal_server_error: 'Error #2: Internal server error',
    invalid_category: 'Error #3: Category invalid',
    invalid_user: 'Error #4: User invalid',
    expired_qr: 'Error #5: Expired qrcode',
    invalid_time_zone: 'Error #6: Invalid timezone',
    retry: 'Retry',
});
i18n.addResourceBundle('fr', 'verify_errors', {
    ticket_not_found: 'Error #1: Ticket non existant',
    internal_server_error: 'Error #2: Erreur de serveur interne',
    invalid_category: 'Error #3: Catégorie invalide',
    invalid_user: 'Error #4: Utilisateur invalide',
    expired_qr: 'Error #5: Qrcode expiré',
    invalid_time_zone: 'Error #6: Timezone invalide',
    retry: 'Essayez à nouveau',
});
