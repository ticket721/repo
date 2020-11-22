import * as React from 'react';
import styled from '../../../config/styled';

export interface CardContainerProps extends React.ComponentProps<any> {
    removeBg?: boolean;
    small?: boolean;
    paddingOverride?: string;
}

const Container = styled.section<CardContainerProps>`
    background-color: ${(props) => (props.removeBg ? 'transparent' : props.theme.darkerBg)};
    display: flex;
    flex-wrap: wrap;
    font-size: 14px;
    font-weight: 500;
    padding: ${(props) => props.paddingOverride || (props.small ? '12px 24px' : props.theme.biggerSpacing)};
    position: relative;
    transition: background-color 300ms;
`;

export const CardContainer: React.FunctionComponent<CardContainerProps & { className?: string }> = (
    props: CardContainerProps,
): JSX.Element => {
    return (
        <Container
            className={props.className}
            paddingOverride={props.paddingOverride}
            removeBg={props.removeBg}
            small={props.small}
        >
            {props.children}
        </Container>
    );
};

export default CardContainer;
