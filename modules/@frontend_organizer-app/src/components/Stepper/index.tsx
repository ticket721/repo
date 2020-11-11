import { Icon } from '@frontend/flib-react/lib/components';
import React from 'react';
import styled from 'styled-components';

export type StepStatus = 'complete' | 'edit' | 'invalid';

interface StepItem {
    label: string;
    status: StepStatus;
}

export interface StepperProps {
    steps: StepItem[];
    editStep: number;
    onStepClick: (idx: number) => void;
}

const getStatusIcon = (status: StepStatus): string => {
    switch (status) {
        case 'complete': return 'check';
        default: return 'close';
    }
}

export const Stepper: React.FC<StepperProps> = ({ steps, editStep, onStepClick }) => {
    const stepCount = steps.length;

    return <StepperContainer stepCount={stepCount}>
        <Gauge>
            <Progress editStep={editStep} stepCount={stepCount}/>
        </Gauge>
        {
            steps.map((step, idx) =>
                <Step
                key={step.label}
                status={step.status}
                disabled={idx > editStep}
                onClick={() => {
                    onStepClick(idx);
                }}>
                    {
                        idx > editStep || !step.status || step.status === 'edit' ?
                            <span className={'step-idx'}>{idx + 1}</span> :
                            <Icon
                            icon={getStatusIcon(step.status)}
                            size={'12px'}
                            color={'white'} />
                    }
                    <StepLabel disabled={idx > editStep}>{step.label}</StepLabel>
                </Step>
            )
        }
    </StepperContainer>
}

const StepperContainer = styled.div<{ stepCount: number }>`
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    height: calc(${props => props.stepCount} * 60px);
`;

const Gauge = styled.div`
    position: absolute;
    width: 5px;
    height: 100%;
    background-color: ${props => props.theme.componentColorLight};
`;

const Progress = styled.div<{ editStep: number, stepCount: number }>`
    width: 100%;
    height: calc(${props => props.editStep} * ${props => Math.round(100 / (props.stepCount - 1))}%);
    background: ${props => `linear-gradient(0deg, ${props.theme.primaryColor.hex}, ${props.theme.primaryColorGradientEnd.hex})`};

    transition: height 500ms;
`;

const Step = styled.div<{ status: StepStatus, disabled: boolean }>`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    height: ${props => props.disabled ? props.theme.biggerSpacing : '30px'};
    width: ${props => props.disabled ? props.theme.biggerSpacing : '30px'};
    background: ${props => {
        if (props.disabled) return '#181721';
        switch(props.status) {
            case 'invalid': return props.theme.errorColor.hex;
            default: return `linear-gradient(260deg, ${props.theme.primaryColor.hex}, ${props.theme.primaryColorGradientEnd.hex})`;
        }
    }};

    transition: height 300ms, width 300ms, background 300ms;

    .step-idx {
        margin-top: 4px;
        font-size: ${props => props.disabled ? '12px' : '15px'};
        color: ${props => props.disabled ? props.theme.textColorDark : props.theme.textColor};

        transition: font-size 300ms, color 300ms;
    }
`;

const StepLabel = styled.div<{ disabled: boolean }>`
    position: absolute;
    left: ${props => props.disabled ? '30px' : '40px'};
    font-size: ${props => props.disabled ? '12px' : '14px'};
    font-weight: ${props => props.disabled ? '400' : '500'};
    color: ${props => props.disabled ? props.theme.textColorDark : props.theme.textColor};

    transition: left 300ms, font-size 300ms, color 300ms;
`;
