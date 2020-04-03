import * as React from 'react';
import { SketchPicker, ColorResult } from 'react-color';
import styled from '../../../config/styled';

export interface ColorPickerProps extends React.ComponentProps<any> {
  label: string;
  color: string;
  handleChange: (color: ColorResult) => void;
  handleClick: () => void;
  presetColors: any[];
  presetLabel?: string;
  showPicker: boolean;
}

const StyledLabel = styled.label`
  display: inline-flex;
  transform: translateX(-12px);
  transition: all 300ms ease;

  &::before {
    background-color: ${ props => props.theme.primaryColor};
    border-radius: 100%;
    content: "";
    display: inline-block;
    height: 4px;
    margin-right: 8px;
    opacity: 0;
    position: relative;
    top: 2px;
    transition: opacity 300ms ease;
    width: 4px;
  }
`;

const ColorSwatch = styled.div`
  background-color: ${props => props.theme.primaryColor};
  border-radius: ${props => props.theme.defaultRadius};
  content: '';
  display: inline-block;
  height: 40px;
  margin-left: ${props => props.theme.biggerSpacing};
  transition: background-color 300ms ease;
  width: 40px;
`;

const StyledContainer = styled.div`
  background-color: ${props => props.theme.componentColor};
  border-radius: ${props => props.theme.defaultRadius};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  padding: ${props => props.theme.biggerSpacing} 0;
  transition: background-color 300ms ease;

  .row {
    margin-top: ${props => props.theme.regularSpacing};
  }


  &:hover {
    background-color: ${props => props.theme.componentColorLight};
  }

  &.active {
    background-color: ${props => props.theme.componentColorLighter};

    ${StyledLabel} {
      transform: translateX(0px);

      &::before {
        opacity: 1;
      }
    }
  }
`;

const PickerContainer = styled.div`
  position: relative;

  label {
    position: absolute;
    top: ${props => props.theme.biggerSpacing};
  }

  .sketch-picker {
    background-color: ${props => props.theme.componentColorLight} !important;
    display: flex;
    flex-direction: column;
    margin-top: ${props => props.theme.regularSpacing};
    padding: ${props => props.theme.biggerSpacing} !important;

    & > div {
      order: 1;

      &:first-child {
        border-radius: ${props => props.theme.defaultRadius};
        margin-bottom: ${props => props.theme.regularSpacing};
      }

      &:last-child {
        border: none !important;
        order: 0;
        margin: 24px 0 12px !important;
        padding: 0 !important;

        div {
          height: 24px !important;
          margin: 0 4px 4px 0 !important;
          width: 24px !important;
        }
      }
    }

    input {
      background-color: ${props => props.theme.componentColorLight};
      border-radius: 4px;
      box-shadow: none !important;
      color: ${props => props.theme.textColorDark};
      margin-top: 12px;
      padding-top: 9px !important;
      text-align: center;

      & + span {
        color: ${props => props.theme.textColorDarker} !important;
        font-weight: 500;
        margin: 12px 0 0;
        padding: 0 !important;
        text-transform: uppercase !important;
      }
    }

  }
`;

const Cover = styled.div`
  bottom: 0;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
`;

const ColorLabel = styled.span`
  color: ${props => props.theme.textColorDark};
  display: inline-block;
  font-size: 13px;
  font-weight: 500;
  margin-left: ${props => props.theme.regularSpacing};
`;

export const ColorPicker: React.FunctionComponent<ColorPickerProps> = (props: ColorPickerProps): JSX.Element => {
  return <div>
          <StyledContainer onClick={props.handleClick} className={props.showPicker ? 'active' : ''}>
            <StyledLabel>{props.label}</StyledLabel>
            <div className="row aic">
              <ColorSwatch style={{ backgroundColor: `${props.color}` }} />
              <ColorLabel>{props.color}</ColorLabel>
            </div>
          </StyledContainer>
          {props.showPicker &&
            <PickerContainer>
              <Cover onClick={props.handleClick}/>
              { props.presetColors.length > 0 && <label>{props.presetLabel}</label> }
              <SketchPicker
                color={props.color}
                disableAlpha={true}
                onChange={props.handleChange}
                presetColors={props.presetColors}
               />
            </PickerContainer>
          }
        </div>
}

ColorPicker.defaultProps = {
  showPicker: true
}

export default ColorPicker;
