import "regenerator-runtime/runtime";
import Head from "next/head";
import Script from "next/script";
import { useRouter } from "next/router";
import React, { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider } from "@emotion/react";

import { GlobalProvider, GlobalContext } from "../src/context/GlobalContext";
import lightTheme from "../src/utils/lightTheme";
import darkTheme from "../src/utils/darkTheme";
import axios from "../src/utils/axios";
import Loading from "../src/reusable/loading";
import createEmotionCache from "../src/createEmotionCache";
import { jwtKey } from "../src/data/websiteInfo";
import "../src/i18n";
// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

const publicPages = [];
const allowedAuthPages = [];

const Main = ({ Component, pageProps }) => {
  const router = useRouter();
  const [loadingAuth, setLoadingAuth] = useState(
    publicPages.some((p) => router.pathname === p) ||
      allowedAuthPages.some((p) => router.pathname === p)
      ? false
      : true
  );
  const { setAuth } = useContext(GlobalContext);

  useEffect(() => {
    const fetchToken = async () => {
      if (!allowedAuthPages.some((p) => router.pathname === p)) {
        setLoadingAuth(true);
      }
      let Token = null;
      try {
        Token = await localStorage.getItem(jwtKey);
      } catch (e) {
        console.log("Error Fetching jwt Token");
        setLoadingAuth(false);
      }
      if (Token != null) {
        // setAuth({ token: Token });
        // setLoadingAuth(false);

        //validate Token Here from server or async storage to find user state
        //validating through server
        try {
          const result = await axios.get("/api/v1/user_details", {
            headers: {
              authorization: "Bearer " + Token,
            },
          });
          if (result.status === 200) {
            setAuth({
              ...result.data,
              isDarkTheme: result.data?.screen_mode !== "1",
              token: Token,
            });
          }
          setLoadingAuth(false);
        } catch (e) {
          setLoadingAuth(false);
        }
      } else {
        setLoadingAuth(false);
      }
    };
    if (!publicPages.some((p) => router.pathname === p)) {
      fetchToken();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loadingAuth) {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <meta name='viewport' content='initial-scale=1, width=device-width' />

      <script async src="https://www.googletagmanager.com/gtag/js?id=G-J3B48E7BLV"></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-J3B48E7BLV');
          `,
        }}
      />

        <script id='hojtar'>
          {`
      (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:3657091,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `}
        </script>
        {/* Google tag (gtag.js) */}
      <script async src="https://www.googletagmanager.com/gtag/js?id=AW-11474022567"></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-11474022567');
          `,
        }}
      />
      <script
          dangerouslySetInnerHTML={{
            __html: `
              gtag('event', 'conversion', {
                  'send_to': 'AW-11474022567/2a_cCNaZwY8ZEKfhnt8q',
                  'value': 1.0,
                  'currency': 'USD'
              });
            `,
          }}
        ></script>
      </Head>
      <Component {...pageProps} loadingAuth={loadingAuth} />
      {/* <style>
        {`
            @font-face {
              font-family: "Cascadia";
              src: url("/fonts/Cascadia.ttf");
              font-style: normal;
              font-weight: 400;
              font-display: swap;
            }
      `}
      </style> */}
    </>
  );
};

const MUISetup = ({ Component, pageProps }) => {
  const { user } = useContext(GlobalContext);

  return (
    <ThemeProvider
      theme={user === null || !user?.isDarkTheme ? lightTheme : darkTheme}
    >
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <Main Component={Component} pageProps={pageProps} />
    </ThemeProvider>
  );
};
export default function MyApp(props) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  return (
    <GlobalProvider>
      <CacheProvider value={emotionCache}>
        <MUISetup Component={Component} pageProps={pageProps} />
      </CacheProvider>
    </GlobalProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  emotionCache: PropTypes.object,
  pageProps: PropTypes.object.isRequired,
};
