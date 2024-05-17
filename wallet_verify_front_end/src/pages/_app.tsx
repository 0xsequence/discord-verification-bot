import '../styles/globals.css';
import React from 'react';
import PropTypes from 'prop-types';

App.propTypes = {
    Component: PropTypes.any,
    pageProps: PropTypes.any,
};

export default function App({ Component, pageProps }: any) {
    return <Component {...pageProps} />;
}
