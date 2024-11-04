import * as React from "react";
import Dashboard from "../src/components/dashboard";
import CheckAuth from "../src/reusable/CheckAuth";
import { useTranslation } from 'react-i18next';
import Head from 'next/head';


export default function Index() {
  console.log("Rendering Index component");
  const { t } = useTranslation();
  console.log("Translation hook initialized");

  return (
    <CheckAuth>
      {console.log("CheckAuth component rendered")}
      <Head>
        {console.log("Head component rendered")}
        <title>{t('home.history')}</title> {/* Replace 'dashboardTitle' with your actual translation key */}
      </Head>
      <Dashboard />
      {console.log("Dashboard component rendered")}
    </CheckAuth>
  );
}
