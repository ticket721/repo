import * as React from 'react';
import FilesUploader from '../../src/components/file-uploader';
import { boolean, text, withKnobs, number } from '@storybook/addon-knobs';

export default {
  title: 'Global|FilesUploader',
  decorators: [
    withKnobs
  ],
  component: FilesUploader
};

export const singleFile = () => (
  <FilesUploader
    browseLabel={text('Browse label', 'or Browse to choose a file')}
    dragDropLabel={text('Drag and drop label', 'Drag and drop an image')}
    errorMessage={text('Error message' , `Can't upload your file`)}
    hasErrors={boolean('Has errors ?', false)}
    uploadRecommandations={text('Upload recommandation', 'Image only')}
    multiple={false}
    setCover={(cover) => console.log(cover)}/>
);

export const multipleFiles = () => (
  <FilesUploader
    browseLabel={text('Browse label', 'or Browse to choose a file')}
    dragDropLabel={text('Drag and drop label', 'Drag and drop an image')}
    errorMessage={text('Error message' , `Can't upload your file`)}
    hasErrors={boolean('Has errors ?', false)}
    noFilesMsg={text('No file message', 'No file or video')}
    uploadRecommandations={text('Upload recommandation', 'Image only')}
    maxFiles={number('Max files', 5)}
    multiple
    setCover={(cover) => console.log(cover)}
  />
);
