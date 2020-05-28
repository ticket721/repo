const svgtofont = require("svgtofont");
const path = require("path");
const pkg = require('../package.json');

svgtofont({
  src: path.resolve(process.cwd(), "static/assets/icons"),
  dist: path.resolve(process.cwd(), "static/t721-icons"),
  fontName: "t721-icons",
  css: true,
  startNumber: 20000,
  svgicons2svgfont: {
    fontHeight: 1000,
    normalize: true
  },
  website: {
    title: "t721-icons",
    logo: path.resolve(process.cwd(), "svg", "icon--ticket.svg"),
    version: pkg.version,
    meta: {
      description: "T721 icons",
      keywords: "svgtofont,t721,icons"
    },
    description: ``,
    corners: {
      url: 'https://github.com/ticket721/flib-react',
      width: 62,
      height: 62,
      bgColor: '#079CF0'
    },
    links: [
      {
        title: "GitHub",
        url: "https://github.com/ticket721/repo"
      },
      {
        title: "Font Class",
        url: "index.html"
      },
      {
        title: "Unicode",
        url: "unicode.html"
      }
    ]
  }
}).then(() => {
  console.log('icons font generated !');
});
