import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import styled from '../../../config/styled';
import Icon from '../icon';

export interface FileUploaderProps extends React.ComponentProps<any> {
  label: string;
}

const StyledContainer = styled.div<FileUploaderProps>`
  align-items: center;
  background-color: ${props => props.theme.componentColorLight};
  border-radius: ${props => props.theme.defaultRadius};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 375px;
  max-width: 600px;
  transition: background-color 300ms ease;
  width: 100%;

  ${props => props.isDragActive &&`
    background-color: ${props.theme.componentColorLighter};

    svg {
      transform: rotate(-15deg);
    }
  `};

`;


export const FileUploader: React.FunctionComponent<FileUploaderProps> = (props: FileUploaderProps): JSX.Element => {
  const { acceptedFiles,
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject} = useDropzone();

  const files = acceptedFiles.map(file => (
    <li key={file.name}>
      {file.name} - {file.size} bytes
    </li>
  ));

  return <StyledContainer {...getRootProps({isDragActive, isDragAccept, isDragReject})}>
          <input {...getInputProps()} />
          <Icon
            fill="rgba(255, 255, 255, 0.38)"
            height="56"
            icon="gallery"
            width="66"
          />
          <p>{props.label}</p>
          <aside>
            <h4>Files</h4>
            <ul>{files}</ul>
          </aside>
        </StyledContainer>

};

export default FileUploader;
