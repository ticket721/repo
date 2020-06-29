import * as React from 'react';
import styled from '../../../config/styled';
import Select from '../../inputs/select';

export interface CategoryQtyProps extends React.ComponentProps<any> {
    color?: string;
    gradient?: string[];
    categoryName: string;
    image: string;
    price: string;
    date: string;
    options: { value: any; label: string }[];
}

const Container = styled.article<CategoryQtyProps>`
    background-color: ${(props) => props.theme.darkerBg};
    border-bottom: 2px solid #000;
    font-size: 14px;
    font-weight: 500;
    padding: ${(props) => props.theme.biggerSpacing};
    position: relative;
    transition: background-color 300ms ease;
    display: flex;
    justify-content: space-between;

    &:last-of-type {
        border: none;
    }

    h3 {
        position: relative;
        top: 4px;
    }

    h4 {
        font-size: 15px;
        margin: 4px 0 ${(props) => props.theme.smallSpacing};

        &.uppercase {
            color: ${(props) => props.theme.textColorDarker};
            margin: 0 0 ${(props) => props.theme.regularSpacing};
        }

        & + span {
            color: ${(props) => props.theme.textColorDarker};
        }
    }

    p {
        color: ${(props) => props.theme.textColorDark};
        margin-top: ${(props) => props.theme.regularSpacing};
    }
`;

const ImgContainer = styled.div`
    border-radius: ${(props) => props.theme.defaultRadius};
    height: 80px;
    margin-right: ${(props) => props.theme.regularSpacing};
    overflow: hidden;
    width: 80px;

    &.icon {
        align-items: center;
        background-color: ${(props) => props.theme.componentColorLight};
        height: 56px;
        display: flex;
        justify-content: center;
        width: 56px;

        svg {
            height: 24px;
        }
    }

    img {
        height: 100%;
        object-fit: cover;
        width: 100%;
    }
`;

const EventTitle = styled.h3``;

const InfoContainer = styled.div`
    width: calc(100% - 80px - ${(props) => props.theme.smallSpacing});
`;

const PriceDateContainer = styled.div`
    height: calc(100% - ${(props) => props.theme.regularSpacing});
    margin-top: ${(props) => props.theme.regularSpacing};
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

const PriceDateSelectContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

export const CategoryQty: React.FunctionComponent<CategoryQtyProps> = (props: CategoryQtyProps): JSX.Element => {
    return (
        <Container selected={props.selected} gradient={props.gradient}>
            <ImgContainer>
                <img src={props.image} />
            </ImgContainer>
            <InfoContainer>
                <EventTitle>{props.categoryName}</EventTitle>
                <PriceDateSelectContainer>
                    <PriceDateContainer>
                        <span>{props.price}</span>
                        <span>{props.date}</span>
                    </PriceDateContainer>
                    <Select defaultValue={props.options[0]} options={props.options} menu searchable={false} />
                </PriceDateSelectContainer>
            </InfoContainer>
        </Container>
    );
};

CategoryQty.defaultProps = {
    color: '#079CF0',
    gradient: ['#079CF0', '#2143AB'],
};

export default CategoryQty;
