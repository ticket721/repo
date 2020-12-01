const { T721SDK } = require('@common/sdk');

module.exports = ({
                      APP_URL,
                      SERVER_HOST,
                      SERVER_PORT,
                      SERVER_PROTOCOL,
                  }) => {

    const sdk = new T721SDK();

    sdk.connect(SERVER_HOST, SERVER_PORT, SERVER_PROTOCOL);

    const baseUrls = [
        {
            url: '/',
            lastmod: new Date(Date.now())
        },

        {
            url: '/search',
            lastmod: new Date(Date.now())
        },

        {
            url: '/login',
            lastmod: new Date(Date.now())
        },

        {
            url: '/register',
            lastmod: new Date(Date.now())
        },

    ]

    const base =
        `<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

`

    const inject = (_urls) => {

        let editedBase = `${base}`;

        for (const url of _urls) {

            editedBase = `${editedBase}
    <url>
      <loc>${APP_URL}${url.url}</loc>
      <lastmod>${url.lastmod.toISOString()}</lastmod>
    </url>
`

        }

        editedBase = `${editedBase}

  <!-- Injected ${_urls.length - baseUrls.length} links -->

</urlset>
`;
        return editedBase;
    }

    return (req, res) => {

        const urls = [
            ...baseUrls
        ];

        sdk
            .dates
            .search({
                status: {
                    $eq: 'live'
                },
                $sort: [{
                    $field_name: 'updated_at',
                    $order: 'desc',
                }],
                $page_size: 5000
            })
            .then((data) => {
                for (const date of data.data.dates) {

                    urls.push({
                        url: `/event/${date.id}`,
                        lastmod: new Date(date.updated_at)
                    });

                }
                res.set('Content-Type', 'text/xml');
                res.send(inject(urls));
            })
            .catch(e => {
                console.error('An error occured while fetching dates');
                console.error(e);
                res.set('Content-Type', 'text/xml');
                res.send(inject(urls));
            });

    }
}
