import i18n from '@frontend/core/lib/utils/i18n'

i18n.addResourceBundle('en', 'invitation_transfer', {
    input_label: 'Transfer invitation to',
    input_placeholder: 'someone@gmail.com',
    transfer_btn: 'Transfer',
    success_transfer: 'Successfuly transfered to {{newOwner}}',
    failed_transfer: 'Transfer failed. Please try again later.'
});
i18n.addResourceBundle('fr', 'invitation_transfer', {
    input_label: 'Transférer l\'invitation à',
    input_placeholder: 'someone@gmail.com',
    transfer_btn: 'Transférer',
    success_transfer: 'Transféré avec succès à {{newOwner}}',
    failed_transfer: 'Le transfert a échoué. Veuillez réessayer plus tard.'

});
