import 'bootstrap/dist/css/bootstrap.css';

//acts as a wrapper.
const globalCss = ({Component, pageProps}) => {
  return <Component {...pageProps} />
};

export default globalCss;