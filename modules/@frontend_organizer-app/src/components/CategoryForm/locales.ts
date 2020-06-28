import i18n from '@frontend/core/lib/utils/i18n';

i18n.addResourceBundle('en', 'category_form', {
    category_label: 'Name',
    category_placeholder: 'Category name',
    price_label: 'Price',
    price_placeholder: 'Price',
    quantity_label: 'Quantity',
    quantity_placeholder: 'Tickets quantity',
    start_sale_date_label: 'Start sale date',
    start_sale_time_label: 'Start sale time',
    end_sale_date_label: 'End sale date',
    end_sale_time_label: 'End sale time',
});

i18n.addResourceBundle('fr', 'category_form', {
    category_label: 'Nom',
    category_placeholder: 'Nom de la catégorie',
    price_label: 'Prix',
    price_placeholder: 'Prix',
    quantity_label: 'Quantité',
    quantity_placeholder: 'Nombre de tickets',
    start_sale_date_label: 'Date début de vente',
    start_sale_time_label: 'Heure début de vente',
    end_sale_date_label: 'Date fin de vente',
    end_sale_time_label: 'Heure fin de vente',
});

i18n.addResourceBundle('en', 'validation', {
    category_name_too_long: 'Category cannot be more than 20 characters long',
    category_name_required: 'Category name is required',
    seats_positive_number: 'quantity cannot be a negative number',
    seats_more_than_zero: 'quantity cannot be 0',
    price_positive_number: 'price cannot be a negative number',
});

i18n.addResourceBundle('fr', 'validation', {
    category_name_too_long: 'le nom de la catégorie ne peut pas dépasser 20 caractères',
    category_name_required: 'nom de catégorie requis',
    seats_positive_number: 'le nombre de places ne peut pas être négatif',
    seats_more_than_zero: 'le nombre de places doit être plus grand que 0',
    price_positive_number: 'le prix doit être un nombre positif',
});
