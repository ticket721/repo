import { CustomDatePicker, Icon, SelectInput, TextInput, Toggle } from '@frontend/flib-react/lib/components';
import React, { useState } from 'react';
import styled from 'styled-components';
import './locales';
import { useTranslation }              from 'react-i18next';
import { DateRange, SaleDeltas, useCategoryCreationFields } from './useCategoryCreationFields';
import { humanizeTime } from '@frontend/core/lib/utils/date';

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
        priceProps,
        duplicateOnProps,
        relativeSaleDeltas,
    } = useCategoryCreationFields(dateRanges, parentField);

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
                <TextInput
                icon={'euro'}
                iconColor={sigColors && sigColors[0]}
                {...priceProps} />
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
    margin-bottom: ${props => props.theme.regularSpacing};

    & > div {
        width: calc(50% - ${props => props.theme.smallSpacing});
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
