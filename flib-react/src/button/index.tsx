import * as React from 'react';

export interface ButtonProps extends React.ComponentProps<any> {
    /**
     * Title of the button
     */
    title: string;

    /**
     * Method called upon button click
     */
    onClick: () => void;

    /**
     * Type of the button
     */
    type: 'primary' | 'warning' | 'error';
}

const colors = {
    'primary': '#188ae2',
    'error': 'red',
    'warning': 'orange'
};

/**
 * This is a Button component
 */
export const Button: React.FunctionComponent<ButtonProps> = (props: ButtonProps): JSX.Element => {

    return <button
        name={props.title}
        onClick={props.onClick}
        style={{
            padding: 10,
            borderRadius: 7,
            backgroundColor: colors[props.type],
            borderColor: colors[props.type],
            cursor: 'pointer'
        }}
    >
        {props.title}
    </button>
};

Button.defaultProps = {
    type: 'primary'
};

export default Button;



