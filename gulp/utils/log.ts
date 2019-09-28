import { Signale } from 'signale';

const config = {
    types: {
        fatal: {
            badge: '❗️',
            label: ''
        },

        info: {
            badge: '➡️',
            label: ''
        },

        error: {
            badge: '❌',
            label: ''
        },

        warning: {
            badge: '⚠️',
            label: ''
        },

        success: {
            badge: '✅',
            label: ''
        },

        spawnlog: {
            badge: '📙',
            label: '',
            color: 'white',
            logLevel: 'info'
        },

        spawnerr: {
            badge: '📕',
            label: '',
            color: 'red',
            logLevel: 'error'
        }
    }

};

/**
 * Core log entity, should be scoped in each used module
 */
export const core_log: Signale = new Signale(config as any);

/**
 * Repo log entity
 */
export const repo_log: Signale = core_log.scope('📦');

