import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Alert,
  Avatar,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useTranslation } from "react-i18next";

import SideBar from "./sidebar";
import { GlobalContext } from "../../context/GlobalContext";

import axios from "../../utils/axios";
import { jwtKey } from "../../data/websiteInfo";
import PlanDialog from "../../reusable/plan";
import MessageDialog from "../../reusable/messageDialog";
function showEllipsesIfLong(text, maxLength = 25) {
  if (text?.length <= maxLength) {
    return text;
  } else {
    return text?.substring(0, maxLength - 3) + "...";
  }
}
const Course = ({ topic, goal, icon, url }) => {
  const theme = useTheme();
  const matchesLG = useMediaQuery(theme.breakpoints.down("lg"));
  const matchesMD = useMediaQuery(theme.breakpoints.down("md"));
  const matchesSM = useMediaQuery(theme.breakpoints.down("sm"));

  const { user: globaluser } = useContext(GlobalContext);

  return (
    <Paper
      sx={{
        p: "24px",
        boxSizing: "border-box",
        borderRadius: "8px",
        border: (muiTheme) =>
          `1px solid ${
            globaluser?.isDarkTheme
              ? muiTheme.palette.common.primary60
              : muiTheme.palette.common.primary70
          }`,

        background: (muiTheme) => muiTheme.palette.secondary.main,
        color: (muiTheme) => muiTheme.palette.primary.main,
        boxShadow: "none",
        height: "100%",
        minHeight: { xs: "132px", lg: "133px" },
        minWidth: "131px",
        width: "100%",
        // maxWidth: "190px",
        display: "flex",
        flexDirection: "column",
        //justifyContent: "center",
        //alignItems: "center",
        textDecoration: "none",
        cursor: "pointer",
      }}
      component={Link}
      href={url}
    >
      <img src={icon} style={{ width: "32px", height: "32px" }} />
      <Tooltip title={topic}>
        <Typography variant='subtitle2' sx={{ fontWeight: 400, mt: "16px" }}>
          {showEllipsesIfLong(
            topic,
            matchesSM ? 15 : matchesMD ? 20 : matchesLG ? 25 : 30
          )}
        </Typography>
      </Tooltip>
      <Tooltip title={goal}>
        <Typography
          variant='subtitle2'
          sx={{
            fontWeight: 400,
            mt: "4px",
            lineHeight: "22px",
            //fontSize: "14px",
            color: (theme) => theme.palette.common.primary40,
          }}
        >
          {showEllipsesIfLong(
            goal,
            matchesSM ? 15 : matchesMD ? 20 : matchesLG ? 25 : 35
          )}
        </Typography>
      </Tooltip>
    </Paper>
  );
};

