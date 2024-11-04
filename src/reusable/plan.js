import React, { useState, useContext } from "react";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
import {
  Dialog,
  DialogTitle,
  Grid,
  Typography,
  IconButton,
  DialogContent,
  Button,
  CircularProgress,
  useTheme,
  Divider,
  Box,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CloseIcon from "@mui/icons-material/Close";
import { GlobalContext } from "../context/GlobalContext";
import axios from "../utils/axios";
import { useTranslation } from "react-i18next";

export default function Plan({ open, setOpen, error, errorMessage, url }) {
  const { t, i18n, ready } = useTranslation();

  const theme = useTheme();
  const { user: globaluser } = useContext(GlobalContext);

  const [loading, setLoading] = useState({
    active: false,
    action: "",
  });
  const [showError, setShowError] = useState({
    status: false,
    message: "",
  });

  const freePlanFeatures = t("common.planDialog.freePlanFeatures", {
    returnObjects: true,
  });

  const plusPlanFeatures = t("common.planDialog.plusPlanFeatures", {
    returnObjects: true,
  });
  if (!ready) return "loading translations...";

  const manageSubcription = async () => {
    setShowError({
      status: false,
      message: "",
    });
    try {
      setLoading({
        active: true,
        action: "subcription",
      });
      const result = await axios.post(
        `/payments/v1/manage-subscription`,
        {
          return_url: publicRuntimeConfig.REACT_APP_URI + url,
        },
        {
          headers: {
            authorization: "Bearer " + globaluser.token,
          },
        }
      );

      if (result.status === 200) {
        let url = result.data.session_url;
        window.location = url;
      } else {
        setShowError({
          status: true,
          message: result.data.error,
        });
      }
      setLoading({
        active: false,
        action: "",
      });
    } catch (err) {
      console.log(err?.message);

      setShowError({
        status: true,
        message: err.response?.data?.message || "Something went wrong",
      });
      setLoading({
        active: false,
        action: "",
      });
    }
  };
  const upgradeHandler = async () => {
    setShowError({
      status: false,
      message: "",
    });
    try {
      setLoading({
        active: true,
        action: "upgrade",
      });
      const result = await axios.post(
        `/payments/v1/create-checkout-session`,
        {
          success_url:
            publicRuntimeConfig.REACT_APP_URI + url + "?upgrade=true",
          cancel_url:
            publicRuntimeConfig.REACT_APP_URI + url + "?upgrade=false",
        },
        {
          headers: {
            authorization: "Bearer " + globaluser.token,
          },
        }
      );

      if (result.status === 200) {
        let url = result.data.url;
        window.location = url;
      } else {
        setShowError({
          status: true,
          message: result.data.error,
        });
      }
      setLoading({
        active: false,
        action: "",
      });
    } catch (err) {
      console.log(err?.message);

      setShowError({
        status: true,
        message: err.response?.data?.message || "Something went wrong",
      });
      setLoading({
        active: false,
        action: "",
      });
    }
  };
  const renderCurrentPlanButton = (sx = {}) => (
    <Button
      variant='contained'
      size='small'
      fullWidth
      sx={{
        fontSize: "12px",
        fontWeight: 600,
        boxShadow: globaluser?.isDarkTheme
          ? "0px 8px 12px 0px rgba(255, 255, 255, 0.08) inset, 0px 24px 24px -16px rgba(0, 0, 0, 0.12), 16px 24px 64px -24px rgba(255, 255, 255, 0.08) inset"
          : "none",
        background: (muiTheme) =>
          globaluser?.isDarkTheme
            ? "linear-gradient(118deg, rgba(215, 237, 237, 0.16) -47.79%, rgba(204, 235, 235, 0.00) 100%)"
            : muiTheme.palette.common.primary100,
        color: (muiTheme) =>
          globaluser?.isDarkTheme
            ? muiTheme.palette.common.primary30
            : muiTheme.palette.common.primary20,
        textTransform: "none",
        borderRadius: globaluser?.isDarkTheme ? "12px" : "8px",
        p: "8px 12px",
        borderTop: `1px solid #D7EDED`,

        "&:hover": {
          boxShadow: globaluser?.isDarkTheme
            ? "0px 8px 12px 0px rgba(255, 255, 255, 0.08) inset, 0px 24px 24px -16px rgba(0, 0, 0, 0.12), 16px 24px 64px -24px rgba(255, 255, 255, 0.08) inset"
            : "none",
          background: (muiTheme) =>
            globaluser?.isDarkTheme
              ? "linear-gradient(118deg, rgba(215, 237, 237, 0.16) -47.79%, rgba(204, 235, 235, 0.00) 100%)"
              : muiTheme.palette.common.primary100,
        },
        ...sx,
      }}
    >
      {t("common.planDialog.currentPlanButton")}
    </Button>
  );
  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      fullWidth
      maxWidth='md'
      sx={{
        "& .MuiPaper-root": {
          background: (muiTheme) =>
            globaluser?.isDarkTheme
              ? muiTheme.palette.common.primary60
              : muiTheme.palette.common.primary100,

          borderRadius: "16px",
          boxShadow: globaluser?.isDarkTheme
            ? "0px 8px 12px 0px rgba(255, 255, 255, 0.04) inset, 0px 24px 64px -16px rgba(0, 0, 0, 0.24), 16px 24px 64px -24px rgba(255, 255, 255, 0.04) inset"
            : "0px 24px 64px -16px rgba(0, 0, 0, 0.24)",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          p: "30px",
        },
        "& .MuiBackdrop-root": {
          background: "rgba(6, 7, 8, 0.64)",
          backdropFilter: "blur(4px)",

          // opacity: "0.8 !important",
        },
      }}
    >
      <DialogTitle
        sx={{
          p: "0px",
        }}
        id='customized-dialog-title'
      >
        <Grid container alignItems='center' justifyContent='space-between'>
          <Grid item sx={{ flex: 1 }}>
            <Typography
              variant='h6'
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "19px",
                fontWeight: 600,
                lineHeight: "29px",
                color: (muiTheme) =>
                  globaluser?.isDarkTheme
                    ? muiTheme.palette.common.primary0
                    : muiTheme.palette.common.success60,
              }}
            >
              <span style={{ whiteSpace: "break-spaces" }}>
                {globaluser?.isSubscribed
                  ? t("common.planDialog.yourPlan")
                  : t("common.planDialog.ourPlans")}
              </span>
            </Typography>
          </Grid>
          <Grid item>
            <IconButton
              aria-label='close'
              onClick={() => setOpen(false)}
              sx={{
                color: (muiTheme) => muiTheme.palette.common.primary40,
              }}
            >
              <CloseIcon fontSize='small' />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent sx={{ p: 0, mt: "20px" }}>
        {error && (
          <Grid item sx={{ marginTop: "12px", pb: "40px" }}>
            <Grid container justifyContent='center'>
              <Grid
                item
                sx={{
                  p: "12px 16px",
                  borderRadius: "8px",
                  background: (muiTheme) =>
                    globaluser?.isDarkTheme
                      ? muiTheme.palette.common.primary80
                      : "#EEEFF2",
                  width: { md: "80%", xs: "100%" },
                }}
              >
                <Typography
                  variant='subtitle1'
                  sx={{
                    fontSize: "12px",
                    fontWeight: 500,
                    display: "flex",
                    // alignItems: "center",
                    gap: "16px",
                    color: (muiTheme) =>
                      globaluser?.isDarkTheme
                        ? muiTheme.palette.common.primary40
                        : "#1A1A1A",
                  }}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='37'
                    height='42'
                    fill='none'
                    viewBox='0 0 37 42'
                  >
                    <g filter='url(#filter0_dd_1_1938)'>
                      <path
                        stroke={globaluser?.isDarkTheme ? "#4D62E5" : "#3AA50A"}
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='1.5'
                        d='M15.643 14.333v1.31A2.857 2.857 0 0018.5 18.5v0a2.857 2.857 0 002.857-2.857v-1.31m-5.714 0v-.37c0-.642-.328-1.228-.762-1.7A5.27 5.27 0 0113.5 8.685c0-2.864 2.239-5.185 5-5.185s5 2.321 5 5.185a5.27 5.27 0 01-1.38 3.578c-.435.472-.763 1.058-.763 1.7v.37m-5.714 0h5.714'
                      ></path>
                    </g>
                    <defs>
                      <filter
                        id='filter0_dd_1_1938'
                        width='44'
                        height='44'
                        x='-3.5'
                        y='-1'
                        colorInterpolationFilters='sRGB'
                        filterUnits='userSpaceOnUse'
                      >
                        <feFlood
                          floodOpacity='0'
                          result='BackgroundImageFix'
                        ></feFlood>
                        <feColorMatrix
                          in='SourceAlpha'
                          result='hardAlpha'
                          values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
                        ></feColorMatrix>
                        <feMorphology
                          in='SourceAlpha'
                          radius='4'
                          result='effect1_dropShadow_1_1938'
                        ></feMorphology>
                        <feOffset dy='4'></feOffset>
                        <feGaussianBlur stdDeviation='3'></feGaussianBlur>
                        <feColorMatrix values='0 0 0 0 0.301961 0 0 0 0 0.384314 0 0 0 0 0.898039 0 0 0 0.16 0'></feColorMatrix>
                        <feBlend
                          in2='BackgroundImageFix'
                          result='effect1_dropShadow_1_1938'
                        ></feBlend>
                        <feColorMatrix
                          in='SourceAlpha'
                          result='hardAlpha'
                          values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
                        ></feColorMatrix>
                        <feMorphology
                          in='SourceAlpha'
                          radius='3'
                          result='effect2_dropShadow_1_1938'
                        ></feMorphology>
                        <feOffset dy='10'></feOffset>
                        <feGaussianBlur stdDeviation='7.5'></feGaussianBlur>
                        <feColorMatrix values='0 0 0 0 0.301961 0 0 0 0 0.384314 0 0 0 0 0.898039 0 0 0 0.16 0'></feColorMatrix>
                        <feBlend
                          in2='effect1_dropShadow_1_1938'
                          result='effect2_dropShadow_1_1938'
                        ></feBlend>
                        <feBlend
                          in='SourceGraphic'
                          in2='effect2_dropShadow_1_1938'
                          result='shape'
                        ></feBlend>
                      </filter>
                    </defs>
                  </svg>
                  {errorMessage.includes("‘Upgrade to the Plus plan’") ? (
                    <span style={{ whiteSpace: "break-spaces" }}>
                      {errorMessage.split("‘Upgrade to the Plus plan’")[0]}
                      <Box
                        component='span'
                        onClick={upgradeHandler}
                        sx={{
                          cursor: "pointer",
                          color: (muiTheme) =>
                            muiTheme.palette.common.success60,
                          fontWeight: 600,
                        }}
                      >
                        ‘Upgrade to the Plus plan’
                      </Box>{" "}
                      {errorMessage.split("‘Upgrade to the Plus plan’")[1]}
                    </span>
                  ) : (
                    <span style={{ whiteSpace: "break-spaces" }}>
                      {errorMessage}
                    </span>
                  )}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        )}
        {showError.status && (
          <Grid item sx={{ marginTop: "12px", pb: "40px" }}>
            <Grid container justifyContent='center'>
              <Grid
                item
                sx={{
                  p: "12px 16px",
                  borderRadius: "8px",
                  background: (muiTheme) =>
                    globaluser?.isDarkTheme
                      ? muiTheme.palette.common.primary80
                      : "#EEEFF2",
                  width: { md: "80%", xs: "100%" },
                }}
              >
                <Typography
                  variant='subtitle1'
                  sx={{
                    fontSize: "12px",
                    fontWeight: 500,
                    display: "flex",
                    // alignItems: "center",
                    gap: "16px",
                    color: "red",
                    // color: (muiTheme) =>
                    //   globaluser?.isDarkTheme
                    //     ? muiTheme.palette.common.primary40
                    //     : "#1A1A1A",
                  }}
                >
                  <ErrorOutlineIcon />
                  {showError.message}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        )}
        <Grid container direction='column'>
          {!globaluser?.isSubscribed && (
            <Grid
              item
              display='flex'
              flexDirection='column'
              //xs={6}
              sx={{
                flex: 1,
                mb: "40px",
              }}
            >
              <Box
                sx={{
                  p: "16px",
                  borderRadius: "12px",
                  background: "transparent",
                  border: (muiTheme) =>
                    `1px solid ${
                      globaluser?.isDarkTheme
                        ? muiTheme.palette.common.primary50
                        : muiTheme.palette.common.primary70
                    }`,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Grid
                  container
                  justifyContent='space-between'
                  alignItems='center'
                  gap='10px'
                >
                  {/* plan name */}
                  <Grid item>
                    <Typography
                      variant='subtitle1'
                      sx={{
                        display: "flex",
                        gap: "16px",
                        alignItems: "center",
                        fontWeight: 600,
                        color: (muiTheme) =>
                          globaluser?.isDarkTheme
                            ? muiTheme.palette.common.primary0
                            : muiTheme.palette.common.primary10,
                      }}
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <path
                          stroke={
                            globaluser?.isDarkTheme ? "#35383C" : "#35383C"
                          }
                          strokeLinecap='round'
                          strokeWidth='1.5'
                          d='M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9'
                        ></path>
                      </svg>{" "}
                      {t("common.planDialog.freePlanName")} {""}
                    </Typography>
                  </Grid>
                  <Grid item>
                    {renderCurrentPlanButton({
                      border: globaluser?.isDarkTheme
                        ? undefined
                        : `1px solid #D7EDED`,
                      opacity: globaluser?.isDarkTheme ? "unset" : 0.6,
                    })}
                  </Grid>
                </Grid>
                <Divider
                  sx={{ opacity: 0.5, borderColor: "#888D8A", mt: "24px" }}
                />
                {freePlanFeatures.map((item, i) => (
                  <Grid
                    container
                    key={i}
                    gap={"19px"}
                    sx={{ mt: i === 0 ? "27px" : "17px" }}
                  >
                    <Grid item>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <path
                          fill='#686B6E'
                          fillRule='evenodd'
                          stroke={
                            globaluser?.isDarkTheme
                              ? theme.palette.common.primary100
                              : "#F7FDF4"
                          }
                          strokeLinecap='round'
                          strokeWidth='2'
                          d='M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12zm14.707-1.293a1 1 0 00-1.414-1.414L11 13.586l-2.293-2.293a1 1 0 00-1.414 1.414L9.586 15a2 2 0 002.828 0l4.293-4.293z'
                          clipRule='evenodd'
                        ></path>
                      </svg>
                    </Grid>
                    <Grid item sx={{ flex: 1 }}>
                      <Typography
                        variant='subtitle1'
                        sx={{
                          fontWeight: 600,
                          lineHeight: "25px",
                          color: (muiTheme) =>
                            globaluser?.isDarkTheme
                              ? "#F7FDF4"
                              : muiTheme.palette.common.primary0,
                        }}
                      >
                        {item}
                      </Typography>
                    </Grid>
                  </Grid>
                ))}
              </Box>
            </Grid>
          )}
          <Grid
            item
            //xs={6}
            display='flex'
            flexDirection='column'
            sx={{
              flex: 1,
            }}
          >
            <Box
              sx={{
                p: "16px",
                borderRadius: "12px",
                background: (muiTheme) =>
                  globaluser?.isDarkTheme
                    ? muiTheme.palette.common.primary70
                    : muiTheme.palette.common.success20,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Grid
                container
                justifyContent='space-between'
                alignItems='center'
                gap='10px'
              >
                {/* plan name */}
                <Grid item>
                  <Typography
                    variant='subtitle1'
                    sx={{
                      display: "flex",
                      gap: "16px",
                      alignItems: "center",
                      fontWeight: 600,
                      color: (muiTheme) =>
                        globaluser?.isDarkTheme
                          ? muiTheme.palette.common.primary0
                          : muiTheme.palette.common.primary10,
                    }}
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='24'
                      height='24'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <path
                        stroke={
                          globaluser?.isDarkTheme
                            ? theme.palette.common.success20
                            : theme.palette.common.primary10
                        }
                        strokeLinecap='round'
                        strokeWidth='1.5'
                        d='M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9'
                      ></path>
                    </svg>{" "}
                    {t("common.planDialog.plusPlanName")}
                    {""}
                  </Typography>
                </Grid>
                {/* button */}
                <Grid item>
                  {globaluser?.isSubscribed ? (
                    renderCurrentPlanButton()
                  ) : (
                    <Button
                      variant='contained'
                      size='small'
                      fullWidth
                      sx={{
                        fontSize: "12px",
                        fontWeight: 600,
                        background: (muiTheme) =>
                          globaluser?.isDarkTheme
                            ? muiTheme.palette.common.success20
                            : muiTheme.palette.common.primary100,
                        color: (muiTheme) =>
                          globaluser?.isDarkTheme
                            ? muiTheme.palette.common.primary80
                            : muiTheme.palette.common.primary20,
                        textTransform: "none",
                        borderRadius: "8px",
                        p: "8px 12px",
                        "&:hover": {
                          background: (muiTheme) =>
                            globaluser?.isDarkTheme
                              ? muiTheme.palette.common.success20
                              : muiTheme.palette.common.primary100,
                        },
                      }}
                      startIcon={
                        loading.active &&
                        loading.action === "upgrade" && (
                          <CircularProgress
                            size='0.6rem'
                            sx={{
                              mr: "14px",
                              color: (muiTheme) =>
                                globaluser?.isDarkTheme
                                  ? muiTheme.palette.common.primary80
                                  : muiTheme.palette.common.primary20,
                            }}
                          />
                        )
                      }
                      onClick={upgradeHandler}
                    >
                      {t("common.planDialog.upgradeToPlusButton")}
                    </Button>
                  )}
                </Grid>
              </Grid>
              <Divider
                sx={{ opacity: 0.5, borderColor: "#888D8A", mt: "24px" }}
              />
              {plusPlanFeatures.map((item, i) => (
                <Grid
                  container
                  key={i}
                  gap={"19px"}
                  sx={{ mt: i === 0 ? "27px" : "17px" }}
                >
                  <Grid item>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='24'
                      height='24'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <path
                        fill='#686B6E'
                        fillRule='evenodd'
                        stroke={
                          globaluser?.isDarkTheme
                            ? theme.palette.common.primary100
                            : theme.palette.common.primary0
                        }
                        strokeLinecap='round'
                        strokeWidth='2'
                        d='M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12zm14.707-1.293a1 1 0 00-1.414-1.414L11 13.586l-2.293-2.293a1 1 0 00-1.414 1.414L9.586 15a2 2 0 002.828 0l4.293-4.293z'
                        clipRule='evenodd'
                      ></path>
                    </svg>
                  </Grid>
                  <Grid item sx={{ flex: 1 }}>
                    <Typography
                      variant='subtitle1'
                      sx={{
                        fontWeight: 600,
                        lineHeight: "25px",
                        color: (muiTheme) =>
                          globaluser?.isDarkTheme
                            ? "#F7FDF4"
                            : muiTheme.palette.common.primary0,
                      }}
                    >
                      {item}
                    </Typography>
                  </Grid>
                </Grid>
              ))}
            </Box>

            {globaluser?.isSubscribed && (
              <Typography
                variant='subtitle1'
                sx={{
                  display: "block",
                  mt: "12px",
                  color: (muiTheme) =>
                    globaluser?.isDarkTheme
                      ? muiTheme.palette.common.primary10
                      : muiTheme.palette.common.primary30,
                  fontSize: "18px",
                  fontWeight: 400,
                  textDecoration: "underline",
                  cursor:
                    loading.active && loading.action === "subcription"
                      ? "default"
                      : "pointer",
                  opacity:
                    loading.active && loading.action === "subcription"
                      ? 0.5
                      : 1,
                }}
                onClick={() => {
                  if (!(loading.active && loading.action === "subcription")) {
                    manageSubcription();
                  }
                }}
              >
                {t("common.planDialog.manageSubscription")}
              </Typography>
            )}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
