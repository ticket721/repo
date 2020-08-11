import * as yup from 'yup';

const name = yup.string()
  .min(3, 'name_too_short')
  .max(50, 'name_too_long')
  .required('name_required');
const description = yup.string()
  .max(10000)
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
  eventBegin: yup.date().min(new Date(), 'past_date_forbidden').required('date_required'),
  eventEnd: yup.date().min(yup.ref('eventBegin'), 'end_must_be_gt_start').required('date_required'),
  location: yup.object().shape({
    lat: yup.number(),
    lon: yup.number(),
    label: yup.string().required('location_required'),
  }).required('location_required'),
  name,
  description,
  tags,
});
