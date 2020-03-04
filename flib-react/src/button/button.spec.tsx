import * as React       from 'react';
import * as renderer   from 'react-test-renderer';
import { ButtonProps } from '@components/button/index';
import { Button }      from './index';
import { shallow }      from 'enzyme';

describe('Button Rendering Snapshot Tests', function () {

    it('Button renders correctly', function () {

        const props: ButtonProps = {
            onClick: () => {},
            type: 'primary',
            title: 'test',
            gradientStart: '#079CF0',
            gradientEnd: '#fff'
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

        const props: ButtonProps = {
            onClick: () => {
                value = true;
            },
            type: 'primary',
            title: 'test',
            gradientStart: '#079CF0',
            gradientEnd: '#2143AB'
        };
        const button = shallow(<Button {...props}/>);

        button.simulate('click');

        expect(value).toBeTruthy();

    });

});
