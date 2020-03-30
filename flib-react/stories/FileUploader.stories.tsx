import * as React from 'react';
import FileUploader from '../src/components/file-uploader';
import { boolean, text, withKnobs } from '@storybook/addon-knobs';

export default {
  title: 'FileUploader',
  decorators: [
    withKnobs
  ],
  component: FileUploader
};


export const singleFile = () => (
  <FileUploader
    browseLabel={text('Browse label', 'or Browse to choose a file')}
    dragDropLabel={text('Drag and drop label', 'Drag and drop an image')}
    errorMessage={text('Error message' , `Can't upload your file`)}
    hasErrors={boolean('Has errors ?', false)}
    uploadRecommandations={text('Upload recommandation', 'Image only')}
  />
);
