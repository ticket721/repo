import * as React from 'react';
import styled from '../../../config/styled';
import UserInterface from '../../../shared/userInterface';


export interface WalletHeaderProps extends React.ComponentProps<any> {
  user: UserInterface;
  profileHeader?: boolean;
}

const Container = styled.section<WalletHeaderProps>`
  align-items: center;
  display: flex;
  flex-direction: ${props => props.profileHeader ? 'row-reverse' : 'row'};
  padding: ${props => props.theme.biggerSpacing} ${props => props.theme.biggerSpacing} 0;
  width: 100%;

  ${props => props.profileHeader && `
    div:last-of-type {
      margin-right: auto;
      padding-right: ${props.theme.regularSpacing};
    }
  `}
`
const ImgContainer = styled.div<WalletHeaderProps>`
  border-radius: 100%;
  height:  ${props => props.profileHeader ? '80px' : '48px'};
  margin-right: ${props => props.profileHeader ? 0 : props.theme.regularSpacing};
  overflow: hidden;
  width:  ${props => props.profileHeader ? '80px' : '48px'};

  img {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }
`

const Amount = styled.h4`
  color: ${props => props.theme.textColorDark};
  display: block;
  font-size: 14px;

  span {
    background: linear-gradient(238.51deg, #11A869 0%, #0D8251 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -moz-background-clip: text;
    -webkit-text-fill-color: transparent;
    -moz-text-fill-color: transparent;
  }
`

export const WalletHeader: React.FunctionComponent<WalletHeaderProps> = (props: WalletHeaderProps): JSX.Element => {
  const fullName = `${props.user.firstName} ${props.user.lastName}`;

  return <Container profileHeader={props.profileHeader}>
          <ImgContainer profileHeader={props.profileHeader}>
            <img src={props.user.profilePicture} alt={fullName}/>
          </ImgContainer>
          <div>
            {props.profileHeader ? (
              <h1>{ fullName }</h1>
            ) : (
              <h3>{ fullName }</h3>
            )}
            <Amount><span>€</span> {props.user.creditBalance}</Amount>
          </div>
        </Container>
};

export default WalletHeader;
