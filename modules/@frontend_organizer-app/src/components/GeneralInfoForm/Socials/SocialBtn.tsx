import React from 'react';
import styled                      from 'styled-components';

export interface SocialBtnProps {
    name: string;
    pic: string;
    onClick: () => void;
}

export const SocialBtn: React.FC<SocialBtnProps> = ({ name, pic, onClick }: SocialBtnProps) => (
    <SocialBtnContainer
    title={name}
    onClick={onClick}>
        <img src={pic} alt={name}/>
    </SocialBtnContainer>
);

const SocialBtnContainer = styled.div`
    display: flex;
    justify-content: center;
    cursor: pointer;
    width: 50px;
    height: 50px;

    img {
        width: 40px;
        transition: 200ms width;
    }

    :hover > img {
        width: 50px;
    }
`;
