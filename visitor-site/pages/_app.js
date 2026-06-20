import Layout from '../components/Layout';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <div className="page-enter">
        <Component {...pageProps} />
      </div>
    </Layout>
  );
}

export default MyApp;
