import i18n from '../../utils/i18n';

i18n.addResourceBundle('en', 'reset_password', {
    email_label: 'email',
    email_placeholder: 'Email address',
    go_back: 'Go back',
    send_reset_email: 'Send email',
    description: "Enter your user account's verified email address and we will send you a password reset link.",
    email_sent: 'Email sent successfully',

    // errors
    email_required: 'email is required',
});

i18n.addResourceBundle('fr', 'reset_password', {
    email_label: 'email',
    email_placeholder: 'Addresse email',
    go_back: 'Retour',
    send_reset_email: "Envoyer l'email",
    description:
        'Entrez votre email de compte verifié et nous vous enverrons un lien pour réinitialiser votre mot de passe.',
    email_sent: 'Email envoyé avec succès',

    // errors
    email_required: 'email requis',
});
