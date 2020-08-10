import i18n from '../../utils/i18n';

i18n.addResourceBundle('en', 'login', {
    email_label: 'email',
    email_placeholder: 'Email address',
    password_label: 'password',
    password_placeholder: 'Password',
    login: 'Login',
    register_switch: 'First time using the app ? Register here !',
    forget_password: 'Forget password ?',

    // errors
    email_required: 'email is required',
    password_required: 'password is required',
});
i18n.addResourceBundle('fr', 'login', {
    email_label: 'email',
    email_placeholder: 'Addresse email',
    password_label: 'mot de passe',
    password_placeholder: 'Mot de passe',
    login: 'Connexion',
    register_switch: "Première fois que vous utilisez l'app ? Inscrivez vous ici !",
    forget_password: 'Mot de passe oublié ?',

    // errors
    email_required: 'email requis',
    password_required: 'mot de passe requis',
});
