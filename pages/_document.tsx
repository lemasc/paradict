import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree:wght@400;500&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap"
            rel="stylesheet"
          ></link>
          <meta property="og:title" content="ParaDict"></meta>
          <meta
            property="og:description"
            content="Simple tool to help you search multiple words meaning with ease."
          />
          <meta
            property="og:image"
            content={
              (process.env.NEXT_PUBLIC_VERCEL_URL
                ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
                : `http://localhost:3000`) + '/og-image.png'
            }
          ></meta>
          <meta property="twitter:card" content="summary_large_image"></meta>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
