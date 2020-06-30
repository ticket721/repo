import i18n from '@frontend/core/lib/utils/i18n';

i18n.addResourceBundle('en', 'update_styles', {
    drag_and_drop: 'Drag and drop an image',
    browse: 'or Browse to choose a file',
    image_recommendation: 'Use a high-quality image. Recommended size 2000x1000px (2:1)',
    primary_color: 'Primary color',
    secondary_color: 'Secondary color',
    color_suggestions: 'Color Suggestions',
    save_changes: 'Save Changes',
});

i18n.addResourceBundle('fr', 'update_styles', {
    drag_and_drop: 'Déposez une image',
    browse: 'ou Sélectionnez un fichier',
    image_recommendation: 'Utilisez une image de bonne qualité. Recommandée: 2000x1000px (2:1)',
    primary_color: 'Couleur primaire',
    secondary_color: 'Couleur secondaire',
    color_suggestions: 'Suggestion de couleurs',
    save_changes: 'Valider les changements',
});

i18n.addResourceBundle('fr', 'react_dropzone_errors', {
    'file-invalid-type': 'Invalid file type. Provide an image please',
    'too-many-files': 'Please provide only one image',
});

i18n.addResourceBundle('en', 'react_dropzone_errors', {
    'file-invalid-type': 'Type de fichier invalide. Veuillez fournir une image',
    'too-many-files': 'Veuillez fournir une seule image',
});

i18n.addResourceBundle('en', 'validation', {
    cover_required: 'provide a cover for your event',
    colors_required: '2 colors are required',
});

i18n.addResourceBundle('fr', 'validation', {
    cover_required: 'veuillez fournir une image pour votre évènement',
    colors_minimum: '2 couleurs sont requises',
});
