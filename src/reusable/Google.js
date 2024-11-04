import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
import { Grid, Typography, Button, CircularProgress } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import {
  useGoogleLogin,
  hasGrantedAllScopesGoogle,
  GoogleOAuthProvider,
  GoogleLogin,
} from "@react-oauth/google";

import { useTranslation } from "react-i18next";
import { GlobalContext } from "../context/GlobalContext";

import axios from "../utils/axios";
import { jwtKey } from "../data/websiteInfo";

function Google({ chatId }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { setAuth, user: globaluser } = useContext(GlobalContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    status: false,
    message: "",
  });

  const handleLogin = async (googleData) => {
    setError({
      status: false,
      message: "",
    });

    let requestData = {
      token: googleData.code,
      method: "google",
    };

    // authApi.socialLogin(requestData).then((r) => {

    //   setError({
    //     status: true,
    //     message: "message" in r.data ? r.data.message : t("errorPages.somethingWentWrong"),
    //   });

    //   // if (r.data.code === "SUCCESS")
    //   // await localStorage.setItem('jwt', result.data.token);
    // }).catch((e) => {
    //   // console.log(e)
    // });
  };

  const onFailure = (err) => {
    console.log("failed", err);
    setError({
      status: true,
      message: err.message || t("login.loginFailed"),
    });
  };

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => handleLogin(codeResponse),
    onError: (err) => onFailure(err),
    scope: "profile email",

    flow: "auth-code",
  });

  const onSubmit = async (code, chatId) => {
    if (globaluser !== null && globaluser.token !== undefined) {
      return;
    }
    setError({
      status: false,
      message: "",
    });
    try {
      setLoading(true);
      const result = await axios.post(`/login/code`, {
        code: code,
      });

      if (result.data?.access_token) {
        await localStorage.setItem(jwtKey, result.data.access_token);
        setAuth({ ...result.data, token: result.data.access_token });
        if (chatId) {
          const topic = await axios.post(
            `/api/v1/assign_topic_to_user`,
            {
              id: chatId,
            },
            {
              headers: {
                "Content-Type": "application/json",
                authorization: "Bearer " + result.data.access_token,
              },
            }
          );
          router.push(`/chat/${chatId}`);
        } else {
          router.push("/");
        }
      } else {
        setError({
          status: true,
          message: result.data.message,
        });
      }
      setLoading(false);
    } catch (err) {
      console.log(err?.message);

      setError({
        status: true,
        message: err.response?.data?.message || t("login.loginFailed"),
      });
      setLoading(false);
    }
  };
  useEffect(() => {
    //check authenticated here as well
    // && not authicated

    if (router.query.code) {
      const stateParam = router.query.state;
      let chat;
      try {
        // Parse the JSON string to get the actual data
        const stateData = JSON.parse(decodeURIComponent(stateParam));

        chat = stateData.chat;
        // Use the authorizationCode and stateData as needed
      } catch (error) {
        // Handle JSON parsing error
        console.error("Error parsing state parameter:", error);
      }
      onSubmit(router.query.code, chat);
    }
  }, [router.query.code]);

  return (
    <>
      <Button
        fullWidth
        sx={{
          // fontFamily: (muiTheme) => muiTheme.typography.secondaryFont,
          fontSize: "16px",
          //opacity: 0.8,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#000",
          backgroundColor: (theme) => theme.palette.common.success30,
          borderRadius: "16px",
          fontWeight: 700,
          textTransform: "none",
          //boxShadow: "0px 3px 9px 0px #00000029",
          border: "1px solid rgba(51, 51, 51, 0.00)",

          padding: "10px 10px",
          "&:hover": {
            color: "#000",

            backgroundColor: (theme) => theme.palette.common.success30,
          },
          "& $disabled": {
            color: "#000",
            backgroundColor: (theme) => theme.palette.common.success30,
          },
        }}
        onClick={() => {
          let authUrl = `http://accounts.google.com/o/oauth2/v2/auth?client_id=${publicRuntimeConfig.REACT_APP_GOOGLE_CLIENT_ID}&redirect_uri=${publicRuntimeConfig.REACT_APP_GOOGLE_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent`;
          if (chatId) {
            const stateData = encodeURIComponent(
              JSON.stringify({ chat: chatId })
            );
            authUrl = authUrl + `&state=${stateData}`;
          }
          window.location = authUrl;
        }}
        disabled={loading}
      >
        {loading ? (
          <CircularProgress
            size='1rem'
            sx={{ mr: "14px", color: (theme) => theme.palette.common.main100 }}
          />
        ) : (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='18'
            height='19'
            fill='none'
            viewBox='0 0 18 19'
            style={{ marginRight: "14px" }}
          >
            <path
              fill='#4285F4'
              fillRule='evenodd'
              d='M18 9.392c0-.65-.058-1.277-.167-1.878h-8.65v3.552h4.943a4.223 4.223 0 01-1.832 2.772v2.304h2.968C16.998 14.544 18 12.19 18 9.392z'
              clipRule='evenodd'
            ></path>
            <path
              fill='#34A853'
              fillRule='evenodd'
              d='M9.184 18.367c2.479 0 4.558-.822 6.077-2.225l-2.967-2.304c-.823.551-1.875.877-3.11.877-2.392 0-4.417-1.616-5.139-3.787H.977v2.38a9.18 9.18 0 008.207 5.059z'
              clipRule='evenodd'
            ></path>
            <path
              fill='#FBBC05'
              fillRule='evenodd'
              d='M4.045 10.929a5.522 5.522 0 01-.288-1.745c0-.606.104-1.194.288-1.745v-2.38H.977A9.181 9.181 0 000 9.185c0 1.482.355 2.884.977 4.124l3.068-2.38z'
              clipRule='evenodd'
            ></path>
            <path
              fill='#EA4335'
              fillRule='evenodd'
              d='M9.184 3.653c1.348 0 2.559.463 3.51 1.373l2.634-2.634C13.738.91 11.66 0 9.184 0A9.18 9.18 0 00.977 5.06l3.068 2.379c.722-2.171 2.747-3.786 5.139-3.786z'
              clipRule='evenodd'
            ></path>
          </svg>
        )}{" "}
        {t("login.googleSignIn")}
      </Button>
      {error.status && (
        <Grid item sx={{ marginTop: "1em" }}>
          <Typography
            variant='subtitle2'
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "red",
            }}
          >
            {" "}
            <ErrorOutlineIcon
              style={{ fill: "red", marginRight: "4px" }}
            />{" "}
            {error.message}
          </Typography>
        </Grid>
      )}
    </>
  );
}

export default function GoogleLoginComponent({ chatId }) {
  return (
    <GoogleOAuthProvider
      clientId={publicRuntimeConfig.REACT_APP_GOOGLE_CLIENT_ID}
    >
      <Google chatId={chatId} />
    </GoogleOAuthProvider>
  );
}
