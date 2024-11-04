import * as React from "react";
import Chat from "../../src/components/chat";
import CheckAuth from "../../src/reusable/CheckAuth";
import Head from 'next/head';
import { useTranslation } from 'react-i18next';


export default function Index() {
  console.log('Rendering Chat Index page');
  const { t } = useTranslation();
  console.log('Translation initialized for chat page');

  return (
    <>
      {console.log('Rendering JSX')}
      <Head>
        {console.log('Setting page title for chat page')}
        <title>{t("chat.Header")}</title>
      </Head>
      {console.log('Rendering Chat component for chat page')}
      <Chat />
    </>
  );
}
