import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <link rel="icon" type="image/svg+xml" href="/images/logo.svg" />
          <meta name="theme-color" content="#0a0e27" />
          <meta name="robots" content="index, follow" />
          <meta name="author" content="Topcentral® GEO" />
          <meta name="application-name" content="Topcentral® GEO" />
          <meta property="og:site_name" content="Topcentral® GEO" />
          <meta property="og:locale" content="en_US" />
          <meta property="og:image" content="https://www.TopcentralGEO.com/images/og-image.svg" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Topcentral® GEO — AIGC GEO Platform" />
          <meta name="twitter:description" content="Power Your Presence in the AI Era with Generative Engine Optimization" />
          <meta name="twitter:image" content="https://www.TopcentralGEO.com/images/og-image.svg" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
