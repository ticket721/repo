import i18n from '../../utils/i18n';

i18n.addResourceBundle('en', 'validate_reset_password', {
    description: 'Enter your new password',
    password_label: 'password',
    password_placeholder: 'Password',
    password_confirmation_label: 'Password confirmation',
    different_password: 'both password need to be the same',
    reset_password: 'Change password',
    password_confirmed: 'Password successfully changed',

    // errors
    password_required: 'password is required',
    password_confirmation_required: 'password confirmation is required',
});

i18n.addResourceBundle('fr', 'validate_reset_password', {
    description: 'Entrez votre nouveau mot de passe',
    different_password: 'les mots de passe doivent être identiques',
    password_label: 'mot de passe',
    password_placeholder: 'Mot de passe',
    password_confirmation_label: 'Confirmation du mot de passe',
    reset_password: 'Modifier le mot de passse',
    password_confirmed: 'Mot de passe modifié avec succès',

    // errors
    password_required: 'mot de passe requis',
    password_confirmation_required: 'confirmation de mot de passe requise',
});
