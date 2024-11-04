import * as React from "react";
import Head from 'next/head';
import Login from "../src/components/login";
import { useTranslation } from 'react-i18next';


export default function LoginPage() {
  const { t } = useTranslation();
  return (
    <>
      {console.log("Rendering LoginPage")};
      <Head>
        <title>{t("login.Header")}</title>
      </Head>
      {console.log("Head component rendered")};
      <Login />
      {console.log("Login component rendered")};
    </>
  );
}
