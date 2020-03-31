import * as React from 'react';
import MultipleFilesUploader from '../src/components/file-uploader/multiple';
import { boolean, text, withKnobs } from '@storybook/addon-knobs';

export default {
  title: 'MultipleFilesUploader',
  decorators: [
    withKnobs
  ],
  component: MultipleFilesUploader
};


export const multipleFiles = () => (
  <MultipleFilesUploader
    browseLabel={text('Browse label', 'or Browse to choose a file')}
    dragDropLabel={text('Drag and drop label', 'Drag and drop an image')}
    errorMessage={text('Error message' , `Can't upload your file`)}
    hasErrors={boolean('Has errors ?', false)}
    noFilesMsg={text('No file message', 'No file or video')}
    uploadRecommandations={text('Upload recommandation', 'Image only')}
  />
);
