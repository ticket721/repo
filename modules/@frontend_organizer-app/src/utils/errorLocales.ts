import i18n from '@frontend/core/lib/utils/i18n';

i18n.addResourceBundle('en', 'string', {
    min: 'must be at least {{limit}} chars long',
    max: 'cannot be more than {{limit}} chars long',
    empty: 'this field is required',
    pattern_twitter: 'only letters (from a to Z), numbers and special char " _ " are allowed',
    pattern_tiktok: 'only letters (from a to Z), numbers and special chars " _ " and " . " are allowed',
    pattern_instagram: 'only letters (from a to Z), numbers and special chars " _ " and " . " are allowed',
    uri: 'this field need to match an url (ex: "https://website.company.com")',
    email: 'this field need to match an email address (ex: "event@company.com")',
});

i18n.addResourceBundle('fr', 'string', {
    min: 'au moins {{limit}} caractères',
    max: 'pas plus de {{limit}} caractères',
    empty: 'ce champs est requis',
    pattern_twitter: 'seul les lettres (de a à Z), les chiffres et le caractère spécial " _ " sont autorisés',
    pattern_tiktok: 'seul les lettres (de a à Z), les chiffres et les caractères spéciaux " _ " et " . " sont autorisés',
    pattern_instagram: 'seul les lettres (de a à Z), les chiffres et les caractères spéciaux " _ " et " . " sont autorisés',
    uri: 'ce champs doit contenir une url (ex: "https://website.company.com")',
    email: 'ce champs doit contenir une addresse email (ex: "event@company.com")',
});
