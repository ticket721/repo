import { CustomDatePicker, Icon, PriceInput, SelectInput, TextInput, Toggle } from '@frontend/flib-react/lib/components';
import React, { useState } from 'react';
import styled from 'styled-components';
import './locales';
import { useTranslation }              from 'react-i18next';
import { DateRange, SaleDeltas, useCategoryCreationFields } from './useCategoryCreationFields';
import { humanizeTime } from '@frontend/core/lib/utils/date';
import { format } from '@common/global';
import ReactTooltip from 'react-tooltip';

export interface CategoryFieldsProps {
    parentField?: string;
    dateRanges: DateRange[];
    sigColors?: string[];
    onDuplicate: (relativeSaleDeltas: SaleDeltas, dates?: number[]) => void;
}

export const CategoryFields: React.FC<CategoryFieldsProps> = ({ parentField, dateRanges, sigColors, onDuplicate }) => {
    const [ t, i18n ] = useTranslation('category_fields');
    const {
        ticketTypeProps,
        datesProps,
        nameProps,
        saleBeginProps,
        saleEndProps,
        seatsProps,
        freeToggleProps,
        priceProps,
        maxEuroAmountProps,
        maxInternationalAmountProps,
        duplicateOnProps,
        relativeSaleDeltas,
    } = useCategoryCreationFields(dateRanges, parentField);

    const [ onEuroPriceEdit, setOnEuroPriceEdit ] = useState<boolean>(true);
    const [ duplicate, setDuplicate ] = useState<boolean>(false);

    return <FormContainer>
        {
            dateRanges.length > 1 ?
            <MultiDatesToggle>
                <Toggle
                {...ticketTypeProps}
                custom={{
                    on: {
                        char: '2+',
                        size: '14px',
                    },
                    off: {
                        char: '1',
                        size: '14px',
                    }
                }}
                gradient={sigColors && !!sigColors[0] ? sigColors : undefined}
                />
            </MultiDatesToggle>
            : null
        }
        <TextInput {...nameProps} />
        <DatesSelect>
            <SelectInput {...datesProps} />
            {
                (ticketTypeProps.checked
                && datesProps.value?.length === 1) ?
                <WarningMin>
                    {t('warning_min_dates')}
                </WarningMin> :
                null
            }
        </DatesSelect>
        <SaleConfig disabled={
            !datesProps.value
            || (
                ticketTypeProps.checked
                && datesProps.value.length <= 1
            )
        }>
            <div>{t('sale_config')}</div>
            <SeatsAndPrice>
                <TextInput
                {...seatsProps}
                icon={'seat'}
                iconColor={sigColors && sigColors[0]} />
                <PriceConfig isFree={freeToggleProps.checked}>
                    <Toggle
                    className={'toggle'}
                    {...freeToggleProps}
                    gradient={sigColors && !!sigColors[0] ? sigColors : undefined} />
                    <PriceInput
                    currColor={sigColors && sigColors[0]}
                    {...priceProps}/>
                    <ReceivedAmount>
                        {
                            onEuroPriceEdit ?
                            <div style={{ position: 'relative'}}>
                                <PriceInput
                                currColor={sigColors && sigColors[0]}
                                currency={priceProps.currency}
                                disabledCurr={true}
                                tooltipId={'euro-card-received-amount-infos'}
                                tooltipMsgs={[
                                    t('received_amount_tooltip_1'),
                                    t('received_amount_tooltip_2'),
                                ]}
                                {...maxEuroAmountProps}/>
                                {/* eslint-disable-next-line */}
                                <CardEmoji
                                role={'img'}
                                aria-label={'card type euro'}
                                data-tip
                                data-for={'card-type-euro-infos'}>🇪🇺</CardEmoji>
                                <ReactTooltip id={'card-type-euro-infos'} place={'bottom'} effect={'solid'}>
                                    {t('card_type_euro')}
                                </ReactTooltip>
                            </div> :
                            <div style={{ position: 'relative'}}>
                                <PriceInput
                                currColor={sigColors && sigColors[0]}
                                currency={priceProps.currency}
                                disabledCurr={true}
                                tooltipId={'non-euro-card-received-amount-infos'}
                                tooltipMsgs={[
                                    t('received_amount_tooltip_1'),
                                    t('received_amount_tooltip_2'),
                                ]}
                                {...maxInternationalAmountProps}/>
                                {/* eslint-disable-next-line */}
                                <CardEmoji
                                role={'img'}
                                aria-label={'card type non euro'}
                                data-tip
                                data-for={'card-type-non-euro-infos'}>🌐</CardEmoji>
                                <ReactTooltip id={'card-type-non-euro-infos'} place={'bottom'} effect={'solid'}>
                                    {t('card_type_non_euro')}
                                </ReactTooltip>
                            </div>
                        }
                        {
                            onEuroPriceEdit ?
                            <>
                                <OtherPriceMsg
                                data-tip
                                data-for={'card-type-non-euro-infos-second'}
                                onClick={() => setOnEuroPriceEdit(false)}>
                                    <span
                                    role={'img'}
                                    aria-label={'card type non euro'}
                                    style={{
                                        fontSize: 18,
                                        paddingRight: 8
                                    }}>🌐</span>
                                    <span>
                                        {
                                            format(priceProps.currency, maxInternationalAmountProps.value)
                                        }
                                    </span>
                                </OtherPriceMsg>
                                <ReactTooltip id={'card-type-non-euro-infos-second'} place={'bottom'} effect={'solid'}>
                                    {t('card_type_non_euro')}
                                </ReactTooltip>
                            </> :
                            <>
                                <OtherPriceMsg
                                data-tip
                                data-for={'card-type-euro-infos-second'}
                                onClick={() => setOnEuroPriceEdit(true)}>
                                    <span
                                    role={'img'}
                                    aria-label={'card type euro'}
                                    style={{
                                        fontSize: 20,
                                        paddingRight: 8,
                                        paddingTop: 2
                                    }}>🇪🇺</span>
                                    <span>
                                        {
                                            format(priceProps.currency, maxEuroAmountProps.value)
                                        }
                                    </span>
                                </OtherPriceMsg>
                                <ReactTooltip id={'card-type-euro-infos-second'} place={'bottom'} effect={'solid'}>
                                    {t('card_type_euro')}
                                </ReactTooltip>
                            </>
                        }
                    </ReceivedAmount>
                </PriceConfig>
            </SeatsAndPrice>
            <SaleDateRangeInput>
                <CustomDatePicker
                {...saleBeginProps}
                onChange={(e) => {
                    saleBeginProps.onChange(e);
                    onDuplicate(relativeSaleDeltas);
                }}
                gradients={sigColors && !!sigColors[0] ? sigColors : undefined} />
                <Icon
                icon={'arrow'}
                color={'white'}
                size={'16px'} />
                <CustomDatePicker
                {...saleEndProps}
                onChange={(e) => {
                    saleEndProps.onChange(e);
                    onDuplicate(relativeSaleDeltas);
                }}
                gradients={sigColors && !!sigColors[0] ? sigColors : undefined} />
            </SaleDateRangeInput>
            {
                relativeSaleDeltas ?
                    <RelativeDeltaMsg>{t('relative_end', {
                            time: humanizeTime(relativeSaleDeltas.endSaleDelta, i18n.language.substring(0, 2))
                        })}
                        <span>{t('relative_end_tooltip')}</span>
                    </RelativeDeltaMsg> :
                    null
            }
            {
                !ticketTypeProps.checked && dateRanges.length > 1 ?
                    <DuplicateContainer>
                        {
                            duplicateOnProps && duplicate ?
                                <SelectInput
                                {...duplicateOnProps}
                                onChange={(options) => {
                                    duplicateOnProps.onChange(options);
                                    onDuplicate(
                                        relativeSaleDeltas,
                                        options.map(opt => parseInt(opt.value, 10)),
                                    );
                                }} />
                                : <span onClick={() => setDuplicate(true)}>{t('duplicate_msg')}</span>
                        }
                    </DuplicateContainer>
                : null
            }
        </SaleConfig>
    </FormContainer>;
}

