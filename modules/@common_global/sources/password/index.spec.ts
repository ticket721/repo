import {setVerbosity}                                  from '../log';
import { getPasswordStrength, PasswordStrengthReport } from './index';

setVerbosity(true);

describe('Password', function() {

    describe('getPasswordStrength', function() {

        test('check "test" password', async function() {
            const report: PasswordStrengthReport = getPasswordStrength('computer');
            expect(report.score).toEqual(0);
            expect(report.feedback.warning).toEqual('warning_top_100_common_password');
            expect(report.feedback.suggestions).toEqual([
                'suggestion_too_weak'
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
            expect(report.feedback.warning).toEqual('warning_common_password');
            expect(report.feedback.suggestions).toEqual([
                'suggestion_too_weak'
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
