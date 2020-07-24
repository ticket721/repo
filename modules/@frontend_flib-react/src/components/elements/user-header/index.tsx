import * as React from 'react';
import styled from '../../../config/styled';

export interface WalletHeaderProps extends React.ComponentProps<any> {
    username: string;
    picture: string;
    tickets: string;
    profileHeader?: boolean;
}

const Container = styled.section<WalletHeaderProps>`
    align-items: center;
    display: flex;
    flex-direction: ${(props) => (props.profileHeader ? 'row-reverse' : 'row')};
    padding: ${(props) => props.theme.biggerSpacing};
    width: 100%;

    ${(props) =>
        props.profileHeader &&
        `
    div:last-of-type {
      margin-right: auto;
      padding-right: ${props.theme.regularSpacing};
    }
  `}
`;
const ImgContainer = styled.div<WalletHeaderProps>`
    border-radius: 100%;
    height: ${(props) => (props.profileHeader ? '80px' : '40px')};
    margin-right: ${(props) => (props.profileHeader ? 0 : props.theme.smallSpacing)};
    overflow: hidden;
    width: ${(props) => (props.profileHeader ? '80px' : '40px')};

    img {
        height: 100%;
        object-fit: cover;
        width: 100%;
    }
`;

const Amount = styled.h4`
    color: ${(props) => props.theme.textColorDark};
    display: block;
    font-size: 14px;

    span {
        margin-right: 10px;
    }
`;

export const WalletHeader: React.FunctionComponent<WalletHeaderProps & { className?: string }> = (
    props: WalletHeaderProps,
): JSX.Element => {
    return (
        <Container profileHeader={props.profileHeader} className={props.className}>
            <ImgContainer profileHeader={props.profileHeader}>
                <img src={props.picture} alt={props.username} />
            </ImgContainer>
            <div>
                {props.profileHeader ? <h1>{props.username}</h1> : <h3>{props.username}</h3>}
                <Amount>
                    <span>🎫</span>
                    {props.tickets}
                </Amount>
            </div>
        </Container>
    );
};

export default WalletHeader;
