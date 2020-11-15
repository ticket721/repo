import i18n from '../../utils/i18n';
import feedbackEn from 'zxcvbn-i18n/dist/i18n/en.json';
import feedbackFr from 'zxcvbn-i18n/dist/i18n/fr.json';

i18n.addResourceBundle('en', 'reset_form', {
    password_label: 'new password',
    password_placeholder: 'Password',
    password_confirmation_label: 'password confirmation',
    password_confirmation_placeholder: 'Password',
    invalid_token: 'Invalid token',

    reset: 'Change my password',

    // errors
    email_required: 'email is required',
    password_required: 'password is required',
    password_confirmation_required: 'password confirmation is required',
    different_password: 'both password need to be the same',
    reset_form_success: 'Password changed',
    reset_form_error: 'An error occured',
});
i18n.addResourceBundle('fr', 'reset_form', {
    password_label: 'nouveau mot de passe',
    password_placeholder: 'Mot de passe',
    password_confirmation_label: 'confirmation du mot de passe',
    password_confirmation_placeholder: 'Mot de passe',
    invalid_token: 'Token invalide',

    reset: 'Changer mon mot de passe',

    // errors
    email_required: 'email requis',
    password_required: 'mot de passe requis',
    password_confirmation_required: 'confirmation de mot de passe requise',
    different_password: 'les mots de passe doivent être identiques',
    reset_form_success: 'Mot de passe modifié',
    reset_form_error: 'Erreur, impossible de modifier le mot de passe',
});

i18n.addResourceBundle('en', 'password_feedback', {
    ...feedbackEn,
    password_required: 'password is required',
});

i18n.addResourceBundle('fr', 'password_feedback', {
    ...feedbackFr,
    password_required: 'mot de passe requis',
});
