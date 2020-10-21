import i18n from '@frontend/core/lib/utils/i18n';

i18n.addResourceBundle('en', 'string', {
    min: 'must be at least {{limit}} chars long',
    max: 'cannot be more than {{limit}} chars long',
    empty: 'this field is required',
    pattern_twitter: 'only letters (from a to Z), numbers and special char " _ " are allowed',
    pattern_tiktok: 'only letters (from a to Z), numbers and special chars " _ " and " . " are allowed',
    pattern_instagram: 'only letters (from a to Z), numbers and special chars " _ " and " . " are allowed',
    uri: 'this field need to match an url',
    email: 'this field need to match an email address (ex: "event@company.com")',
});

i18n.addResourceBundle('fr', 'string', {
    min: 'au moins {{limit}} caractères',
    max: 'pas plus de {{limit}} caractères',
    empty: 'ce champs est requis',
    pattern_twitter: 'seul les lettres (de a à Z), les chiffres et le caractère spécial " _ " sont autorisés',
    pattern_tiktok: 'seul les lettres (de a à Z), les chiffres et les caractères spéciaux " _ " et " . " sont autorisés',
    pattern_instagram: 'seul les lettres (de a à Z), les chiffres et les caractères spéciaux " _ " et " . " sont autorisés',
    uri: 'ce champs doit contenir une url',
    email: 'ce champs doit contenir une addresse email (ex: "event@company.com")',
});

i18n.addResourceBundle('en', 'number', {
    min: 'cannot be less than {{limit}}',
    max: 'cannot be more than {{limit}}',
    empty: 'this field is required',
    base: 'this field is required',
});

i18n.addResourceBundle('fr', 'number', {
    min: 'doit etre superieur ou égal à {{limit}}',
    max: 'doit etre inferieur ou égal à {{limit}}',
    empty: 'ce champs est requis',
    base: 'ce champs est requis',
});

i18n.addResourceBundle('en', 'array', {
    empty: 'this field is required',
    min: 'select at least {{limit}} item',
});

i18n.addResourceBundle('fr', 'array', {
    empty: 'ce champs est requis',
    min: 'selectionnez au moins {{limit}} item',
});

i18n.addResourceBundle('en', 'date', {
    base: 'this field is required',
});

i18n.addResourceBundle('fr', 'date', {
    base: 'ce champs est requis',
});

i18n.addResourceBundle('en', 'dateEntity', {
    min: 'you need to provide at least {{limit}} date',
    endBeforeStart: 'end date cannot happen before start date',
});

i18n.addResourceBundle('fr', 'dateEntity', {
    min: 'vous devez configurer au moins {{limit}} date',
    endBeforeStart: 'la date de fin ne peut pas survenir avant la date de début',
});

i18n.addResourceBundle('en', 'categoryEntity', {
    saleEndBeforeStart: 'end of sale cannot happen before start of sale',
    invalidDateIndex: 'error: invalid date index',
    saleEndAfterLastEventEnd: 'end of sale cannot happen after event end date',
    invalidCurrency: 'invalid currency',
});

i18n.addResourceBundle('fr', 'categoryEntity', {
    saleEndBeforeStart: 'la fin de vente ne peut pas survenir avant le début de la vente',
    invalidDateIndex: 'erreur: index de date invalide',
    saleEndAfterLastEventEnd: 'la fin de vente ne peut pas survenir après la fin de l\'évènement',
    invalidCurrency: 'devise invalide',
});
