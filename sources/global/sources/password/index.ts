import * as zxcvbn from 'zxcvbn';

export interface PasswordStrengthReport {
    password: string;
    guesses: number;
    guesses_log10: number;
    sequence: {
        pattern: string;
        token: string;
        i: number;
        j: number;
        guesses: number;
        guesses_log10: number;
        sequence_name?: string;
        sequence_space?: number;
        ascending?: boolean;
    }[];
    calc_time: number;
    crack_times_seconds: {
        online_throttling_100_per_hour: number | string;
        online_no_throttling_10_per_second: number | string;
        offline_slow_hashing_1e4_per_second: number | string;
        offline_fast_hashing_1e10_per_second: number | string;
    };
    crack_times_display: {
        online_throttling_100_per_hour: number | string;
        online_no_throttling_10_per_second: number | string;
        offline_slow_hashing_1e4_per_second: number | string;
        offline_fast_hashing_1e10_per_second: number | string;
    };
    score: number;
    feedback: {
        warning: string;
        suggestions: string[];
    };
}

export const getPasswordStrength = (password: string): PasswordStrengthReport => {
    return zxcvbn(password);
};
