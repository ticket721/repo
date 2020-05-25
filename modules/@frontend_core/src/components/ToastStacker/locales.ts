import i18n from '../../utils/i18n';

i18n.addResourceBundle('en', 'error_notifications', {
    cannot_reach_server: 'cannot reach server',
    invalid_credentials: 'wrong email or password',
    internal_server_error: 'internal server error',
    unauthorized_error: 'unauthorized',
});
i18n.addResourceBundle('fr', 'error_notifications', {
    cannot_reach_server: 'impossible de joindre le serveur',
    invalid_credentials: 'addresse email ou mot de passe incorrect',
    internal_server_error: 'erreur interne du serveur',
    unauthorized_error: 'non authorisé',
});

i18n.addResourceBundle('en', 'warning_notifications', {
    session_expired: 'Session expired. Please provide your ids again',
});
i18n.addResourceBundle('fr', 'warning_notifications', {
    session_expired: 'Session expirée. Veuillez rentrer a nouveau vos identifiants',
});

i18n.addResourceBundle('en', 'success_notifications', {
    successfully_registered: 'successfully registered',
});
i18n.addResourceBundle('fr', 'success_notifications', {
    successfully_registered: 'inscription réussite',
});

i18n.addResourceBundle('en', 'info_notifications', {
});
i18n.addResourceBundle('fr', 'info_notifications', {
});
