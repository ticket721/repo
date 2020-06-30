import i18n from '@frontend/core/lib/utils/i18n';

i18n.addResourceBundle('en', 'date_form', {
    date_name_label: 'Name',
    start_date_label: 'Start Date',
    start_time_label: 'Start Time',
    end_date_label: 'End Date',
    end_time_label: 'End Time',
    location_label: 'Location',
    date_name_placeholder: 'Provide a name',
    location_placeholder: 'Provide a location',
});

i18n.addResourceBundle('fr', 'date_form', {
    date_name_label: 'Nom',
    start_date_label: 'Date de début',
    start_time_label: 'Heure de début',
    end_date_label: 'Date de fin',
    end_time_label: 'Heure de fin',
    location_label: 'Localisation',
    date_name_placeholder: 'Veuillez fournir un nom',
    location_placeholder: 'Veuillez fournir une adresse',
});

i18n.addResourceBundle('en', 'validation', {
    date_name_too_short: 'date name must be at least 3 chars long',
    date_name_too_long: 'date name cannot be more than 50 chars long',
    date_name_required: 'date name is required',
    past_date_forbidden: 'cannot be a past date',
    date_required: 'date is required',
    location_required: 'location required',
});

i18n.addResourceBundle('fr', 'validation', {
    date_name_too_short: 'votre date doit avoir un nom d\'au moins 3 caractères',
    date_name_too_long: 'le nom de votre date ne doit pas dépasser 50 caractères',
    date_name_required: 'un nom pour votre date est requis',
    past_date_forbidden: 'la date fournie est passée',
    date_required: 'date requise',
    location_required: 'addresse requise',
});

i18n.addResourceBundle('en', 'errors', {
    google_api_error: 'something went wrong with location retrieve, please try again',
});

i18n.addResourceBundle('fr', 'errors', {
    google_api_error: 'echec de la récupération de l\'adresse, veuillez réessayer',
});
