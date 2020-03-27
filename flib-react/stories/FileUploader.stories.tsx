import * as React from 'react';
import FileUploader from '../src/components/file-uploader';
import { text, withKnobs } from '@storybook/addon-knobs';

export default {
  title: 'FileUploader',
  decorators: [
    withKnobs
  ],
  component: FileUploader
};

export const singleFile = () => (
  <FileUploader
    uploadRecommandations={text('Upload recommandation', 'Image only')}
    dragDropLabel={text('Drag and drop label', 'Drag and drop an image')}
    browseLabel={text('Browse label', 'or Browse to choose a file')}
  />
);
