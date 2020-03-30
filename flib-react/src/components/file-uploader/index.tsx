import * as React from 'react';
import Dropzone, { IDropzoneProps } from 'react-dropzone-uploader';
import styled from '../../../config/styled';
import 'react-dropzone-uploader/dist/styles.css';
import Icon from '../icon';
import { keyframes } from 'styled-components';

export interface FileUploaderProps extends React.ComponentProps<any> {
  browseLabel: string;
  dragDropLabel: string;
  errorMessage: string;
  hasErrors?: boolean;
  uploadRecommandations?: string;
}


const InfosContainer = styled.div`
  position: absolute;
  text-align: center;
  z-index: 0;

  svg {
    margin: auto;
  }
`

const LabelsContainer = styled.div`
  font-size: 14px;
  font-weight: 500;
  margin-top: ${props => props.theme.biggerSpacing};
  opacity: 1;
  text-align: center;
  transition: opacity 300ms ease;

  p:last-of-type {
    color: ${props => props.theme.textColorDark};
    margin-top: 8px;
  }
`;

const fadeIn = keyframes`
  0% { opacity:0; }
  66% { opacity:0; }
  100% { opacity:1; }
`;

const StyledContainer = styled.div`
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

  &:hover {
    background-color: ${props => props.theme.componentColorLighter};
  }

  .dzu {
    &-dropzone {
      border: none;
      height: 100%;
      z-index: 1;
    }

    &-dropzoneActive {
      background-color: ${props => props.theme.componentColorLighter};

      & ~ ${InfosContainer} {
        ${LabelsContainer} {
          opacity: 0;
        }

        svg {
          fill: ${props => props.theme.textColor};
          transform: translateY(20px) rotate(-15deg);
        }
      }
    }

    &-preview{
      &Container {
        animation: 1s ease 0s normal forwards 1 ${fadeIn};
        border: none;
        height: 100%;
        padding: 0;
        position: absolute;
        width: 100%;

        &::after {
          background: linear-gradient(180deg, rgba(10, 11, 23, 0.7) 0%, rgba(17, 16, 24, 0) 100%);
          content: "";
          display: block;
          height: 100%;
          left: 0;
          opacity: 0;
          position: absolute;
          top: 0;
          transition: opacity 300ms ease;
          width: 100%;
          z-index: 0;
        }

        &:hover {
          .dzu-previewStatusContainer,
          &::after {
            opacity: 1;
          }
        }
      }

      &Image {
        border-radius: 0;
        height: 100%;
        max-height: none;
        max-width: none;
        object-fit: cover;
        width: 100%;
      }

      &Button {
        background-image: url('assets/icons/icon--close.svg') !important;
        margin: 0;
      }

      &StatusContainer {
        opacity: 0;
        position: absolute;
        right: ${props => props.theme.biggerSpacing};
        top: ${props => props.theme.biggerSpacing};
        transition: opacity 300ms ease;
        z-index: 1;

        progress {
          display: none;
        }
      }
    }
  }
`;


const Disclaimer = styled.p`
  color: ${props => props.theme.textColorDarker};
  font-size: 14px;
  font-weight: 500;
  padding-top: ${props => props.theme.regularSpacing};
`

const ErrorMsg = styled(Disclaimer)`
  color: ${props => props.theme.warningColor};
  font-size: 13px;
`

export const FileUploader: React.FunctionComponent<FileUploaderProps> = (props: FileUploaderProps): JSX.Element => {

  //Check documentation for uploading: https://react-dropzone-uploader.js.org/docs/api
  const getUploadParams = () => {
    return { url: 'https://httpbin.org/post' }
  }

  // manage error here 👇
  const handleChangeStatus: IDropzoneProps['onChangeStatus'] = ({ meta }, status) => {
    console.log(status, meta)
  }

  return <div>
          <StyledContainer>
            <Dropzone
              accept='image/*'
              getUploadParams={getUploadParams}
              inputContent={null}
              maxFiles={1}
              multiple={false}
              onChangeStatus={handleChangeStatus}
            />
            <InfosContainer>
              <Icon icon='upload' height="56" width="66" fill={!props.hasErrors ? 'rgba(255, 255, 255, 0.6)' : '#C91D31' } />
              <LabelsContainer>
                <p>{props.dragDropLabel}</p>
                <p>{props.browseLabel}</p>
              </LabelsContainer>
            </InfosContainer>
          </StyledContainer>

          <Disclaimer>{props.uploadRecommandations}</Disclaimer>
          {props.hasErrors &&
            <ErrorMsg>{props.errorMessage}</ErrorMsg>
          }
        </div>
};


FileUploader.defaultProps = {
  hasErrors: false
};


export default FileUploader;
