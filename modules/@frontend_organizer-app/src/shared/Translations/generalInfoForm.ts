import i18n from '@frontend/core/lib/utils/i18n';

i18n.addResourceBundle('en', 'general_infos', {
  name_label: 'Name of your event',
  description_label: 'Description',
  tags_label: 'Tags',
  name_placeholder: 'Name of your event',
  description_placeholder: 'Describe your event',
  tags_placeholder: 'tags',
  location_label: 'Location',
  location_placeholder: 'Provide a location',

});

i18n.addResourceBundle('fr', 'general_infos', {
  name_label: 'Nom de l\'évènement',
  description_label: 'Description',
  tags_label: 'Tags',
  name_placeholder: 'Nom de votre évènement',
  description_placeholder: 'Decrivez votre évènement',
  tags_placeholder: 'tags',
  location_label: 'Localisation',
  location_placeholder: 'Veuillez fournir une adresse',

});

i18n.addResourceBundle('en', 'validation', {
  name_too_short: 'event name must be at least 3 chars long',
  name_too_long: 'event name cannot be more than 50 chars long',
  name_required: 'name is required',
  description_required: 'description is required',
  tag_too_short: 'tag must be at least 3 chars long',
  tag_too_long: 'tag cannot be more than 16 chars long',
  tag_already_added: 'tag already added',
  tag_required: 'select at least 1 tag',
});

i18n.addResourceBundle('fr', 'validation', {
  name_too_short: 'votre évènement doit avoir un nom d\'au moins 3 caractères',
  name_too_long: 'le nom de votre évènement ne doit pas dépasser 50 caractères',
  name_required: 'un nom pour votre évènement est requis',
  description_required: 'une description est requise',
  tag_too_short: 'un tag doit contenir au moins 3 caractères',
  tag_too_long: 'un tag ne peut pas contenir plus de 16 caractères',
  tag_already_added: 'tag déjà existant',
  tag_required: 'veuillez fournir au moins 1 tag',
});
