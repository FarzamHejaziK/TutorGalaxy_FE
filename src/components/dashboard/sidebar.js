import React, { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Avatar,
  Button,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  SwipeableDrawer,
  Switch,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { GlobalContext } from "../../context/GlobalContext";
import PlanDialog from "../../reusable/plan";
import { jwtKey } from "../../data/websiteInfo";
import axios from "../../utils/axios";
import { useTranslation } from "react-i18next";
import EmailLogin from "../../reusable/EmailLogin";
export default function SideBar({
  showSidebar,
  setShowSidebar,
  sideBarWidth,
  disabled,
  isNew,
  id,
  conversations,
  setConversations,
  onNewBuddyClick,
  onConversationClick,
}) {
  const { t } = useTranslation();
  const router = useRouter();

  const theme = useTheme();
  const matchesMD = useMediaQuery(theme.breakpoints.down("md"));
  const { user: globaluser, setAuth } = useContext(GlobalContext);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [upgradeDialog, setUpgradeDialog] = useState(false);
  const [myPlanDialog, setMyPlanDialog] = useState(false);
  const [loading, setLoading] = useState({
    active: false,
    action: "",
  });
  const [error, setError] = useState({
    status: false,
    message: "",
    action: "",
  });

  useEffect(() => {
    if (matchesMD) {
      setShowSidebar(false);
    } else {
      setShowSidebar(true);
    }
  }, [matchesMD]);

  const fetchConversations = async () => {
    try {
      setError({
        status: false,
        message: "",
        action: "",
      });
      setLoading({
        active: true,
        action: "history",
      });
      const result = await axios.get("/api/v1/user_profile", {
        headers: {
          authorization: "Bearer " + globaluser.token,
        },
      });
      if (result.data.error) {
        setError({
          status: true,
          message: t("chat.sidebar.failToLoadConversation"),
          action: "history",
        });
      } else {
        setConversations(result.data);
      }
      setLoading({
        active: false,
        action: "",
      });
    } catch (err) {
      setError({
        status: true,
        message:
          err.response?.data?.message ||
          t("chat.sidebar.failToLoadConversation"),
        action: "history",
      });
      setLoading({
        active: false,
        action: "",
      });
    }
  };

  const changeMode = async (mode) => {
    try {
      const result = await axios.post(
        `/api/v1/change_mode`,
        {
          screen_mode: mode,
        },
        {
          headers: {
            authorization: "Bearer " + globaluser.token,
          },
        }
      );
    } catch (err) {}
  };
  useEffect(() => {
    fetchConversations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const logoutHandler = async () => {
    try {
      router.push("/login");
      await localStorage.removeItem(jwtKey);
      setAuth(null);

      setAnchorElUser(null);
    } catch (e) {
      console.log("faled to logout", e);
    }
  };

  const menuID = "profile-menu";
  const userMenu = (
    <Menu
      id={menuID}
      anchorEl={anchorElUser}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={Boolean(anchorElUser)}
      onClose={() => setAnchorElUser(null)}
      sx={{
        "& .MuiPaper-root": {
          minWidth: "214px",
          backgroundColor: (muiTheme) =>
            globaluser?.isDarkTheme
              ? muiTheme.palette.common.primary80
              : muiTheme.palette.common.primary100,
          color: (muiTheme) => muiTheme.palette.primary.main,

          boxShadow: globaluser?.isDarkTheme
            ? "0px 8px 10px -6px rgba(6, 7, 8, 0.06), 0px 25px 50px -12px rgba(6, 7, 8, 0.16)"
            : "0px 8px 10px -6px rgba(6, 7, 8, 0.06), 0px 25px 50px -12px rgba(6, 7, 8, 0.16)",

          p: "16px",
          // mt: "20px",
          borderRadius: "16px",
        },
      }}
    >
      <MenuItem
        onClick={() => {
          setAnchorElUser(null);
          setMyPlanDialog(true);
        }}
        sx={{
          width: "100%",
          p: 0,
          "&:hover": {
            background: "transparent",
          },
        }}
      >
        <Grid container sx={{ gap: "16px" }}>
          <Grid item>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              fill='none'
              viewBox='0 0 24 24'
            >
              <path
                stroke={theme.palette.primary.main}
                strokeLinecap='round'
                strokeWidth='1.5'
                d='M3 8.5V7a2 2 0 012-2h14a2 2 0 012 2v1.5m-18 0h18m-18 0V17a2 2 0 002 2h14a2 2 0 002-2V8.5M6 16h4'
              ></path>
            </svg>
          </Grid>
          <Grid item>
            <Typography
              variant='subtitle2'
              //    align='center'
              sx={{ fontWeight: 600 }}
            >
              {t("chat.sidebar.menu.myPlan")}
            </Typography>
          </Grid>
        </Grid>
      </MenuItem>
      {/* theme */}
      <MenuItem
        onClick={() => {
          const newMode = !globaluser.isDarkTheme;
          changeMode(newMode === false ? 1 : 2);
          setAuth({ ...globaluser, isDarkTheme: newMode });
        }}
        disableRipple
        sx={{
          width: "100%",
          p: 0,
          pt: "10px",
          "&:hover": {
            background: "transparent",
          },
        }}
      >
        <Grid
          container
          alignItems='center'
          justifyContent='space-between'
          sx={{ gap: "15px" }}
        >
          <Grid item>
            <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
              {globaluser?.isDarkTheme
                ? t("chat.sidebar.menu.darkMode")
                : t("chat.sidebar.menu.lightMode")}
            </Typography>
          </Grid>
          <Grid item>
            <Switch
              name='mySwitch'
              checked={globaluser?.isDarkTheme}
              onChange={() => {}}
              sx={{
                width: "48px",
                height: "24px",
                padding: 0,
                display: "flex",
                "& .MuiSwitch-track": {
                  borderRadius: "24px",
                  background: "#FCFDFD",

                  border: "1px solid #CFCFCF",
                },
                "& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track": {
                  opacity: 1,
                  background:
                    "linear-gradient(45deg, rgba(77,98,229,1) 0%, rgba(135,221,238,1) 45%)",
                  border: 0,
                },
                "&.MuiSwitch-root .MuiSwitch-switchBase": {
                  color: "#CFCFCF",

                  p: "3px 5px",
                  "&:hover": {
                    backgroundColor: "unset",
                  },
                },
                "& .MuiSwitch-thumb": {
                  boxSizing: "border-box",
                  width: "18px",
                  height: "18px",
                  boxShadow: "none",
                },
                "&.MuiSwitch-root .Mui-checked": {
                  color: "#000",
                },
              }}
            />
          </Grid>
        </Grid>
      </MenuItem>
      {/* logout */}
      <MenuItem
        onClick={() => {
          setAnchorElUser(null);
          logoutHandler();
        }}
        sx={{
          width: "100%",
          p: 0,
          pt: "15px",
          "&:hover": {
            background: "transparent",
          },
        }}
      >
        <Grid container sx={{ gap: "15px" }}>
          <Grid item>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              fill='none'
              viewBox='0 0 24 24'
            >
              <path
                fill={theme.palette.primary.main}
                d='M16 2h-1c-2.829 0-4.243 0-5.121.879C9 3.758 9 5.172 9 8v8c0 2.829 0 4.243.879 5.122.878.878 2.291.878 5.118.878H16c2.828 0 4.242 0 5.12-.879.88-.878.88-2.293.88-5.121V8c0-2.828 0-4.243-.88-5.121C20.243 2 18.829 2 16 2z'
                opacity='0.5'
              ></path>
              <path
                fill={theme.palette.primary.main}
                fillRule='evenodd'
                d='M15.75 12a.75.75 0 00-.75-.75H4.027l1.961-1.68a.75.75 0 10-.976-1.14l-3.5 3a.75.75 0 000 1.14l3.5 3a.75.75 0 10.976-1.14l-1.96-1.68H15a.75.75 0 00.75-.75z'
                clipRule='evenodd'
              ></path>
            </svg>
          </Grid>
          <Grid item>
            <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
              {t("chat.sidebar.menu.logout")}
            </Typography>
          </Grid>
        </Grid>
      </MenuItem>
    </Menu>
  );

  const paddingContainer = "24px";
  return (
    <SwipeableDrawer
      sx={{
        width: showSidebar ? sideBarWidth : 0,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          height: "96.8%",
          m: "12px",
          borderRadius: "20px",
          padding: "24px 0px",
          width: showSidebar ? sideBarWidth : 0,

          backgroundColor: (muiTheme) =>
            globaluser?.isDarkTheme
              ? muiTheme.palette.common.primary80
              : muiTheme.palette.common.primary100,
          color: (muiTheme) => muiTheme.palette.primary.main,
        },
        "&:hover": {
          "& .history": {
            overflowY: "auto",
          },
        },
      }}
      variant={matchesMD ? "temporary" : "persistent"}
      anchor='left'
      open={showSidebar}
      onClose={() => setShowSidebar(false)}
      onOpen={() => setShowSidebar(true)}
    >
      {!globaluser?.email ? (
        <Grid
          container
          direction='column'
          alignItems='center'
          justifyContent='center'
          sx={{ height: "100%" }}
        >
          <Grid item sx={{ px: paddingContainer }}>
            <Typography
              variant='subtitle2'
              align='center'
              style={{ color: "#1A1A1A", fontWeight: 600 }}
            >
              {t("chat.sidebar.signIn")}
            </Typography>
            <div style={{ height: "24px" }} />
            <EmailLogin chatId={!isNew ? id : undefined} />
          </Grid>
        </Grid>
      ) : (
        <>
          <PlanDialog
            open={upgradeDialog}
            setOpen={setUpgradeDialog}
            error={true}
            errorMessage={t("chat.sidebar.freeBuddyComplete")}
            url={`/chat/${isNew ? "new" : id}`}
          />
          <Grid container direction='column' sx={{ maxHeight: "100%" }}>
            {/* profile and more menu */}
            <Grid
              item
              sx={{
                width: "100%",
                pb: "24px",
                px: paddingContainer,
                borderBottom: (muiTheme) =>
                  `1px solid ${muiTheme.palette.common.primary70}`,
              }}
            >
              <Grid
                container
                alignItems='center'
                justifyContent='space-between'
              >
                {/* profile */}
                <Grid item sx={{ flex: 1 }}>
                  <Grid container alignItems='center' gap='16px'>
                    <Avatar
                      variant='square'
                      src={
                        globaluser?.photo
                          ? globaluser?.photo
                          : "/dev/sample.png"
                      }
                      sx={{
                        borderRadius: "20px",
                        width: "48px",
                        height: "48px",
                      }}
                    />
                    {(globaluser?.given_name || globaluser?.family_name) && (
                      <Typography
                        variant='subtitle1'
                        sx={{
                          fontWeight: 600,
                        }}
                      >
                        {globaluser?.given_name
                          ? globaluser?.given_name + " "
                          : ""}
                        {globaluser?.family_name ? globaluser?.family_name : ""}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
                {/* more menu */}
                <Grid item>
                  {userMenu}
                  <PlanDialog
                    open={myPlanDialog}
                    setOpen={setMyPlanDialog}
                    url={`/chat/${isNew ? "new" : id}`}
                  />

                  <IconButton
                    disableRipple
                    sx={{ background: "transparent" }}
                    aria-owns={anchorElUser ? menuID : undefined}
                    aria-haspopup={anchorElUser ? true : false}
                    onClick={(e) => setAnchorElUser(e.currentTarget)}
                  >
                    <KeyboardArrowDownIcon
                      fontSize='small'
                      sx={{
                        fill: (muiTheme) => muiTheme.palette.common.primary40,
                      }}
                    />
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
            {/* create new */}
            <Grid
              item
              sx={{
                width: "100%",
                py: "24px",
                px: paddingContainer,

                borderBottom: (muiTheme) =>
                  `1px solid ${muiTheme.palette.common.primary70}`,
              }}
            >
              <Grid
                container
                alignItems='center'
                gap={"16px"}
                sx={{ cursor: disabled ? "default" : "pointer" }}
                onClick={() => {
                  if (disabled) {
                    return;
                  }
                  if (globaluser?.user_create_topic_permission === false) {
                    setUpgradeDialog(true);
                  } else {
                    onNewBuddyClick();
                  }
                }}
              >
                <Grid item>
                  <AddIcon
                    sx={{
                      fill: (muiTheme) => muiTheme.palette.common.primary10,
                    }}
                  />
                </Grid>
                <Grid item>
                  <Typography
                    variant='subtitle1'
                    sx={{
                      fontWeight: 600,
                      mt: "-5px",
                      color: (muiTheme) => muiTheme.palette.common.primary10,
                    }}
                  >
                    {t("chat.sidebar.createNew")}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            {/* history */}
            <Grid
              item
              sx={{
                width: "100%",
                pt: "24px",
                px: paddingContainer,
              }}
            >
              <Typography
                variant='subtitle2'
                sx={{
                  fontWeight: 600,
                  fontSize: "12px",
                  color: (muiTheme) =>
                    globaluser?.isDarkTheme
                      ? muiTheme.palette.common.primary40
                      : muiTheme.palette.common.success60,
                }}
              >
                {t("chat.sidebar.history")}
              </Typography>
            </Grid>
            {/* history */}
            <Grid
              item
              sx={{
                width: "100%",
                pt: "24px",
                px: paddingContainer,
                flex: 1,
                maxHeight: "100%",
                overflowY: "hidden",
              }}
              className='history'
            >
              {loading.active && loading.action === "history" ? (
                <Grid container direction='column'>
                  <Skeleton
                    variant='rounded'
                    height={60}
                    sx={{
                      bgcolor: globaluser?.isDarkTheme
                        ? "grey.900"
                        : "grey.300",
                      width: "100%",
                      mt: "20px",
                    }}
                  />
                  <Skeleton
                    variant='rounded'
                    height={60}
                    sx={{
                      bgcolor: globaluser?.isDarkTheme
                        ? "grey.900"
                        : "grey.300",
                      width: "100%",
                      mt: "26px",
                    }}
                  />
                  <Skeleton
                    variant='rounded'
                    height={60}
                    sx={{
                      bgcolor: globaluser?.isDarkTheme
                        ? "grey.900"
                        : "grey.300",

                      width: "100%",
                      mt: "26px",
                    }}
                  />
                </Grid>
              ) : (
                conversations.map((item, i) => (
                  <Grid
                    container
                    alignItems='center'
                    gap={"14px"}
                    key={i}
                    sx={{
                      pt: "14px",
                      cursor: disabled ? "default" : "pointer",
                    }}
                    onClick={() => {
                      if (disabled) {
                        return;
                      }
                      onConversationClick(item.id);
                    }}
                  >
                    {/* icon */}
                    <Grid item>
                      <img
                        src={item.icon}
                        style={{ width: "20px", height: "20px" }}
                      />
                    </Grid>
                    <Grid item sx={{ flex: 1 }}>
                      <Typography
                        variant='subtitle2'
                        sx={{
                          display: "block",
                          fontWeight: 600,
                          color: (muiTheme) =>
                            muiTheme.palette.common.primary10,
                        }}
                      >
                        {item.topic}
                      </Typography>
                      <Typography
                        variant='subtitle2'
                        sx={{
                          fontWeight: 600,
                          mt: "2px",
                          display: "block",
                          lineHeight: "22px",
                          fontSize: "12px",
                          color: (muiTheme) =>
                            muiTheme.palette.common.primary40,
                        }}
                      >
                        {item.goal}
                      </Typography>
                    </Grid>
                  </Grid>
                ))
              )}
            </Grid>
          </Grid>
        </>
      )}
    </SwipeableDrawer>
  );
}
