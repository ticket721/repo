import i18n from '../../utils/i18n';

i18n.addResourceBundle('en', 'reset', {
    email_label: 'email',
    email_placeholder: 'Email address',
    instructions: 'Enter your email to receive instructions to reset your password',
    reset: 'Reset',
    cancel: 'Cancel',

    // errors
    email_required: 'email is required',
    password_required: 'password is required',
    reset_email_error: 'An error occured',
    reset_email_success: 'A reset email has been sent if the email is found on the system',
});
i18n.addResourceBundle('fr', 'reset', {
    email_label: 'email',
    email_placeholder: 'Addresse email',
    instructions: 'Entrez votre email pour recevoir les instructions pour réinitialiser votre mot de passe',
    reset: 'Réinitialiser',
    cancel: 'Annuler',

    // errors
    email_required: 'email requis',
    password_required: 'mot de passe requis',
    reset_email_error: 'Une erreur est survenue',
    reset_email_success: "Un email de réinitialisation a été envoyé si l'adresse est bien présente dans notre système",
});
