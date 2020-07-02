import i18n from '@frontend/core/lib/utils/i18n';

i18n.addResourceBundle('en', 'category_deletion', {
    confirm_deletion_msg: 'You are about to delete {{categoryName}} category',
    cancel_btn: 'Cancel',
    delete_btn: 'Delete',
    successful_deletion: '{{categoryName}} category delete with success',
    error_deletion: 'impossible to delete this category. Please retry'
});

i18n.addResourceBundle('fr', 'event_sub_menu', {
    confirm_deletion_msg: 'Vous êtes sur le point de supprimer la catégorie {{categoryName}}',
    cancel_btn: 'Annuler',
    delete_btn: 'Supprimer',
    successful_deletion: 'catégorie {{categoryName}} supprimée avec succès',
    error_deletion: 'impossible de supprimer cette catégorie. Veuillez essayer à nouveau',
});