const FormContainer = styled.div`
    width: 100%;
    position: relative;
`;

const MultiDatesToggle = styled.div`
    position: absolute;
    top: -45px;
    right: 0;

    & label > div {
        margin-top: -2px;
    }
`;

const DatesSelect = styled.div`
    position: relative;
    margin-top: ${props => props.theme.regularSpacing};
`;

const WarningMin = styled.span`
    position: absolute;
    bottom: -${props => props.theme.regularSpacing};
    color: ${props => props.theme.warningColor.hex};
`;

const SaleConfig = styled.div<{ disabled: boolean }>`
    opacity: ${props => props.disabled ? '0.6' : '1'};
    margin-top: ${props => props.theme.biggerSpacing};

    & * {
        pointer-events: ${props => props.disabled ? 'none' : 'auto'} !important;
    }

    & > div:first-child {
        font-size: 14px;
        font-weight: 500;
        margin-left: ${props => props.theme.smallSpacing};
        margin-bottom: ${props => props.theme.smallSpacing};
    }
`;

const SaleDateRangeInput = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;

    & > div {
        width: calc(50% - ${props => props.theme.smallSpacing} - 20px);
    }
`;

const SeatsAndPrice = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${props => props.theme.regularSpacing};

    & > div:first-child {
        width: calc(40% - ${props => props.theme.smallSpacing});
    }

    & > div:last-child {
        width: calc(60% - ${props => props.theme.smallSpacing});
    }
`;

