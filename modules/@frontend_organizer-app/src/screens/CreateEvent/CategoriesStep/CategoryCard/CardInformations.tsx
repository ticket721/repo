import React from 'react';
import { EventCreationPayload } from '@common/global';
import { useFormikContext } from 'formik';
import styled from 'styled-components';
import { Icon } from '@frontend/flib-react/lib/components';
import { format as formatDate } from '@frontend/core/lib/utils/date';
import { format as formatPrice } from '@common/global/lib/currency';
import { useTranslation }     from 'react-i18next';
import './locales';

export interface CardInformationsProps {
    idx: number;
}

export const CardInformations: React.FC<CardInformationsProps> = ({ idx }) => {
    const [ t ] = useTranslation('category_card');
    const formikCtx = useFormikContext<EventCreationPayload>();
    const primaryColor = formikCtx.values.imagesMetadata.signatureColors[0];

    return <CardInformationsContainer>
        <SaleLabel>
            <Icon
            icon={'calendar'}
            size={'16px'}
            color={primaryColor}/>
            <span>{t('sale_label')}</span>
        </SaleLabel>
        <CategorySaleDates>
            <span>{formatDate(formikCtx.values.categoriesConfiguration[idx].saleBegin)}</span>
            <Arrow
                icon={'arrow'}
                size={'14px'}
                color={'rgba(255, 255, 255, 0.9)'}/>
            <span>{formatDate(formikCtx.values.categoriesConfiguration[idx].saleEnd)}</span>
        </CategorySaleDates>
        <SeatsAndPrice>
            <Seats>
                <div className={'seat-count'}>
                    {formikCtx.values.categoriesConfiguration[idx].seats}
                </div>
                <Icon
                icon={'seat'}
                color={primaryColor}
                size={'18px'} />
            </Seats>
            <Price primaryColor={primaryColor}>{
                formikCtx.values.categoriesConfiguration[idx].currency.toUpperCase() === 'FREE' ?
                t('free') :
                formatPrice(formikCtx.values.categoriesConfiguration[idx].currency, formikCtx.values.categoriesConfiguration[idx].price)
            }</Price>
        </SeatsAndPrice>
    </CardInformationsContainer>;
}

const CardInformationsContainer = styled.div`
    position: relative;
`;

const SaleLabel = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: ${props => props.theme.regularSpacing};

    & > span:last-child {
        margin-top: 5px;
        margin-left: ${props => props.theme.smallSpacing};
        font-size: 14px;
        font-weight: 500;
    }
`;

const CategorySaleDates = styled.div`
    display: flex;
    align-items: center;
    font-size: 15px;
`;

const Arrow = styled(Icon)`
    margin: -4px 20px 0;
`;

const SeatsAndPrice = styled.div`
    position: absolute;
    bottom: -8px;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
`;

const Price = styled.span<{ primaryColor: string }>`
    font-size: 24px;
    color: ${props => props.primaryColor};
`;

const Seats = styled.span`
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-weight: 500;

    .seat-count {
        margin-top: 5px;
        margin-right: ${props => props.theme.smallSpacing};
        font-size: 16px;
        font-weight: 600;
    }
`;
