import * as React from 'react';
import styled from '../../../config/styled';
import UserInterface from '../../../shared/userInterface';


export interface WalletHeaderProps extends React.ComponentProps<any> {
  user: UserInterface;
}

const Container = styled.section`
  align-items: center;
  display: flex;
  padding: ${props => props.theme.biggerSpacing} ${props => props.theme.biggerSpacing} 0;
  width: 100%;

`
const ImgContainer = styled.div`
  border-radius: 100%;
  height: 48px;
  margin-right: ${props => props.theme.regularSpacing};
  overflow: hidden;
  width: 48px;

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

  return <Container>
          <ImgContainer>
            <img src={props.user.profilePicture} alt={fullName}/>
          </ImgContainer>
          <div>
            <h3>{ fullName }</h3>
            <Amount><span>€</span> {props.user.creditBalance}</Amount>
          </div>
        </Container>
};

export default WalletHeader;