const MainPaper = ({ children, sx, otherProps, onClick }) => {
  const { user: globaluser } = useContext(GlobalContext);

  return (
    <Paper
      sx={{
        p: "24px",
        boxSizing: "border-box",
        borderRadius: "12px",
        border: (muiTheme) =>
          `1px solid ${
            globaluser?.isDarkTheme
              ? muiTheme.palette.common.primary80
              : muiTheme.palette.common.primary70
          }`,
        background: (muiTheme) =>
          globaluser?.isDarkTheme
            ? muiTheme.palette.common.primary80
            : muiTheme.palette.common.primary100,
        color: (muiTheme) =>
          globaluser?.isDarkTheme
            ? muiTheme.palette.common.primary0
            : muiTheme.palette.common.primary10,
        boxShadow: globaluser?.isDarkTheme
          ? "none"
          : "0px 12px 56px 0px rgba(6, 28, 61, 0.08)",
        ...sx,
      }}
      {...otherProps}
      onClick={onClick ? onClick : undefined}
    >
      {children}
    </Paper>
  );
};
export default function Dashboard() {
  console.log("1. Start of Dashboard component");
  const { t } = useTranslation();

  const theme = useTheme();
  const router = useRouter();
  const matches350 = useMediaQuery(theme.breakpoints.down("350"));
  const sideBarWidth = "260px";
  const { user: globaluser, setAuth } = useContext(GlobalContext);

  const [showSidebar, setShowSidebar] = useState(true);
  const [anchorElUser, setAnchorElUser] = useState(null);
  //const [myPlanDialog, setMyPlanDialog] = useState(false);
  const [upgradeDialog, setUpgradeDialog] = useState(false);
  const [upgradeMessageDialog, setUpgradeMessageDialog] = useState({
    active: false,
    error: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    status: false,
    message: "",
    action: "",
  });
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    let upgrade = router.query.upgrade;
    if (upgrade) {
      if (upgrade === "true" && globaluser?.isSubscribed) {
        setUpgradeMessageDialog({
          active: true,
          error: false,
        });
      } else if (upgrade === "false") {
        setUpgradeMessageDialog({
          active: true,
          error: true,
        });
      }
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);
  const fetchConversations = async () => {
    try {
      setError({
        status: false,
        message: "",
        action: "",
      });
      setLoading(true);
      const result = await axios.get("/api/v1/user_profile", {
        headers: {
          authorization: "Bearer " + globaluser.token,
        },
      });
      if (result.data.error) {
        setError({
          status: true,
          message: t("home.failToLoadError"),
          action: "page",
        });
      } else {
        setConversations(result.data);
      }
      setLoading(false);
    } catch (err) {
      setError({
        status: true,
        message: err.response?.data?.message || t("home.failToLoadError"),
        action: "page",
      });
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchConversations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // const logoutHandler = async () => {
  //   try {
  //     router.push("/login");
  //     await localStorage.removeItem(jwtKey);
  //     setAuth(null);

  //     setAnchorElUser(null);
  //   } catch (e) {
  //     console.log("faled to logout", e);
  //   }
  // };

  // const menuID = "profile-menu";
  // const userMenu = (
  //   <Menu
  //     id={menuID}
  //     anchorEl={anchorElUser}
  //     anchorOrigin={{
  //       vertical: "bottom",
  //       horizontal: "right",
  //     }}
  //     keepMounted
  //     transformOrigin={{
  //       vertical: "top",
  //       horizontal: "right",
  //     }}
  //     open={Boolean(anchorElUser)}
  //     onClose={() => setAnchorElUser(null)}
  //     sx={{
  //       "& .MuiPaper-root": {
  //         minWidth: "214px",
  //         background: (muiTheme) => muiTheme.palette.common.main80,
  //         boxShadow: (muiTheme) =>
  //           `1px 1px 5px ${muiTheme.palette.common.dark}`,
  //         color: (muiTheme) => muiTheme.palette.common.white,
  //         padding: "20px",
  //         mt: "20px",
  //       },
  //     }}
  //   >
  //     <MenuItem
  //       onClick={() => {
  //         setAnchorElUser(null);
  //         setMyPlanDialog(true);
  //       }}
  //       sx={{
  //         width: "100%",
  //         p: 0,
  //       }}
  //     >
  //       <Grid container alignItems='center' sx={{ gap: "15px" }}>
  //         <Grid item>
  //           <IconButton
  //             sx={{
  //               background: (muiTheme) => muiTheme.palette.common.white,
  //               borderRadius: "4px",
  //               p: "3px",
  //               width: "30px",
  //               height: "30px",
  //             }}
  //           >
  //             <svg
  //               xmlns='http://www.w3.org/2000/svg'
  //               width='30'
  //               height='29'
  //               fill='none'
  //               viewBox='0 0 30 29'
  //             >
  //               <path
  //                 fill='#171A36'
  //                 fillRule='evenodd'
  //                 d='M14.743 4.37c-.454 0-.859.078-1.116.19h-.003L6.411 7.665c-.947.404-1.012.77-1.012.81 0 .038.065.404 1.012.81h.002l7.214 3.103c.257.112.662.19 1.116.19.455 0 .859-.078 1.117-.19h.002l7.211-3.103h.002c.947-.406 1.012-.772 1.012-.81 0-.04-.065-.406-1.012-.81L15.862 4.56l-.002-.001c-.258-.112-.662-.19-1.117-.19zm1.865-1.432c-.561-.243-1.238-.343-1.865-.343-.626 0-1.303.1-1.864.343h-.002l-7.206 3.1c0 .001 0 0 0 0-1.13.484-2.105 1.297-2.105 2.435 0 1.14.973 1.951 2.104 2.434l7.207 3.101h.002c.56.244 1.238.344 1.864.344.627 0 1.304-.1 1.864-.343h.002l7.206-3.101c1.13-.483 2.105-1.296 2.105-2.435s-.973-1.95-2.104-2.434l-7.207-3.1h-.002z'
  //                 clipRule='evenodd'
  //               ></path>
  //               <path
  //                 fill='#171A36'
  //                 fillRule='evenodd'
  //                 d='M4 12.428c.506 0 .916.398.916.888 0 .288.118.658.355 1.01.236.353.538.607.81.723l.002.001 8.297 3.575c.402.172.852.17 1.233.003l.004-.002 8.299-3.576h.002c.273-.117.574-.371.81-.724.237-.352.355-.722.355-1.01 0-.49.41-.888.917-.888.506 0 .916.398.916.888 0 .706-.267 1.408-.65 1.98-.384.57-.938 1.091-1.606 1.378l-8.294 3.573-.002.001a3.445 3.445 0 01-2.725.002L5.34 16.674h-.002c-.668-.287-1.222-.808-1.605-1.379-.384-.571-.651-1.273-.651-1.979 0-.49.41-.888.917-.888z'
  //                 clipRule='evenodd'
  //               ></path>
  //               <path
  //                 fill='#171A36'
  //                 fillRule='evenodd'
  //                 d='M4 18.348c.506 0 .916.398.916.888 0 .747.456 1.426 1.168 1.735l8.296 3.575c.402.171.852.169 1.233.002l.004-.002 8.297-3.575c.712-.309 1.169-.988 1.169-1.735 0-.49.41-.888.917-.888.506 0 .916.398.916.888 0 1.455-.888 2.765-2.253 3.357h-.002l-8.295 3.574-.002.001a3.445 3.445 0 01-2.725.002l-8.302-3.578c-1.366-.59-2.254-1.9-2.254-3.356 0-.49.41-.888.917-.888z'
  //                 clipRule='evenodd'
  //               ></path>
  //             </svg>
  //           </IconButton>
  //         </Grid>
  //         <Grid item>
  //           <Typography
  //             variant='h6'
  //             align='center'
  //             sx={{ width: "100%", fontWeight: 400 }}
  //           >
  //             My Plan
  //           </Typography>
  //         </Grid>
  //       </Grid>
  //     </MenuItem>
  //     {/* logout */}
  //     <MenuItem
  //       onClick={() => {
  //         setAnchorElUser(null);
  //         logoutHandler();
  //       }}
  //       sx={{
  //         width: "100%",
  //         p: 0,
  //         pt: "15px",
  //       }}
  //     >
  //       <Grid container alignItems='center' sx={{ gap: "15px" }}>
  //         <Grid item>
  //           <IconButton
  //             sx={{
  //               background: (muiTheme) => muiTheme.palette.common.white,
  //               borderRadius: "4px",
  //               p: "3px",
  //               width: "30px",
  //               height: "30px",
  //             }}
  //           >
  //             <svg
  //               xmlns='http://www.w3.org/2000/svg'
  //               width='24'
  //               height='24'
  //               fill='none'
  //               viewBox='0 0 24 24'
  //             >
  //               <path
  //                 fill='#171A36'
  //                 d='M14 19v-.083A7.93 7.93 0 0110 20c-4.411 0-8-3.589-8-8s3.589-8 8-8a7.93 7.93 0 014 1.083V2.838A9.954 9.954 0 0010 2C4.478 2 0 6.477 0 12s4.478 10 10 10a9.954 9.954 0 004-.838V19zm4-9.592L20.963 12 18 14.592V13h-8v-2h8V9.408zM16 5v4H8v6h8v4l8-7-8-7z'
  //               ></path>
  //             </svg>
  //           </IconButton>
  //         </Grid>
  //         <Grid item>
  //           <Typography
  //             variant='h6'
  //             align='center'
  //             sx={{ width: "100%", fontWeight: 400 }}
  //           >
  //             Log out
  //           </Typography>
  //         </Grid>
  //       </Grid>
  //     </MenuItem>
  //   </Menu>
  // );
  const paddingContainer = {
    paddingLeft: "30px",
    paddingRight: "30px",
  };

  const mainWidth = { xl: "50%", md: "70%", sm: "80%", xs: "100%" };
  return (
    <Grid
      container
      sx={{
        minHeight: "100vh",
        backgroundColor: (muiTheme) => muiTheme.palette.common.primary70,
        color: (muiTheme) => muiTheme.palette.primary.main,
      }}
    >
      <PlanDialog
        open={upgradeDialog}
        setOpen={setUpgradeDialog}
        error={true}
        errorMessage={t("home.freeBuddyComplete")}
        url='/'
      />
      {upgradeMessageDialog.active && (
        <MessageDialog
          open={upgradeMessageDialog.active}
          onClose={() =>
            setUpgradeMessageDialog({
              active: false,
              error: false,
            })
          }
          error={upgradeMessageDialog.error}
          message={
            upgradeMessageDialog.error
              ? t("home.subcriptionUnsuccessful")
              : t("home.subcriptionSuccessful")
          }
        />
      )}
      {/* sidebar */}
      {/* <Grid
        item
        style={{
          display: "flex",
          width: showSidebar ? `${sideBarWidth}` : 0,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 30,
            right: showSidebar ? "-15px" : "-20px",
          }}
        >
          <IconButton
            sx={{
              p: 0,
              background: (muiTheme) => muiTheme.palette.common.white,
              borderRadius: "50%",
              boxShadow: "2px 2px 8px 0px rgba(0, 0, 0, 0.10)",
              zIndex: 1300,
              width: "30px",
              height: "30px",
            }}
            disableRipple
            onClick={() => setShowSidebar((s) => !s)}
          >
            {showSidebar ? (
              <ChevronLeftIcon fontSize='small' />
            ) : (
              <ChevronRightIcon fontSize='small' />
            )}
          </IconButton>
        </div>
        <SideBar
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          sideBarWidth={sideBarWidth}
        />
      </Grid> */}
      {/* main */}
      <Grid item sx={{ flex: 1, p: "20px" }}>
        <Grid
          container
          direction='column'
          alignItems='center'
          sx={{ height: "100%" }}
        >
          {/* header */}
          {/* <Grid
            item
            sx={{
              ...paddingContainer,
              width: "100%",
              p: "13px",
              boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
              background: (muiTheme) => muiTheme.palette.common.main80,
              position: "relative",
            }}
          >
            <Typography variant='h5' align='center' sx={{ fontWeight: 400 }}>
              Buddies
            </Typography>
            {userMenu}
            <PlanDialog open={myPlanDialog} setOpen={setMyPlanDialog} url='/' />
            <div style={{ position: "absolute", top: "13px", right: "18px" }}>
              <Grid
                container
                alignItems='center'
                sx={{
                  color: (muiTheme) => muiTheme.palette.common.white,
                  gap: "18px",
                  cursor: "pointer",
                }}
                aria-owns={anchorElUser ? menuID : undefined}
                aria-haspopup={anchorElUser ? true : false}
                onClick={(e) => setAnchorElUser(e.currentTarget)}
              >
                {(globaluser?.given_name || globaluser?.family_name) && (
                  <Typography
                    variant='h6'
                    sx={{
                      fontWeight: 400,
                      display: { sm: "unset", xs: "none" },
                    }}
                  >
                    {globaluser?.given_name ? globaluser?.given_name + " " : ""}
                    {globaluser?.family_name ? globaluser?.family_name : ""}
                  </Typography>
                )}

                <Avatar
                  variant='square'
                  src={
                    globaluser?.photo ? globaluser?.photo : "/dev/sample.png"
                  }
                  sx={{ borderRadius: "4px", width: "32px", height: "32px" }}
                />
              </Grid>
            </div>
          </Grid> */}
          {/* divider */}

          {/* new  Coversation */}
          <Grid
            item
            sx={{
              width: "100%",
            }}
          >
            <MainPaper
              onClick={() => {
                if (globaluser?.user_create_topic_permission === false) {
                  setUpgradeDialog(true);
                } else {
                  router.push("/chat/new");
                }
              }}
              sx={{
                minHeight: { md: "180px", xs: "150px" },
                cursor:
                  globaluser?.user_create_topic_permission === false
                    ? "default"
                    : "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Grid
                container
                gap='16px'
                justifyContent='center'
                //  alignItems='center'
              >
                <Grid item>
                  <AddCircleOutlineIcon
                    sx={{
                      fontSize: "32px",
                      fill: (muiTheme) => muiTheme.palette.primary.main,
                    }}
                  />
                </Grid>
                <Grid item>
                  <Typography
                    variant='h3'
                    align='center'
                    sx={{
                      mt: "-1px",
                      fontSize: "28px",
                      fontWeight: 500,
                      color: (muiTheme) => muiTheme.palette.primary.main,
                    }}
                  >
                    {t("home.createNew")}
                  </Typography>
                </Grid>
              </Grid>
            </MainPaper>
          </Grid>

          {error.status && error.action === "submit" ? (
            <Grid
              item
              sx={{
                mt: "20px",
                width: "100%",
              }}
            >
              <Alert severity='error'>{error.message}</Alert>
            </Grid>
          ) : loading ? (
            <Grid
              item
              sx={{
                mt: "20px",
                width: "100%",
                flex: 1,
              }}
            >
              <MainPaper sx={{ height: "100%" }}>
                <Skeleton
                  variant='rounded'
                  height={60}
                  sx={{
                    bgcolor: globaluser?.isDarkTheme ? "grey.900" : "grey.300",
                    width: "100%",
                    mt: "20px",
                  }}
                />
                <Skeleton
                  variant='rounded'
                  height={60}
                  sx={{
                    bgcolor: globaluser?.isDarkTheme ? "grey.900" : "grey.300",
                    width: "100%",
                    mt: "26px",
                  }}
                />
                <Skeleton
                  variant='rounded'
                  height={60}
                  sx={{
                    bgcolor: globaluser?.isDarkTheme ? "grey.900" : "grey.300",

                    width: "100%",
                    mt: "26px",
                  }}
                />
              </MainPaper>
            </Grid>
          ) : (
            <>
              {/* Ongoing Courses*/}

              <Grid
                item
                sx={{
                  mt: "20px",
                  width: "100%",
                  flex: 1,
                }}
              >
                <MainPaper sx={{ height: "100%" }}>
                  {conversations.length === 0 ? (
                    <Grid
                      container
                      direction='column'
                      alignItems='center'
                      justifyContent='center'
                      sx={{ height: "100%" }}
                    >
                      <Grid item>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          width='154'
                          height='154'
                          fill='none'
                          viewBox='0 0 154 154'
                        >
                          <path
                            stroke='#B6F09C'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='5.5'
                            d='M67.375 67.375l13.384-13.384c5.011-5.011 13.137-5.011 18.149 0l1.101 1.101c5.011 5.012 5.011 13.138 0 18.15L86.625 86.624m-19.25-19.25l-45.467 45.467c-5.012 5.012-5.012 13.137 0 18.149l1.1 1.101c5.012 5.012 13.138 5.012 18.15 0l45.467-45.467m-19.25-19.25l19.25 19.25m-33.371-33L38.5 47.39m34.264-13.284L66.8 19.25m33.592 14.855l5.964-14.855m13.536 34.352l14.79-6.151m-14.79 33.697l14.858 5.986m-34.381 13.521l5.988 14.845'
                          ></path>
                        </svg>
                      </Grid>
                      <Grid item sx={{ mt: "24" }}>
                        <Typography
                          variant='subtitle1'
                          align='center'
                          sx={{
                            opacity: globaluser?.isDarkTheme ? 1 : 0.5,
                            fontWeight: 600,
                            color: (muiTheme) =>
                              globaluser?.isDarkTheme
                                ? muiTheme.palette.common.primary0
                                : muiTheme.palette.common.primary20,
                          }}
                        >
                          {t("home.history")}
                        </Typography>
                      </Grid>
                    </Grid>
                  ) : (
                    <Grid container direction='column'>
                      {/* heading */}
                      <Grid item sx={{ width: "100%" }}>
                        <Typography
                          variant='subtitle1'
                          sx={{
                            fontWeight: 600,
                            color: (muiTheme) =>
                              globaluser?.isDarkTheme
                                ? muiTheme.palette.common.primary0
                                : muiTheme.palette.common.primary20,
                          }}
                        >
                          {t("home.history")}
                        </Typography>
                      </Grid>
                      {/* topics */}
                      <Grid item sx={{ width: "100%", mt: "24px" }}>
                        <Grid
                          container
                          //justifyContent='space-between'
                          spacing={2}
                        >
                          {conversations.map((item, i) => (
                            <Grid
                              item
                              key={item.id}
                              display='flex'
                              lg={3}
                              md={3}
                              sm={6}
                              xs={matches350 ? 12 : 6}
                            >
                              <Course
                                topic={item.topic}
                                goal={item.goal}
                                icon={item.icon}
                                url={`/chat/${item.id}`}
                                key={i}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>
                    </Grid>
                  )}
                </MainPaper>
              </Grid>
            </>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}
