const {buildSync} = require('esbuild')

buildSync({
    entryPoints: ['./notifications/firebase-messaging-sw.js'],
    outfile: './static/getFCMToken-messaging-sw.js',
    bundle: true,
    minify: true,
    define: {
        "process.env.GATSBY_FIREBASE": `'${process.env.GATSBY_FIREBASE}'`
    }
})
