const createCompiler = require('@storybook/addon-docs/mdx-compiler-plugin');

module.exports = ({ config }) => {
    config.module.rules.push({
        test: /\.(ts|tsx)$/,
        use: [
            {
                loader: require.resolve('awesome-typescript-loader'),
            },
            // Optional
            {
                loader: require.resolve('react-docgen-typescript-loader'),
            },
        ],
    });
    //config.module.rules.push({
    //    test: /\.(stories|story)\.mdx$/,
    //    use: [
    //        {
    //            loader: 'babel-loader',
    //            // may or may not need this line depending on your app's setup
    //            options: {
    //                plugins: ['@babel/plugin-transform-react-jsx'],
    //            },
    //        },
    //        {
    //            loader: '@mdx-js/loader',
    //            options: {
    //                compilers: [createCompiler({})],
    //            },
    //        },
    //    ],
    //});
    config.resolve.extensions.push('.ts', '.tsx', '.mdx');
    return config;
};
