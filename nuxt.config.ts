// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  app: {
    head: {
      title: 'Ceteco  Busca a los 12 soñadores del mundo',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'generator', content: 'Mou CMS' },
        { hid: 'description', name: 'description', content: 'Ceteco  Busca a los 12 soñadores del mundo' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: "anonymous" },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'stylesheet', href: '/css/normalize.css' },
        { rel: 'stylesheet', href: '/css/webflow.css' },
        { rel: 'stylesheet', href: '/css/ceteco.webflow.css' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Open+Sans:wght@500&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap'
        }
      ],
      script: [
        {
          src: "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js",
          type: "text/javascript"
        },
        {
          type: "text/javascript",
          children: `
            WebFont.load({
              google: {
                families: ["Montserrat:100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic"]
              }
            });
          `
        },
        {
          type: "text/javascript",
          children: `
            !function(o,c){
              var n=c.documentElement,t=" w-mod-";
              n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")
            }(window,document);
          `
        },
        {
          src: "https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js",
          type: "text/javascript",
          integrity: "sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=",
          crossorigin: "anonymous"
        },
        {
          src: "/js/webflow.js",
          type: "text/javascript"
        }
      ]
    }
  },

  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_KEY: process.env.SUPABASE_KEY,
    },
  }
})
