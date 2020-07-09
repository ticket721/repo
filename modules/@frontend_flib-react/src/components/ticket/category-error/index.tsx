import * as React from 'react';
import styled from '../../../config/styled';
import Icon from '../../icon';
import { useState } from 'react';
import { useEffect } from 'react';

export interface CategoryErrorProps extends React.ComponentProps<any> {
    error: string;
    description: string;
}

const Container = styled.article<CategoryErrorProps>`
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

const EventTitle = styled.h3`
    font-size: 16px;
`;

const InfoContainer = styled.div`
    width: calc(100% - 80px - ${(props) => props.theme.smallSpacing});
`;

const PriceDateContainer = styled.div`
    padding-left: ${(props) => props.theme.smallSpacing};
    margin-top: ${(props) => props.theme.regularSpacing};
    margin-bottom: ${(props) => props.theme.regularSpacing};
    height: calc(100% - ${(props) => props.theme.regularSpacing});
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border-left: 2px solid ${(props) => props.theme.componentColorLight};
`;

const PriceDateSelectContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const StarIcon = styled(Icon)`
    margin-right: ${(props) => props.theme.smallSpacing};
`;

const TitleContainer = styled.div`
    display: flex;
    align-items: center;
`;

const CatInErrorContainer = styled.article<CategoryErrorProps>`
    background-color: ${(props) => props.theme.darkerBg};
    font-size: 14px;
    font-weight: 500;
    margin-top: ${(props) => props.theme.biggerSpacing};
    position: relative;
    transition: background-color 300ms ease;
    display: flex;
    justify-content: space-between;

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

interface DateInfos {
    gradient: string[];
    avatar: string;
    eventBegin: string;
}

interface DateSpanProps {
    selected: boolean;
}

const DateSpan = styled.span<DateSpanProps>`
    font-weight: ${(props) => (props.selected ? '600' : '300')};
    opacity: ${(props) => (props.selected ? '1' : '0.5')};
    transition: opacity 0.5s ease-in-out, font-weight 0.2s ease-in-out;

    :not(:last-child) {
        margin-bottom: 4px;
    }
`;

export interface GlobalCategoryInErrorStateProps extends React.ComponentProps<any> {
    dates: DateInfos[];
    starred?: boolean;
    categoryName: string;
    price: string;
    amount: number;
}

const getDateIdx = (max: number, idx: number) => {
    return idx % max;
};

export const GlobalCategoryInErrorState: React.FunctionComponent<GlobalCategoryInErrorStateProps> = (
    props: GlobalCategoryInErrorStateProps,
): JSX.Element => {
    const [selection, setSelection] = useState(0);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSelection(selection + 1);
        }, 5000);
        return () => {
            clearTimeout(timeoutId);
        };
    }, [selection]);

    return (
        <CatInErrorContainer>
            <ImgContainer>
                <img src={props.dates[getDateIdx(props.dates.length, selection)].avatar} />
            </ImgContainer>
            <InfoContainer>
                <TitleContainer>
                    <StarIcon
                        icon={'star'}
                        size={'16px'}
                        color={props.dates[getDateIdx(props.dates.length, selection)].gradient[0]}
                    />
                    <EventTitle>
                        {props.amount} {props.categoryName}
                    </EventTitle>
                </TitleContainer>
                <PriceDateSelectContainer>
                    <PriceDateContainer>
                        <span style={{ marginBottom: 5 }}>{props.price}</span>
                        {props.dates.map((d: DateInfos, idx: number) => (
                            <DateSpan selected={getDateIdx(props.dates.length, selection) === idx} key={idx}>
                                {d.eventBegin}
                            </DateSpan>
                        ))}
                    </PriceDateContainer>
                </PriceDateSelectContainer>
            </InfoContainer>
        </CatInErrorContainer>
    );
};

export interface CategoryInErrorStateProps extends React.ComponentProps<any> {
    starred?: boolean;
    color?: string;
    gradient?: string[];
    categoryName: string;
    image: string;
    price: string;
    date: string;
    amount: number;
}

export const CategoryInErrorState: React.FunctionComponent<CategoryInErrorStateProps> = (
    props: CategoryInErrorStateProps,
): JSX.Element => {
    return (
        <CatInErrorContainer selected={props.selected} gradient={props.gradient}>
            <ImgContainer>
                <img src={props.image} />
            </ImgContainer>
            <InfoContainer>
                <TitleContainer>
                    {props.starred ? <StarIcon icon={'star'} size={'16px'} color={props.color} /> : null}
                    <EventTitle>
                        {props.amount} {props.categoryName}
                    </EventTitle>
                </TitleContainer>
                <PriceDateSelectContainer>
                    <PriceDateContainer>
                        <span style={{ marginBottom: 5 }}>{props.price}</span>
                        <span>{props.date}</span>
                    </PriceDateContainer>
                </PriceDateSelectContainer>
            </InfoContainer>
        </CatInErrorContainer>
    );
};

export const CategoryError: React.FunctionComponent<CategoryErrorProps> = (props: CategoryErrorProps): JSX.Element => {
    return (
        <Container>
            <div>
                <EventTitle>{props.error}</EventTitle>
                <p>{props.description}</p>
                {props.children}
            </div>
        </Container>
    );
};

CategoryError.defaultProps = {
    color: '#079CF0',
    gradient: ['#079CF0', '#2143AB'],
};

export default CategoryError;
