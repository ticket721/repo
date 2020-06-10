import * as React                   from 'react';
import FilesUploader, { DropError } from '../../src/components/file-uploader';
import { text, withKnobs, number }  from '@storybook/addon-knobs';

export default {
    title: 'Global|FilesUploader',
    decorators: [withKnobs],
    component: FilesUploader,
};

export const singleFile = () => (
    <FilesUploader
        name={'uploader'}
        width={'600px'}
        height={'300px'}
        browseLabel={text('Browse label', 'or Browse to choose a file')}
        dragDropLabel={text('Drag and drop label', 'Drag and drop an image')}
        error={text('Error message', '')}
        uploadRecommendations={text('Upload recommandation', 'Image only')}
        multiple={false}
        onDrop={(files: File[]) => console.log('file: ', files[0])}
        onDropRejected={(errors: DropError[]) => console.log('errors: ', errors)}
        onRemove={() => console.log('remove')}
    />
);

export const multipleFiles = () => (
    <FilesUploader
        name={'uploader'}
        width={'600px'}
        height={'300px'}
        browseLabel={text('Browse label', 'or Browse to choose a file')}
        dragDropLabel={text('Drag and drop label', 'Drag and drop an image')}
        error={text('Error message', '')}
        noFilesMsg={text('No file message', 'No file or video')}
        uploadRecommendations={text('Upload recommandation', 'Image only')}
        maxFiles={number('Max files', 5)}
        multiple
        onDrop={(files: File[]) => console.log('files: ', files)}
        onDropRejected={(errors: DropError[]) => console.log('errors: ', errors)}
        onRemove={() => console.log('remove')}
    />
);
