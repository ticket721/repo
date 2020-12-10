module.exports = ({
    title,
    description,
    og_image,
    twitter_image,
    twitter_handle,
    twitter_creator_handle,
    url,
    type,
    locale,
    site_name
}) => {

    title = title.replace(/"/g, '&quot;');
    description = description.replace(/"/g, '&quot;');

    return `
        
        <!-- -->
        <!-- -->
        <!-- Common Tags -->
        <title>${title}</title> 
        
        <!-- Common Meta Tags -->
        <meta name="title" content="${title}" />
        <meta name="description" content="${description}" />
    
        <!-- Open Graph Meta Tags -->
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:image" content="${og_image}" />
        <meta property="og:url" content="${url}" />
        <meta property="og:type" content="${type}" />
        <meta property="og:locale" content="${locale}" />
        <meta property="og:site_name" content="${site_name}" />
       
        <!-- Twitter Meta Tags -->
        <meta name="twitter:title" content="${title}" />
        <meta name="twitter:description" content="${description}" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="${twitter_image}" />
        <meta name="twitter:site" content="${twitter_handle}" />
        <meta name="twitter:creator" content="${twitter_creator_handle}" />
        <!-- -->
        <!-- -->
        
    `;
}
