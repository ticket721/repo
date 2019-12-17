import {use, expect} from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
use(chaiAsPromised);

import {setVerbosity}                                  from '../log';
import { getPasswordStrength, PasswordStrengthReport } from './index';

setVerbosity(true);

describe('Password', function() {

    describe('getPasswordStrength', function() {

        it('check "test" password', function() {
            const report: PasswordStrengthReport = getPasswordStrength('test');
            expect(report.score).to.equal(0);
            expect(report.feedback.warning).to.equal('This is a top-100 common password');
            expect(report.feedback.suggestions).to.deep.equal([
                'Add another word or two. Uncommon words are better.'
            ]);
        });

        it('check "sqdc123_+" ', function() {
            const report: PasswordStrengthReport = getPasswordStrength('sqdc123_+');
            expect(report.score).to.equal(3);
            expect(report.feedback.warning).to.equal('');
            expect(report.feedback.suggestions).to.deep.equal([]);
        });

        it('check "password123"', function() {
            const report: PasswordStrengthReport = getPasswordStrength('password123');
            expect(report.score).to.equal(0);
            expect(report.feedback.warning).to.equal('This is a very common password');
            expect(report.feedback.suggestions).to.deep.equal([
                'Add another word or two. Uncommon words are better.'
            ]);
        });

        it('check "9j7G5D6y8G5e4W33rt5N-_"', function() {
            const report: PasswordStrengthReport = getPasswordStrength('9j7G5D6y8G5e4W33rt5N-_');
            expect(report.score).to.equal(4);
            expect(report.feedback.warning).to.equal('');
            expect(report.feedback.suggestions).to.deep.equal([]);
        });

    });

});
