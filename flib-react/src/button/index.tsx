import * as React from 'react';

export interface IButtonProps extends React.ComponentProps<any> {
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
export const Button: React.FunctionComponent<IButtonProps> = (props: IButtonProps): JSX.Element => {

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



