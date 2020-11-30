import i18n from '@frontend/core/lib/utils/i18n';

i18n.addResourceBundle('en', 'event_styles', {
    drag_and_drop: 'Drag and drop an image',
    browse: 'or Browse to choose a file',
    image_recommendation: 'Use a high-quality image. Recommended size: min. 1920x1080px (16:9)',
    save_changes: 'Save Changes',
});

i18n.addResourceBundle('fr', 'event_creation_styles', {
    drag_and_drop: 'Déposez une image',
    browse: 'ou Sélectionnez un fichier',
    image_recommendation: 'Utilisez une image de bonne qualité. Recommandée: min. 1920x1080px (16:9)',
    save_changes: 'Valider les changements',
});

i18n.addResourceBundle('en', 'react_dropzone_errors', {
    'file-invalid-type': 'Invalid file type. Provide an image please',
    'too-many-files': 'Please provide only one image',
    'file-too-large': 'File too large (max. 5MB)',
});

i18n.addResourceBundle('fr', 'react_dropzone_errors', {
    'file-invalid-type': 'Type de fichier invalide. Veuillez fournir une image',
    'too-many-files': 'Veuillez fournir une seule image',
    'file-too-large': 'Fichier trop large (max. 5Mo)',
});

i18n.addResourceBundle('en', 'validation', {
    cover_required: 'provide a cover for your event',
    colors_required: '2 colors are required',
});

i18n.addResourceBundle('fr', 'validation', {
    cover_required: 'veuillez fournir une image pour votre évènement',
    colors_minimum: '2 couleurs sont requises',
});

i18n.addResourceBundle('en', 'event_creation_styles_preview', {
    preview_label: 'Elements preview',
    button_label: 'Button on your page',
    ticket_label: 'User Ticket on T721 application',
    button: 'Button',
});

i18n.addResourceBundle('fr', 'event_creation_styles_preview', {
    preview_label: 'Previsualisation des éléments',
    button_label: 'Bouton sur votre page',
    ticket_label: 'Ticket utilisateur sur l\'application T721',
    button: 'Bouton',
});
