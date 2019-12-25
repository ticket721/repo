import {setVerbosity}                                  from '../log';
import { getPasswordStrength, PasswordStrengthReport } from './index';

setVerbosity(true);

describe('Password', function() {

    describe('getPasswordStrength', function() {

        test('check "test" password', async function() {
            const report: PasswordStrengthReport = getPasswordStrength('test');
            expect(report.score).toEqual(0);
            expect(report.feedback.warning).toEqual('This is a top-100 common password');
            expect(report.feedback.suggestions).toEqual([
                'Add another word or two. Uncommon words are better.'
            ]);
        });

        test('check "sqdc123_+" ', async function() {
            const report: PasswordStrengthReport = getPasswordStrength('sqdc123_+');
            expect(report.score).toEqual(3);
            expect(report.feedback.warning).toEqual('');
            expect(report.feedback.suggestions).toEqual([]);
        });

        test('check "password123"', async function() {
            const report: PasswordStrengthReport = getPasswordStrength('password123');
            expect(report.score).toEqual(0);
            expect(report.feedback.warning).toEqual('This is a very common password');
            expect(report.feedback.suggestions).toEqual([
                'Add another word or two. Uncommon words are better.'
            ]);
        });

        test('check "9j7G5D6y8G5e4W33rt5N-_"', async function() {
            const report: PasswordStrengthReport = getPasswordStrength('9j7G5D6y8G5e4W33rt5N-_');
            expect(report.score).toEqual(4);
            expect(report.feedback.warning).toEqual('');
            expect(report.feedback.suggestions).toEqual([]);
        });

    });

});
