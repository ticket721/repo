import * as yup from 'yup';

const name = yup.string()
  .min(3, 'name_too_short')
  .max(50, 'name_too_long')
  .required('name_required');
const description = yup.string()
  .max(1000)
  .required('description_required');
const tags = yup.array().of(
  yup.string()
    .min(3, 'tag_too_short')
    .max(16, 'tag_too_long')
).min(1, 'tag_required');

export const textMetadataValidationSchema = yup.object().shape({
  name,
  description,
  tags,
});

export const completeDateValidation = yup.object().shape({
  eventBegin: yup.date().min(new Date(), 'Cannot be a past date').required('you need to provide a start date'),
  eventEnd: yup.date().min(new Date(), 'Cannot be a past date').required('you need to provide an end date'),
  location: yup.object().shape({
    lat: yup.number(),
    lon: yup.number(),
    label: yup.string().required('you need to provide a location'),
  }).required('you need to provide a location'),
  name,
  description,
  tags,
});
