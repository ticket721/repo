import i18n from '../../utils/i18n';

i18n.addResourceBundle('en', 'validate_route', {
    message: 'Processing email verification',
    email_confirmed: 'Successfuly verified !',
    invalid_signature: 'Token invalid',
    internal_server_error: 'Internal Server Error',
});
i18n.addResourceBundle('fr', 'validate_route', {
    message: "En cours de vérification de l'adresse email",
    email_confirmed: 'Email vérifié !',
    invalid_signature: 'Invalide token',
    internal_server_error: 'Erreur provenant du serveur',
});
