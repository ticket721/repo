import * as React from 'react';
import FileUploader from '../src/components/file-uploader';
import { withKnobs } from '@storybook/addon-knobs';

export default {
  title: 'FileUploader',
  decorators: [
    withKnobs
  ],
  component: FileUploader
};

export const singleFile = () => (
  <FileUploader label="Upload" />
);
