
var migration1596712433 = {
    up : async function (db, handler) {
        const stripe_interface_fields_deletion = {
            query: `ALTER TABLE ticket721.stripe_interface
            DROP (connect_account_business_type, connect_account_status);`,
            params: []
        };

        const stripe_interface_connect_account_error_creation = {
            query: `CREATE TYPE IF NOT EXISTS ticket721.connect_account_error (
                        code text,
                        reason text,
                        requirement text
                    );`,
            params: []
        };

        const stripe_interface_connect_account_external_account_creation = {
            query: `CREATE TYPE IF NOT EXISTS ticket721.connect_account_external_account (
                        id text,
                        country text,
                        currency text,
                        last4 text,
                        name text,
                        status text,
                        fingerprint text,
                        default_for_currency boolean
                    );`,
            params: []
        };

        const stripe_interface_connect_account_capability_creation = {
            query: `CREATE TYPE IF NOT EXISTS ticket721.connect_account_capability (
                        name text,
                        status text
                    );`,
            params: []
        };

        const stripe_interface_fields_creation = {
            query: `ALTER TABLE ticket721.stripe_interface
             ADD (
                 connect_account_capabilities list<frozen<ticket721.connect_account_capability>>,
                 connect_account_current_deadline timestamp,
                 connect_account_currently_due list<text>,
                 connect_account_past_due list<text>,
                 connect_account_eventually_due list<text>,
                 connect_account_pending_verification list<text>,
                 connect_account_errors list<frozen<ticket721.connect_account_error>>,
                 connect_account_disabled_reason text,
                 connect_account_external_accounts list<frozen<ticket721.connect_account_external_account>>,
                 connect_account_name text,
                 connect_account_type text
             );`,
            params: []
        };

        try {

            console.log('Stripe Interface Fields Deletion');
            await db.execute(stripe_interface_fields_deletion.query, stripe_interface_fields_deletion.params, { prepare: true });

            console.log('Stripe Interface Connect Account Error Type Creation');
            await db.execute(stripe_interface_connect_account_error_creation.query, stripe_interface_connect_account_error_creation.params, { prepare: true });

            console.log('Stripe Interface Connect Account External Account Type Creation');
            await db.execute(stripe_interface_connect_account_external_account_creation.query, stripe_interface_connect_account_external_account_creation.params, { prepare: true });

            console.log('Stripe Interface Connect Account Capability Type Creation');
            await db.execute(stripe_interface_connect_account_capability_creation.query, stripe_interface_connect_account_capability_creation.params, { prepare: true });

            console.log('Stripe Interface Fields Creation');
            await db.execute(stripe_interface_fields_creation.query, stripe_interface_fields_creation.params, { prepare: true });

        } catch (e) {
            return handler(e, false);
        }
        handler(false, true);
    },
    down : async function (db, handler) {

        const stripe_interface_fields_deletion = {
            query: `ALTER TABLE ticket721.stripe_interface
            ADD (connect_account_business_type text, connect_account_status text);`,
            params: []
        };

        const stripe_interface_connect_account_error_creation = {
            query: `DROP TYPE ticket721.connect_account_error;`,
            params: []
        };

        const stripe_interface_connect_account_external_account_creation = {
            query: `DROP TYPE ticket721.connect_account_external_account;`,
            params: []
        };

        const stripe_interface_connect_account_capability_creation = {
            query: `DROP TYPE ticket721.connect_account_capability;`,
            params: []
        };

        const stripe_interface_fields_creation = {
            query: `ALTER TABLE ticket721.stripe_interface
            DROP (
                connect_account_capabilities,
                connect_account_current_deadline,
                connect_account_currently_due,
                connect_account_eventually_due,
                connect_account_past_due,
                connect_account_pending_verification,
                connect_account_errors,
                connect_account_disabled_reason,
                connect_account_external_accounts,
                connect_account_name,
                connect_account_type
            );`,
            params: []
        };

        try {

            console.log('Stripe Interface Fields Deletion');
            await db.execute(stripe_interface_fields_deletion.query, stripe_interface_fields_deletion.params, { prepare: true });

            console.log('Stripe Interface Fields Creation');
            await db.execute(stripe_interface_fields_creation.query, stripe_interface_fields_creation.params, { prepare: true });

            console.log('Stripe Interface Connect Account Error Type Creation');
            await db.execute(stripe_interface_connect_account_error_creation.query, stripe_interface_connect_account_error_creation.params, { prepare: true });

            console.log('Stripe Interface Connect Account External Account Type Creation');
            await db.execute(stripe_interface_connect_account_external_account_creation.query, stripe_interface_connect_account_external_account_creation.params, { prepare: true });

            console.log('Stripe Interface Connect Account Capability Type Creation');
            await db.execute(stripe_interface_connect_account_capability_creation.query, stripe_interface_connect_account_capability_creation.params, { prepare: true });

        } catch (e) {
            return handler(e, false);
        }

        handler(false, true);
    }
};
module.exports = migration1596712433;
