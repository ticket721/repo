import * as React from 'react';
import styled from '../../../config/styled';
import { detect } from 'detect-browser';
import Button from '../../button';
import { injectBlur } from '../../../utils/blur';

const browser = detect();

export interface FullButtonCtaProps extends React.ComponentProps<any> {
    ctaLabel: string;
    variant?: string;
    show?: boolean;
    loading?: boolean;
    gradients?: string[];
    onClick: () => void;
}

const CtaContainer = styled.div<FullButtonCtaProps>`
    align-items: center;

    ${injectBlur('rgba(33, 29, 45, 0.2)', 'rgba(33, 29, 45, 1)')};

    border-top-left-radius: ${(props) => props.theme.bigRadius};
    border-top-right-radius: ${(props) => props.theme.bigRadius};
    bottom: 0;
    display: flex;
    font-size: 14px;
    font-weight: 500;
    justify-content: center;
    left: 0;
    opacity: 0;
    padding: ${(props) => props.theme.regularSpacing} ${(props) => props.theme.biggerSpacing};
    padding-bottom: calc(${(props) => props.theme.regularSpacing} + env(safe-area-inset-bottom));
    padding-bottom: calc(${(props) => props.theme.regularSpacing} + constant(safe-area-inset-bottom));
    position: fixed;
    transform: translateY(100%);
    transition: all 300ms ease, opacity 450ms ease;
    width: 100%;
    max-width: 900px;
    z-index: 9999;

    @media screen and (min-width: 900px) {
        margin-left: calc((100% - 900px) / 2);
    }
    ${(props) =>
        props.show &&
        `
    opacity: 1;
    transform: translateY(0%);
  `}

    h4 {
        color: ${browser?.name === 'firefox' ? '#9a989a' : (props) => props.theme.textColorDarker};
        margin-bottom: ${(props) => props.theme.smallSpacing};
    }

    div {
        padding-right: 24px;
        width: 50%;
    }

    button {
        margin: 0;
        max-width: 500px;
    }
`;

export const FullButtonCta: React.FunctionComponent<FullButtonCtaProps & { className?: string }> = (
    props: FullButtonCtaProps,
): JSX.Element => {
    return (
        <CtaContainer show={props.show} className={props.className}>
            <Button
                loadingState={props.loading}
                title={props.ctaLabel}
                variant={props.loading ? 'disabled' : (props.variant as any) || 'custom'}
                gradients={props.gradients}
                onClick={props.loading ? undefined : props.onClick}
            />
        </CtaContainer>
    );
};

FullButtonCta.defaultProps = {
    gradients: ['#079CF0', '#2143AB'],
};

export default FullButtonCta;
