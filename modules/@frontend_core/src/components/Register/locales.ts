import i18n from '../../utils/i18n';
import feedbackEn from 'zxcvbn-i18n/dist/i18n/en.json';
import feedbackFr from 'zxcvbn-i18n/dist/i18n/fr.json';

i18n.addResourceBundle('en', 'registration', {
    email_label: 'email',
    email_placeholder: 'Email address',
    password_label: 'password',
    password_placeholder: 'Password',
    password_confirmation_label: 'Password confirmation',
    username_label: 'username',
    username_placeholder: 'Username',
    register: 'Register',
    login_switch: 'Already registered ? Login here !',

    // errors
    email_required: 'email is required',
    invalid_email: 'email must be a valid email',
    email_already_in_use: 'this email is already in use',
    password_required: 'password is required',
    username_required: 'username is required',
    username_too_short: 'username is too short (min. 4 characters)',
    username_too_long: 'username is too long (max. 20 characters)',
    username_already_in_use: 'this username is already in use',
    address_already_in_use: 'this address is already in use',
    different_password: 'both password need to be the same',
});
i18n.addResourceBundle('fr', 'registration', {
    email_label: 'email',
    email_placeholder: 'Addresse email',
    password_label: 'mot de passe',
    password_placeholder: 'Mot de passe',
    password_confirmation_label: 'Confirmation du mot de passe',
    username_label: "nom d'utilisateur",
    username_placeholder: "Nom d'utilisateur",
    register: 'Inscription',
    login_switch: 'Déjà un compte ? Connectez vous ici !',

    // errors
    email_required: 'email requis',
    invalid_email: "le format de l'adresse email est incorrect",
    email_already_in_use: 'cette addresse email est déjà utilisée',
    password_required: 'mot de passe requis',
    username_required: "nom d'utilisateur requis",
    username_too_short: "nom d'utilisateur trop court (min. 4 caractères)",
    username_too_long: "nom d'utilisateur trop long (max. 20 caractères)",
    username_already_in_use: "ce nom d'utilisateur est déjà utilisé",
    address_already_in_use: 'cette addresse est déjà utilisée',
    different_password: 'les mots de passe doivent être identiques',
});

i18n.addResourceBundle('en', 'password_feedback', {
    ...feedbackEn,
    password_required: 'password is required',
});
i18n.addResourceBundle('fr', 'password_feedback', {
    ...feedbackFr,
    password_required: 'mot de passe requis',
});
