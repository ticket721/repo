const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const template = require('./template');
const createLocaleMiddleware = require('express-locale');
const {getLanguage} = require('./utils');
const sitemap = require('./sitemap');
const {Crawler} = require('es6-crawler-detect')
const compression = require('compression')


const configPath = path.resolve(process.argv[2]);
const options = require(configPath);

const {
    BUILD_PATH,
    SERVER_HOST,
    SERVER_PORT,
    SERVER_PROTOCOL,
    PORT,
    APP_URL
} = options;

const missing = (...args) => args.filter((arg) => !arg).length !== 0;

if (missing(BUILD_PATH, SERVER_HOST, SERVER_PORT, SERVER_PROTOCOL, PORT, APP_URL)) {
    console.error('Invalid server config');
    process.exit(1);
}

const app = express();

app.use(createLocaleMiddleware());
app.use(cors());
app.use(compression());

const overrides = fs.readdirSync(path.join(__dirname, 'overrides'));

for (const override of overrides) {
    console.log(`Loading ${override}`);
    const data = require(path.join(__dirname, 'overrides', override))(options);
    for (const route of data[0]) {
        app.use(route, data[1]);
    }
}

const i18n = {
    en: {
        title: 'Ticket721',
        description: 'Ticket721 is a ticketing platform focused on security and user experience.'
    },
    fr: {
        title: 'Ticket721',
        description: "Ticket721 est une plateforme améliorant l'expérience des participants lors d’un événement sur deux volets : sécurisation et fan engagement.",
    }
}

app.use('*', (req, res, next) => {

    if (!req.custom_header) {

        const lang = getLanguage(req.locale.language);

        req.custom_header = template({
            title: i18n[lang]['title'],
            description: i18n[lang]['description'],
            og_image: `${APP_URL}/static/media/og_image.png`,
            twitter_image: `${APP_URL}/static/media/twitter_image.png`,
            twitter_handle: `ticket721`,
            twitter_creator_handle: `ticket721`,
            url: `${APP_URL}${req.originalUrl}`,
            type: 'website',
            locale: lang,
            site_name: 'Ticket721'
        })

    }

    next();

});

const indexHtml = fs.readFileSync(path.join(BUILD_PATH, 'index.html'), 'utf8').toString();

function replaceRange(s, start, end, substitute) {
    return s.substring(0, start) + substitute + s.substring(end);
}

const RANGE_START_TAG = '<title>Ticket721</title>';
const RANGE_END_TAG = '<title>Ticket721</title>';

const headInjector = (req, res) => {

    let indexHtmlEdited = `${indexHtml}`;

    if (req.custom_header) {

        const range_start = indexHtmlEdited.indexOf(RANGE_START_TAG);
        const range_end = indexHtmlEdited.indexOf(RANGE_END_TAG);

        if (range_start !== -1 && range_end !== -1) {

            indexHtmlEdited = replaceRange(indexHtmlEdited, range_start, range_end + RANGE_END_TAG.length, req.custom_header);

        }

    }

    const language = getLanguage(req.locale.language);

    indexHtmlEdited = indexHtmlEdited.replace('<html lang="en">', `<html lang="${language}">`);

    res.set('Cache-Control', 'no-store');

    const crawler = new Crawler(req);

    if (crawler.isCrawler()) {
        console.log('Crawler detected:');
        console.log(crawler.getMatches())
        console.log(indexHtmlEdited);
        console.log();
    }

    res.send(indexHtmlEdited);
};

app.get('/', headInjector);

app.get('/robots.txt', (req, res) => {

    if (process.env.SITEMAP_ENABLED === 'true') {
        res.send(`User-Agent: *
Allow: /  

Sitemap: ${APP_URL}/sitemap.xml
`)
    } else {
        res.send(`User-Agent: *
Disallow: /  
`)
    }

});

app.get('/sitemap.xml', sitemap(options));

app.use(express.static(path.resolve(BUILD_PATH)));

app.get('*', headInjector);

app.listen(PORT, () => {
    console.log(`Started on port ${PORT}`);
});
