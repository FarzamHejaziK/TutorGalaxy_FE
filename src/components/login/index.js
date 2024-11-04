import React, { useContext, useState } from "react";
import { useRouter } from "next/router";

import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Snackbar,
  Typography,
  Alert,
} from "@mui/material";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { useTranslation } from "react-i18next";
import EmailLogin from "../../reusable/EmailLogin";
import { GlobalContext } from "../../context/GlobalContext";
import Link from "next/link";
import axios from "../../utils/axios";
export default function Login() {
  const { t } = useTranslation();
  const pages = [
    {
      label: t("login.privacy"),
      url: "/privacy-policy",
    },
    {
      label: t("login.terms"),
      url: "/terms",
    },
    {
      label: t("login.contact"),
      email: "mailto:ccpa.tutorgalaxy@gmail.com?subject=Support Request",
    },
  ];
  const router = useRouter();
  const { user: globaluser } = useContext(GlobalContext);
  const [loading, setLoading] = useState({
    active: false,
    action: "",
  });
  const [showToast, setShowToast] = useState({
    active: false,
    message: "",
    severity: "",
  });
  if (globaluser !== null && globaluser.token !== undefined) {
    router.push("/");
    //return <Loading />;
  }

  const createConversation = async () => {
    try {
      setLoading({
        active: true,
        action: `create_conv_id_public`,
      });
      const result = await axios.post(`/api/v1/create_conv_id_public`);
      if (result.status === 200) {
        router.push(`/chat/${result.data.id}?new=true`);
      } else {
        setShowToast({
          active: true,
          message: result.data.error || t("login.loginFailed"),
          severity: "error",
        });
      }
      setLoading({
        active: false,
        action: "",
      });
    } catch (err) {
      console.log(err?.message);
      setShowToast({
        active: true,
        message: err.response?.data?.message || t("login.loginFailed"),
        severity: "error",
      });

      setLoading({
        active: false,
        action: "",
      });
    }
  };

  const handleToastClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setShowToast({
      active: false,
      message: "",
      severity: "",
    });
  };
  return (
    <Grid
      container
      justifyContent='space-between'
      //spacing={3}
      sx={{
        minHeight: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Snackbar
        open={showToast.active}
        autoHideDuration={4000}
        onClose={handleToastClose}
        anchorOrigin={{
          horizontal: "right",
          vertical: "bottom",
        }}
      >
        <Alert
          sx={{ fontSize: "20px" }}
          onClose={handleToastClose}
          severity={showToast.severity}
        >
          {showToast.message}
        </Alert>
      </Snackbar>
      <div style={{ position: "absolute", bottom: 0, left: 0, zIndex: -1 }}>
        <img src='/dev/lines.svg' style={{}} />
      </div>
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: 0,
          zIndex: -1,
          display: { md: "none", xs: "unset" },
        }}
      >
        <img src='/dev/stars.svg' style={{}} />
      </Box>
      <img
        src='/dev/glass.png'
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          right: 0,
          zIndex: -1,
          borderRadius: "1409.494px",
          opacity: 0.5,

          transform: "rotate(75.68deg)",
          filter: "blur(93.5px)",
        }}
      />
      <Grid item md={5} xs={12} display='flex'>
        <Grid
          container
          direction='column'
          sx={{
            px: { xl: "34px", md: "24px", xs: "14px" },
            height: "100%",
            alignItems: { md: "flex-start", xs: "center" },
          }}
        >
          {/* logo */}
          <Grid item sx={{ mt: "40px" }}>
            <img
              src='/dev/logo.png'
              style={{ width: "90px", height: "80px" }}
            />
          </Grid>
          <Grid item sx={{ flex: 1, width: "100%" }}>
            <Grid
              container
              direction='column'
              justifyContent='center'
              sx={{
                pb: "15%",
                pt: "10px",
                height: "100%",
                alignItems: { md: "flex-start", xs: "center" },
              }}
            >
              {/* heading */}
              <Grid
                item
                sx={{ width: { xl: "85%", md: "100%", sm: "95%", xs: "100%" } }}
              >
                <Typography
                  variant='h3'
                  sx={{
                    fontSize: { md: "48px", xs: "36px" },
                    color: "#000",
                    fontWeight: 700,
                    lineHeight: "60px",
                    textAlign: { md: "left", xs: "center" },
                  }}
                >
                  {t("login.title")}
                </Typography>
              </Grid>
              {/* text */}
              <Grid
                item
                sx={{
                  mt: "24px",
                  width: {
                    xl: "70%",
                    lg: "80%",
                    md: "100%",
                    sm: "60%",
                    xs: "90%",
                  },
                }}
              >
                <Typography
                  variant='subtitle1'
                  sx={{
                    fontSize: "18px",
                    textAlign: { md: "left", xs: "center" },
                    color: "#595A5A",
                  }}
                >
                  {t("login.description")}
                </Typography>
              </Grid>
              {/* login button */}
              <Grid
                item
                sx={{
                  mt: "24px",
                  width: {
                    xl: "60%",
                    lg: "70%",
                    md: "80%",
                    sm: "60%",
                    xs: "80%",
                  },
                }}
              >
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

                      backgroundColor: (theme) =>
                        theme.palette.common.success30,
                    },
                    "& $disabled": {
                      color: "#000",
                      backgroundColor: (theme) =>
                        theme.palette.common.success30,
                    },
                  }}
                  onClick={createConversation}
                  disabled={
                    loading.active && loading.action === "create_conv_id_public"
                  }
                >
                  {loading.active &&
                  loading.action === "create_conv_id_public" ? (
                    <CircularProgress
                      size='1rem'
                      sx={{
                        mr: "14px",
                        color: (theme) => theme.palette.common.main100,
                      }}
                    />
                  ) : (
                    <AddCircleOutlineOutlinedIcon
                      sx={{ fill: "#3AA50A", mr: "14px", ml: "-12px" }}
                    />
                  )}

                  {t("login.newTutor")}
                </Button>
                <div style={{ height: "19px" }} />
                <EmailLogin />
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container gap='20px'>
            {pages.map((item, i) => (
              <Grid item key={i}>
                {item.url ? (
                  <Link href={item.url} style={{ textDecoration: "none" }}>
                    <Typography
                      variant='subtitle1'
                      sx={{ color: "#5BA838", fontWeight: 500, pb: "10px" }}
                    >
                      {item.label}
                    </Typography>
                  </Link>
                ) : (
                  <a href={item.email} style={{ textDecoration: "none" }}>
                    <Typography
                      variant='subtitle1'
                      sx={{ color: "#5BA838", fontWeight: 500, pb: "10px" }}
                    >
                      {item.label}
                    </Typography>
                  </a>
                )}
              </Grid>
            ))}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid
        item
        xl={6}
        md={7}
        sx={{
          display: { md: "flex", xs: "none" },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: "20%", left: 0, zIndex: -1 }}>
          <img src='/dev/stars.svg' style={{}} />
        </div>
        <img
          src='/dev/glass.png'
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            bottom: 0,
            right: 0,
            zIndex: -1,
            borderRadius: "1409.494px",
            opacity: 0.2,

            transform: "rotate(75.68deg)",
            filter: "blur(93.5px)",
          }}
        />
        <img
          src='/dev/blue-circle.png'
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            bottom: 0,
            right: 0,
            zIndex: -1,
            // borderRadius: "1409.494px",
            // opacity: 0.2,

            // transform: "rotate(75.68deg)",
            // filter: "blur(93.5px)",
          }}
        />

        <Grid
          container
          alignItems='flex-end'
          justifyContent='flex-end'
          sx={{ height: "100%" }}
        >
          <img
            src='/dev/bot.png'
            style={{
              width: "100%",
              height: "100%",
              maxHeight: "95vh",
              maxWidth: "904px",
            }}
          />
        </Grid>
      </Grid>
      <style>{`
     html, body, #__next{height:100%;}

      `}</style>
    </Grid>
  );
}
