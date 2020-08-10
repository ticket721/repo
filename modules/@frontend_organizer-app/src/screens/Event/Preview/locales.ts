import i18n from '@frontend/core/lib/utils/i18n';

i18n.addResourceBundle('en', 'preview_event', {
    title: 'User Preview',
    get_tickets: 'Get Tickets',
    tickets_from: 'Tickets From',
    tags: 'Tags',
    from: 'From',
    to: 'to',
    each: 'each',
    free_ticket: '0€ each',
    no_description: 'No description',
    draft_title: 'ℹ️ This event is created but not published yet',
    draft_desc: `You can edit any information by navigating through the left panel.
    When you are ready click on the "Publish date" button to make the selected date visible for users or click on the "Publish all dates" to make all dates visible at once.
    Even after publication you will be able to edit your event information.`,
});

i18n.addResourceBundle('fr', 'preview_event', {
    title: 'Aperçu Utilisateur',
    get_tickets: 'Acheter les Tickets',
    tickets_from: 'Tickets De',
    tags: 'Labels',
    from: 'De',
    to: 'à',
    each: 'chacun',
    free_ticket: '0€ chacun',
    no_description: 'Aucune description',
    draft_title: 'ℹ️ Cet évènement n\'est pas encore publié',
    draft_desc: `Vous pouvez modifier n'importe quelle information en naviguant dans le menu de gauche.
    Quand votre évènement est prêt cliquez sur le bouton "Publier cette date" pour rendre votre évènement visible par les utilisateurs ou cliquez sur le bouton "Publier toutes les dates" pour rendre toutes les dates visibles.
    Vous pourrez toujours modifier l'évènement après sa publication.`,
});
