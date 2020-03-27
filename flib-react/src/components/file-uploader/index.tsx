import * as React from 'react';
import Dropzone from 'react-dropzone-uploader';
import styled from '../../../config/styled';
import 'react-dropzone-uploader/dist/styles.css';
import Icon from '../icon';

export interface FileUploaderProps extends React.ComponentProps<any> {
  uploadRecommandations?: string;
  dragDropLabel: string;
  browseLabel: string;
  // onChange: (e: React.ChangeEvent<HTMLElement>)=> void;
}


const InfosContainer = styled.div`
  position: absolute;
  text-align: center;

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
  }
`;

const Disclaimer = styled.p`
  color: ${props => props.theme.textColorDarker};
  font-size: 14px;
  font-weight: 500;
  padding-top: ${props => props.theme.regularSpacing};
`

export const FileUploader: React.FunctionComponent<FileUploaderProps> = (props: FileUploaderProps): JSX.Element => {

  return <div>
          <StyledContainer>
            <Dropzone
              accept='image/*'
              inputContent={null}
              multiple={false}
            />
            <InfosContainer>
              <Icon icon='gallery' height="56" width="66" fill='rgba(255, 255, 255, 0.6)' />
              <LabelsContainer>
                <p>{props.dragDropLabel}</p>
                <p>{props.browseLabel}</p>
              </LabelsContainer>
            </InfosContainer>
          </StyledContainer>

          <Disclaimer>{props.uploadRecommandations}</Disclaimer>
        </div>
};

export default FileUploader;
