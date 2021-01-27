import i18n from '@frontend/core/lib/utils/i18n'

i18n.addResourceBundle('en', 'invitation_transfer', {
    input_label: 'Transfer invitation to',
    input_placeholder: 'someone@gmail.com',
    transfer_btn: 'Transfer',
    cancel_btn: 'Cancel',
    confirm_btn: 'Confirm',
    confirm_msg_1: 'You are about to transfer this invitation to ',
    confirm_msg_2: 'Please make sure the mail adress is correct.',
    success_transfer: 'Successfuly transfered to {{newOwner}}',
    failed_transfer: 'Transfer failed. Please try again later.'
});
i18n.addResourceBundle('fr', 'invitation_transfer', {
    input_label: 'Transférer l\'invitation à',
    input_placeholder: 'someone@gmail.com',
    transfer_btn: 'Transférer',
    cancel_btn: 'Annuler',
    confirm_btn: 'Confirmer',
    confirm_msg_1: 'Vous êtes sur le point de transférer cette invitation à ',
    confirm_msg_2: 'Veuillez vous assurer que l\'adresse email est correcte.',
    success_transfer: 'Transféré avec succès à {{newOwner}}',
    failed_transfer: 'Le transfert a échoué. Veuillez réessayer plus tard.'

});
