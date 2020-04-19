import * as React from 'react';
import Dropzone, { IDropzoneProps, ILayoutProps } from 'react-dropzone-uploader';
import styled from '../../config/styled';
import 'react-dropzone-uploader/dist/styles.css';
import { keyframes } from 'styled-components';
import Icon from '../icon';

export interface FilesUploaderProps extends React.ComponentProps<any> {
  browseLabel: string;
  dragDropLabel: string;
  errorMessage: string;
  hasErrors?: boolean;
  noFilesMsg?: string;
  maxFiles?: number;
  multiple?: boolean;
  uploadRecommandations?: string;
}

const InfosContainer = styled.div`
  position: absolute;
  text-align: center;
  z-index: 0;

  span {
    display: block;

    &:first-of-type {
      margin-top: ${props => props.theme.biggerSpacing};
    }
    &:last-of-type {
      color: ${props => props.theme.textColorDark};
      margin-top: 8px;
    }
  }

  svg {
    margin: auto;
  }
`

const fadeIn = keyframes`
  0% { opacity:0; }
  66% { opacity:0; }
  100% { opacity:1; }
`;

const StyledContainer = styled.div`
  max-width: 600px;

  .dzu {
    &-dropzone {
      border: none;
      z-index: 1;
      align-items: center;
      background-color: ${props => props.theme.componentColorLight};
      border-radius: ${props => props.theme.defaultRadius};
      cursor: pointer;
      display: flex;
      flex-direction: column;
      height: 375px;
      justify-content: center;
      transition: background-color 300ms ease;

      &:hover {
        background-color: ${props => props.theme.componentColorLighter};
      }
    }

    &-inputLabel,
    &-inputLabelWithFiles {
      align-items: center;
      background: none;
      border-radius: 0;
      bottom: 0;
      color: ${props => props.theme.textColor};
      cursor: pointer;
      display: flex;
      font-family: ${props => props.theme.fontStack};
      font-size: 14px;
      font-weight: 500;
      justify-content: center;
      left: 0;
      margin: 0;
      opacity: 1;
      position: absolute;
      right: 0;
      text-transform: none;
      top: 0;
      transition: opacity 300ms ease;

      span {
        display: block;

        &:first-of-type {
          margin-top: ${props => props.theme.biggerSpacing};
        }

        &:last-of-type {
          color: ${props => props.theme.textColorDark};
          margin-top: 8px;
        }
      }
    }

    &-dropzoneActive {
      background-color: ${props => props.theme.componentColorLighter};
        svg {
          fill: ${props => props.theme.textColor};
          transform: translateY(20px) rotate(-15deg);
        }

        span {
          opacity: 0;
        }
    }

    &-preview {
      &Container {
        animation: 1s ease 0s normal forwards 1 ${fadeIn};
        border: none;
        height: 100%;
        padding: 0;

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
        margin: 0 auto;
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

const PreviewsContainer = styled.div`
  background: ${props => props.theme.componentColor};
  border-radius: ${props => props.theme.defaultRadius};
  margin-top: ${props => props.theme.doubleSpacing};
  font-size: 14px;
  font-weight: 500;
  min-height: 185px;
  padding: ${props => props.theme.biggerSpacing};

  label {
    display: block;
    padding: 0 0 8px;
    width: 100%;
  }

  span {
    color: ${props => props.theme.textColorDarker};
    display: block;
    margin-top: 8px;
  }

  div {
    display: flex;
    flex-wrap: wrap;
  }

  .dzu {
    &-preview{
      &Container {
        border-radius: ${props => props.theme.defaultRadius};
        height: 104px;
        overflow: hidden;
        margin: 8px 4px 0;
        width: 104px;

        &::after {
          background: linear-gradient(0deg, rgba(10, 11, 23, 0.8), rgba(10, 11, 23, 0.8));
        }

        &:nth-of-type(5n + 1) {
          margin-left: 0;
        }

        &:nth-of-type(5n + 5) {
          margin-right: 0;
        }
      }

      &StatusContainer {
        bottom: 0;
        left: 0;
        right: 0;
        top: 0;
      }
    }
  }`

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

export const FilesUploader: React.FunctionComponent<FilesUploaderProps> = (props: FilesUploaderProps): JSX.Element => {
  const Layout = ({ input, previews, dropzoneProps, files, extra: { maxFiles } }: ILayoutProps) => {
    return (
      <StyledContainer>
        <div {...dropzoneProps}>
        <InfosContainer>
          <Icon icon={props.multiple ? 'gallery' : 'upload'} height="62" width="72" fill={!props.hasErrors ? 'rgba(255, 255, 255, 0.38)' : '#C91D31' } />        
          <span>{props.dragDropLabel}</span>
          <span>{props.browseLabel}</span>
        </InfosContainer>

          {!props.multiple &&
            previews
          }

          {files.length < maxFiles && input}
        </div>
        <Disclaimer>{props.uploadRecommandations}</Disclaimer>
          {props.hasErrors &&
            <ErrorMsg>{props.errorMessage}</ErrorMsg>
          }

          {props.multiple &&
            <PreviewsContainer>
              <label>Photos & Videos</label>
              {!files.length &&
                <span>{props.noFilesMsg}</span>
              }
              <div>
                {previews}
              </div>
            </PreviewsContainer>
          }
      </StyledContainer>
    )
  }

  //Check documentation for uploading: https://react-dropzone-uploader.js.org/docs/api
  const getUploadParams = () => {
    return { url: 'https://httpbin.org/post' }
  }

  // todo: manage error here 👇
  const handleChangeStatus: IDropzoneProps['onChangeStatus'] = ({ meta }, status) => {
    console.log(status, meta)
  }

  return <div>
          <Dropzone
            accept='image/*'
            canCancel={true}
            getUploadParams={getUploadParams}
            inputContent={null}
            inputWithFilesContent={null}
            LayoutComponent={Layout}
            maxFiles={props.multiple ? props.maxFiles : 1}
            onChangeStatus={handleChangeStatus}
          />
        </div>
};


FilesUploader.defaultProps = {
  hasErrors: false
};


export default FilesUploader;
