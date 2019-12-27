import * as React       from 'react';
import * as renderer    from 'react-test-renderer';
import { IButtonProps } from '@components/button/index';
import { Button }       from './index';
import { shallow }      from 'enzyme';

describe('Button Rendering Snapshot Tests', function () {

    it('Button renders correctly', function () {

        const props: IButtonProps = {
            onClick: () => {
            },
            type: 'primary',
            title: 'test'
        };

        const tree = renderer
            .create(<Button {...props} />)
            .toJSON();

        expect(tree).toMatchSnapshot();
    });

});

describe('Button Functional DOM Tests', function () {


    it("Button click works", () => {

        let value = false;

        const props: IButtonProps = {
            onClick: () => {
                value = true;
            },
            type: 'primary',
            title: 'test'
        };
        const button = shallow(<Button {...props}/>);

        button.simulate('click');

        expect(value).toBeTruthy();

    });

});
