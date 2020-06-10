import * as React from 'react';
import styled from '../../config/styled';
import Icon from '../icon';
import { FileRejection, useDropzone } from 'react-dropzone';
import { Dispatch, useEffect, useState } from 'react';

export interface DropError {
    file: string;
    errorCodes: string[];
}

export interface PreviewFile extends File {
    preview: string;
}

export interface FilesUploaderProps extends React.ComponentProps<any> {
    name: string;
    browseLabel: string;
    dragDropLabel: string;
    width: string;
    height: string;
    onDrop: (files: File[], previews: string[]) => void;
    onDropRejected: (errors: DropError[]) => void;
    onRemove: (preview: string) => void;
    uploadRecommendations?: string;
    error?: string;
    // multiple related inputs
    multiple?: boolean;
    multipleLabel?: string;
    maxFiles?: number;
    noFilesMsg?: string;
}

const InfosContainer = styled.div<{ width: string; height: string }>`
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: ${(props) => props.theme.componentColorLight};
    border-radius: ${(props) => props.theme.defaultRadius};
    cursor: pointer;
    width: ${(props) => props.width};
    height: ${(props) => props.height};
    transition: background-color 300ms ease;

    &:hover {
        background-color: ${(props) => props.theme.componentColorLighter};
    }

    text-align: center;

    span {
        display: block;

        &:first-of-type {
            margin-top: ${(props) => props.theme.biggerSpacing};
        }
        &:last-of-type {
            color: ${(props) => props.theme.textColorDark};
            margin-top: 8px;
        }
    }
`;

const UploadIcon = styled(Icon)`
    height: 64px;
`;

const DropZone = styled.div`
    &:focus {
        outline: none;
    }
`;
const StyledContainer = styled.div`
    max-width: 600px;
`;

const PreviewsContainer = styled.div`
    background: ${(props) => props.theme.componentColor};
    border-radius: ${(props) => props.theme.defaultRadius};
    margin-top: ${(props) => props.theme.doubleSpacing};
    font-size: 14px;
    font-weight: 500;
    min-height: 185px;
    padding: ${(props) => props.theme.biggerSpacing};

    & > span {
        color: ${(props) => props.theme.textColorDarker};
        display: block;
        margin-top: 8px;
    }
`;

const MultipleLabel = styled.div`
    margin-bottom: 20px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    color: ${(props) => props.theme.textColorDarker};
`;

const ThumbTile = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
`;

const ThumbsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
`;

const Thumb = styled.div<{ multiple: boolean | undefined; width: string }>`
    position: relative;
    display: flex;
    min-width: 0;
    overflow: hidden;
    border-radius: 8px;
    margin-right: 10px;
    height: ${(props) => (props.multiple ? '100px' : 'auto')};
    width: ${(props) => (props.multiple ? 'auto' : props.width)};
`;

const PreviewImg = styled.img<{ width: string }>`
    display: block;
    width: ${(props) => props.width};
    height: auto;
`;

const RemoveTile = styled.div<{ multiple: boolean | undefined }>`
    position: absolute;
    height: 100%;
    width: 100%;
    padding: 15px;
    display: flex;
    justify-content: ${(props) => (props.multiple ? 'center' : 'flex-end')};
    align-items: ${(props) => (props.multiple ? 'center' : 'top')};
    background-color: #000;
    opacity: 0;
    transition: opacity 300ms;

    &:hover {
        opacity: 0.7;
    }
`;

const Disclaimer = styled.p`
    color: ${(props) => props.theme.textColorDarker};
    font-size: 14px;
    font-weight: 500;
    padding-top: ${(props) => props.theme.regularSpacing};
`;

const ErrorMsg = styled(Disclaimer)`
    color: ${(props) => props.theme.errorColor.hex};
    font-size: 13px;
`;

export const FilesUploader: React.FunctionComponent<FilesUploaderProps> = (props: FilesUploaderProps): JSX.Element => {
    const [files, setFiles]: [PreviewFile[], Dispatch<PreviewFile[]>] = useState([] as PreviewFile[]);
    const { getRootProps, getInputProps } = useDropzone({
        accept: 'image/*',
        multiple: props.multiple,
        onDropAccepted: (acceptedFiles: File[]) => {
            const addedPreviews: PreviewFile[] = acceptedFiles.map((file) => ({
                ...file,
                preview: URL.createObjectURL(file),
            }));

            setFiles(files.concat(addedPreviews));

            const previews = addedPreviews.map((file) => file.preview);

            props.onDrop(acceptedFiles, previews);
        },
        onDropRejected: (rejectedFiles: FileRejection[]) => {
            const errors: DropError[] = [];

            for (const rejected of rejectedFiles) {
                errors.push({
                    file: rejected.file.name,
                    errorCodes: rejected.errors.map((err) => err.code),
                });
            }

            props.onDropRejected(errors);
        },
    });

    const thumbs = files.map((file) => (
        <Thumb multiple={props.multiple} width={props.width}>
            <PreviewImg width={props.width} alt={file.name} src={file.preview} />
            <RemoveTile
                multiple={props.multiple}
                onClick={() => {
                    setFiles(files.filter((fileItem) => fileItem.name !== file.name));
                    props.onRemove(file.preview);
                }}
            >
                <Icon icon={'close'} size={'20px'} color={'#FFF'} />
            </RemoveTile>
        </Thumb>
    ));

    useEffect(
        () => () => {
            files.forEach((file) => URL.revokeObjectURL(file.preview));
        },
        [files],
    );

    return (
        <StyledContainer>
            <DropZone {...getRootProps()}>
                <input
                    name={props.name}
                    {...getInputProps()}
                    disabled={
                        (!props.multiple && files.length === 1) || (props.multiple && files.length === props.maxFiles)
                    }
                />
                <InfosContainer width={props.width} height={props.height}>
                    <UploadIcon
                        icon={'upload-img'}
                        size={'62px'}
                        color={!props.error ? 'rgba(255, 255, 255, 0.38)' : '#C91D31'}
                    />
                    <span>{props.dragDropLabel}</span>
                    <span>{props.browseLabel}</span>
                    {!props.multiple && <ThumbTile>{thumbs[0]}</ThumbTile>}
                </InfosContainer>
            </DropZone>
            <Disclaimer>{props.uploadRecommendations}</Disclaimer>
            {props.error && <ErrorMsg>{props.error}</ErrorMsg>}

            {props.multiple && (
                <PreviewsContainer>
                    <MultipleLabel>
                        <span>{props.multipleLabel}</span>
                        <span>
                            {files.length} / {props.maxFiles}
                        </span>
                    </MultipleLabel>
                    {!files.length && <span>{props.noFilesMsg}</span>}
                    <ThumbsContainer>
                        {thumbs.map((thumb, idx) => (
                            <div key={idx}>{thumb}</div>
                        ))}
                    </ThumbsContainer>
                </PreviewsContainer>
            )}
        </StyledContainer>
    );
};

FilesUploader.defaultProps = {
    error: undefined,
};

export default FilesUploader;
