import i18n from '@frontend/core/lib/utils/i18n';

i18n.addResourceBundle('en', 'notify', {
    success: 'Success',
    no_rights_on_event: 'You don\'t have required rights over this event',
    invalid_event_dates: 'Unable to update this date',
});

i18n.addResourceBundle('fr', 'notify', {
    success: 'Succès',
    no_rights_on_event: 'Vous n\'avez pas les droits nécessaires sur cet évènement',
    invalid_event_dates: 'Impossible de mettre à jour cette date'
});

i18n.addResourceBundle('en', 'global', {
    validate: 'Validate',
    loading: 'Loading...',
    back: 'Back',
    delete_item: 'Delete item',
    cancel: 'Cancel',
    save_changes: 'Save Changes',
});

i18n.addResourceBundle('fr', 'global', {
    validate: 'Valider',
    loading: 'Chargement...',
    back: 'Retour',
    delete_item: 'Supprimer',
    cancel: 'Annuler',
    save_changes: 'Sauvegarder les changements',
});
