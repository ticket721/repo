import styled from 'styled-components';

export const Container = styled.div`
  border-radius: ${props => props.theme.defaultRadius};
  padding: ${props => props.theme.biggerSpacing};
  background-color: ${props => props.theme.darkerBg};
  display: flex;
  flex-direction: column;
  margin: 10px 0;

  div {
    margin: 0 !important;
  }
  h2 {
    text-transform: uppercase;
    font-size: 15px;
    margin: 0 0 16px 0 !important;
  }
  h3 {
    font-weight: normal;
    font-size: 15px;
    margin: 0 0 3px 0 !important;
  }
  p {
   color: ${props => props.theme.textColorDarker};
   font-size: 14px;
   margin: 0 !important;
  }
  .warning {
     color: ${props => props.theme.warningColor.hex};
     text-align: right;
     margin: 0 0 16px 0 !important;
   }
  .edit {
    color: ${props => props.theme.textColorDarker};
    text-align: right;
    margin: 0 0 16px 0 !important;
    font-weight: bold;
    text-decoration: underline;
    font-size: 10px;
    cursor: pointer;
  }
`;

export const Line = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    && > * {
      width: 49%;
    }
`;