const PriceConfig = styled.div< { isFree: boolean } >`
    display: flex;
    flex-direction: column;

    .toggle {
        margin-bottom: calc(${props => props.theme.biggerSpacing} / 2);

        label {
            color: ${props => props.isFree ? props.theme.textColor : props.theme.textColorDarker};
            justify-content: flex-end;
            padding-top: 3px;
            text-transform: uppercase;
        }
    }
`;

const RelativeDeltaMsg = styled.div`
    position: relative;
    display: inline-block;
    margin-top: ${props => props.theme.smallSpacing};
    font-weight: 400;
    font-style: italic;
    border-bottom: 1px dotted ${props => props.theme.textColor};

    & > span {
        margin-left: -120px;
        opacity: 0;
        visibility: hidden;
        background-color: ${props => props.theme.darkerBg};
        text-align: start;
        border-radius: 6px;
        padding: ${props => props.theme.smallSpacing};
        position: absolute;
        font-style: normal;
        z-index: 1;
        top: 150%;
        left: 50%;
        font-size: 12px;
        transition: opacity 300ms, visibility 300ms;
        box-shadow: 0 0 1px black;

        &::after {
            content: "";
            position: absolute;
            bottom: 100%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: transparent transparent ${props => props.theme.darkerBg} transparent;
        }
    }

    &:hover > span {
        opacity: 1;
        visibility: visible;
    }
`;

const DuplicateContainer = styled.div`
    margin-top: ${props => props.theme.biggerSpacing};

    & > span {
        font-weight: 500;
        color: ${props => props.theme.textColor};
        text-decoration: underline;
    }
`;

const ReceivedAmount = styled.div`
    margin-top: ${props => props.theme.regularSpacing};
    font-weight: 400;
`;

const CardEmoji = styled.span`
    position: absolute;
    right: 12px;
    bottom: 8px;
    font-size: 22px;
    cursor: pointer;
`;

const OtherPriceMsg = styled.div`
    display: flex;
    align-items: center;
    height: 20px;
    margin: ${props => props.theme.smallSpacing};
    font-size: 14px;
    cursor: pointer;
    width: fit-content;

    :hover > span:last-child {
        text-decoration: underline;
    }
`;