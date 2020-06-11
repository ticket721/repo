import * as yup from 'yup';

// const cover = yup.object().shape({
//     name: yup.string(),
//     size: yup.number(),
//     previewUrl: yup.string().required('cover is required'),
//     width: yup.number(),
//     height: yup.number(),
// });

const avatar = yup.string().required('cover_required');
const signatureColors = yup.array().of(yup.string()).min(2, 'colors_required');

export const imagesMetadataValidationSchema = yup.object().shape({
    avatar,
    signatureColors,
});
