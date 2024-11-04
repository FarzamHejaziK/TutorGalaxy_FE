import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { useRouter } from "next/router";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Link,
  Paper,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
  Snackbar,
  Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import StopIcon from "@mui/icons-material/Stop";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ReactAudioPlayer from "react-audio-player";
import SideBar from "../dashboard/sidebar";
import { GlobalContext } from "../../context/GlobalContext";

import axios from "../../utils/axios";
import SendText from "./sendText";
import ReactMarkdown from "react-markdown";
//import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import SyntaxHighlighter from "react-syntax-highlighter";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  a11yDark,
  atelierSavannaLight,
} from "react-syntax-highlighter/dist/cjs/styles/hljs";
//import { a11yDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import "katex/dist/katex.min.css";

import Loader from "../../reusable/loader";
import ScrollToBottom, {
  useAtTop,
  useAtEnd,
  useScrollTo,
  StateContext,
  useObserveScrollPosition,
} from "react-scroll-to-bottom";
import TextEditor from "./textEditor";
import CodeEditor from "./codeEditor";
import PlanDialog from "../../reusable/plan";
import MessageDialog from "../../reusable/messageDialog";
import CopyAllOutlinedIcon from "@mui/icons-material/CopyAllOutlined";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import { useTranslation } from "react-i18next";
import GoogleLoginComponent from "../../reusable/Google";
const CoursePaper = ({ children, sx }) => (
  <Paper
    sx={{
      p: "16px",
      borderRadius: "16px",
      background: "rgba(255, 255, 255, 0.34)",
      boxShadow: "none",
      ...sx,
    }}
  >
    {children}
  </Paper>
);

const filteredChat = (message) => {
  if (!message) return "";
  return message
    .replace("then user: ", "")
    .replace("then system: ", "")
    .replace("system : ", "")
    .replace("system: ", "")
    .replace("System:", "")
    .replace("System: ", "")
    .replace("System : ", "")
    .replace("user: ", "")
    .replace("User:", "")
    .replace(/^\*\s/gm, "\\* ")
    .replace(/^(\d+)\.\s/gm, "$1\\. ");
  // .replaceAll(`\[`, "$$$ ")
  // .replaceAll(`\]`, " $$$")
  // .replaceAll(`\\to`, `\\\\to`);
};

function CodeCopyBtn({ children }) {
  const theme = useTheme();

  const [copyOk, setCopyOk] = React.useState(false);
  const icon = copyOk ? (
    <CheckBoxOutlinedIcon
      sx={{
        fill: theme.palette.common.primary40,
        width: "16px",
        height: "16px",
      }}
    />
  ) : (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='16'
      height='16'
      fill='none'
      viewBox='0 0 16 16'
    >
      <path
        stroke={theme.palette.common.primary40}
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M11.667 6H12c.736 0 1.333.597 1.333 1.333V12c0 .736-.597 1.333-1.333 1.333H7.333A1.333 1.333 0 016 12v-.333M4 10h4.667C9.403 10 10 9.403 10 8.667V4c0-.736-.597-1.333-1.333-1.333H4c-.736 0-1.333.597-1.333 1.333v4.667C2.667 9.403 3.264 10 4 10z'
      ></path>
    </svg>
  );
  const handleClick = (e) => {
    navigator.clipboard.writeText(children[0].props.children[0]);

    setCopyOk(true);
    setTimeout(() => {
      setCopyOk(false);
    }, 1000);
  };
  return (
    <div style={{ position: "absolute", right: "7px", top: 0 }}>
      <IconButton sx={{ p: 0 }} onClick={handleClick}>
        {icon}
      </IconButton>
    </div>
  );
}
const Pre = ({ children }) => (
  <pre style={{ position: "relative" }}>
    <CodeCopyBtn>{children}</CodeCopyBtn>
    {children}
  </pre>
);

const Messages = ({
  page,
  error,
  loading,
  paddingContainer,
  mainWidth,
  showEditor,
  isNew,
  langId,
  setShowSidebar,
  setShowEditor,
  onTextEditorClick,
  chats,
  wizardProfile,
  buddyProfile,
  setChats,
  textToSpeech,
  fetchMoreRecords,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const matches1200 = useMediaQuery(theme.breakpoints.down("1200"));
  const [top] = useAtTop();
  const [end] = useAtEnd();
  const scrollToTop = useScrollTo();
  const containerRef = useRef(null);
  const { user: globaluser } = useContext(GlobalContext);
  const [isLoaded, setIsloaded] = useState(false);

  useEffect(() => {
    if (!end && !isLoaded) {
      setIsloaded(true);
    }
  }, [end]);
  useEffect(() => {
    const fetchRecords = async () => {
      if (
        top &&
        !isNew &&
        isLoaded &&
        chats.length > 0 &&
        !(loading.active && loading.action === "page")
      ) {
        const scrollHeightBefore = containerRef?.current?.scrollHeight;
        await fetchMoreRecords(page + 1);
        setTimeout(() => {
          const scrollHeightAfter = containerRef?.current?.scrollHeight;

          scrollToTop(scrollHeightAfter - scrollHeightBefore);
        }, 100);
      }
    };
    fetchRecords();
  }, [top]);
  return error.status && error.action === "submit" ? (
    <Alert
      severity='error'
      sx={{
        ...paddingContainer,
        mt: "20px",
        width: mainWidth,
        mx: "auto",
      }}
    >
      {error.message}
    </Alert>
  ) : (
    <Grid
      container
      direction='column'
      sx={{
        ...paddingContainer,
        pr: {
          md: showEditor.active ? "10px" : "15px",
          xs: "15px",
        },
        width: mainWidth,
        mx: "auto",
        position: "relative",
      }}
      ref={containerRef}
    >
      {/* code editor and text editor buttons */}
      {!showEditor.active && !isNew && !matches1200 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "100%",
            //top: "74px",
            // right: 0,
            // left: "100%",
          }}
        >
          <Grid
            container
            direction='column'
            sx={{ mt: "20px", position: "fixed" }}
          >
            {langId !== "-1" &&
              globaluser?.email &&
              !(loading.active && loading.action === "page") && (
                <Grid item sx={{ mb: "20px" }}>
                  <Button
                    variant='contained'
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      textTransform: "none",
                      p: "14px",
                      width: "154px",
                      borderRadius: "16px",
                      fontSize: "14px",
                      fontWeight: 600,
                      boxShadow: "none",
                      background: (muiTheme) =>
                        globaluser?.isDarkTheme
                          ? muiTheme.palette.common.primary60
                          : muiTheme.palette.common.primary100,
                      border: (muiTheme) =>
                        `1px solid ${
                          globaluser?.isDarkTheme
                            ? muiTheme.palette.common.primary60
                            : muiTheme.palette.common.primary70
                        }`,
                      color: (muiTheme) =>
                        globaluser?.isDarkTheme
                          ? muiTheme.palette.common.primary0
                          : muiTheme.palette.common.primary40,
                      "&:hover": {
                        background: (muiTheme) =>
                          globaluser?.isDarkTheme
                            ? muiTheme.palette.common.primary60
                            : muiTheme.palette.common.primary100,
                        boxShadow: "none",
                      },
                    }}
                    onClick={() => {
                      setShowSidebar(false);
                      setShowEditor({
                        active: true,
                        type: "code",
                      });
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
                        fill={
                          globaluser?.isDarkTheme
                            ? theme.palette.common.primary0
                            : theme.palette.common.primary40
                        }
                        d='M3.667 5.361h16.666v13.278H3.667V5.36z'
                        opacity='0.5'
                      ></path>
                      <path
                        stroke={
                          globaluser?.isDarkTheme
                            ? theme.palette.common.primary0
                            : theme.palette.common.primary40
                        }
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeMiterlimit='10'
                        d='M3.667 5.334h16.666v13.332H3.667V5.334z'
                      ></path>
                      <path
                        stroke={
                          globaluser?.isDarkTheme
                            ? theme.palette.common.primary0
                            : theme.palette.common.primary40
                        }
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeMiterlimit='10'
                        d='M5.443 5.493v1.458H3.667h16.666m-10.722 3.18l-2.309 2.31m2.31 2.331l-2.31-2.309m5.426-3.079l-1.792 6.033m3.117-.666l2.31-2.31m-2.31-2.331l2.31 2.309'
                      ></path>
                    </svg>
                    {t("chat.codeEditorButton")}
                  </Button>
                </Grid>
              )}
            <Grid item>
              <Button
                variant='contained'
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  textTransform: "none",
                  p: "14px",
                  width: "154px",
                  borderRadius: "16px",
                  fontSize: "14px",
                  fontWeight: 600,
                  boxShadow: "none",
                  background: (muiTheme) =>
                    globaluser?.isDarkTheme
                      ? muiTheme.palette.common.primary60
                      : muiTheme.palette.common.primary100,
                  border: (muiTheme) =>
                    `1px solid ${
                      globaluser?.isDarkTheme
                        ? muiTheme.palette.common.primary60
                        : muiTheme.palette.common.primary70
                    }`,
                  color: (muiTheme) =>
                    globaluser?.isDarkTheme
                      ? muiTheme.palette.common.primary0
                      : muiTheme.palette.common.primary40,
                  "&:hover": {
                    background: (muiTheme) =>
                      globaluser?.isDarkTheme
                        ? muiTheme.palette.common.primary60
                        : muiTheme.palette.common.primary100,
                    boxShadow: "none",
                  },
                }}
                onClick={() => {
                  setShowSidebar(false);
                  setShowEditor({
                    active: true,
                    type: "text",
                  });
                  onTextEditorClick();
                }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='28'
                  height='24'
                  fill='none'
                  viewBox='0 0 24 24'
                  style={{ marginLeft: "-12px" }}
                >
                  <path
                    stroke={
                      globaluser?.isDarkTheme
                        ? theme.palette.common.primary0
                        : theme.palette.common.primary40
                    }
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M4.71 7.236L9.67 2.25M8.42 11.464h3.717m.596 6.033h3.824m-8.137 0h.39m6.087-3.017h1.66m-8.137 0h1.554m-1.554 5.598l.655-4.345 9.252-12.899a2 2 0 113.25 2.332l-9.251 12.898-3.906 2.014z'
                  ></path>
                  <path
                    stroke={
                      globaluser?.isDarkTheme
                        ? theme.palette.common.primary0
                        : theme.palette.common.primary40
                    }
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M18.929 2.255L9.67 2.25v3.989a.997.997 0 01-.973.997H4.71v13.517a.997.997 0 00.997.997h13.612a.997.997 0 00.972-.997V6.958'
                  ></path>
                  <path
                    stroke={
                      globaluser?.isDarkTheme
                        ? theme.palette.common.primary0
                        : theme.palette.common.primary40
                    }
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M16.349 5.591a2 2 0 013.25 2.331M9.074 15.733a2 2 0 113.251 2.331'
                  ></path>
                </svg>
                <span>{t("chat.textEditorButton")}</span>
              </Button>
            </Grid>
          </Grid>
        </div>
      )}
      {loading.active && loading.action === "pagination" && (
        <Grid item sx={{ width: "100%", pt: "20px" }}>
          <Grid container spacing={2} alignItems='center'>
            <Grid item>
              <Avatar
                src={isNew ? wizardProfile.image : buddyProfile.image}
                sx={{
                  width: "48px",
                  height: "48px",
                }}
              />
            </Grid>
            <Grid item>
              <Typography
                variant='subtitle1'
                sx={{
                  fontWeight: 500,
                  color: (muiTheme) => muiTheme.palette.primary.main,
                }}
              >
                {t("chat.moreChats")}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      )}
      {chats.map((chat, i) => {
        const isUser = /^user: /.test(chat.message);
        const streamedMessage =
          chats.length - 1 === i
            ? !(loading.active && loading.action === "send")
            : true;
        return (
          <Grid
            key={chat._id}
            item
            sx={{
              width: "100%",
              mt: "20px",
              maxWidth: "100%",
            }}
          >
            <CoursePaper
              sx={{
                border: (muiTheme) =>
                  isUser
                    ? globaluser?.isDarkTheme
                      ? `1px solid ${muiTheme.palette.common.primary60}`
                      : `3px solid ${muiTheme.palette.common.primary100}`
                    : `1px solid ${
                        globaluser?.isDarkTheme
                          ? muiTheme.palette.common.primary60
                          : muiTheme.palette.common.primary70
                      }`,
                background: (muiTheme) =>
                  isUser
                    ? globaluser?.isDarkTheme
                      ? muiTheme.palette.common.primary60
                      : muiTheme.palette.common.primary70
                    : globaluser?.isDarkTheme
                    ? muiTheme.palette.common.primary60
                    : muiTheme.palette.common.primary100,
                color: (muiTheme) => muiTheme.palette.common.primary30,
                position: "relative",
                //pt:!isUser && streamedMessage ? "10px" : undefined,
              }}
            >
              <Grid container wrap='nowrap' gap='24px'>
                {/* profile */}
                <Grid item>
                  <Avatar
                    src={
                      isUser
                        ? globaluser?.photo
                          ? globaluser?.photo
                          : "/dev/sample.png"
                        : isNew
                        ? wizardProfile.image
                        : buddyProfile.image
                    }
                    sx={{
                      width: "48px",
                      height: "48px",
                    }}
                  />
                </Grid>
                {/* content */}
                <Grid
                  item
                  sx={{
                    flex: 1,
                    maxWidth: { lg: "88%", md: "85%", xs: "83%" },
                  }}
                >
                  <Grid container direction='column'>
                    {/* name and audio */}
                    <Grid item sx={{ width: "100%" }}>
                      <Grid
                        container
                        alignItems='center'
                        wrap='nowrap'
                        justifyContent='space-between'
                        gap='5px'
                        sx={{ pt: "8px" }}
                      >
                        {/* name and date */}
                        <Grid item>
                          <Grid container alignItems='center' gap={"16px"}>
                            {/* name */}
                            <Grid item>
                              <Typography
                                variant='subtitle2'
                                sx={{
                                  fontWeight: 600,
                                  color: (muiTheme) =>
                                    muiTheme.palette.primary.main,
                                }}
                              >
                                {isUser
                                  ? !globaluser?.email
                                    ? "Anonymous"
                                    : `${
                                        globaluser?.given_name
                                          ? globaluser?.given_name + " "
                                          : ""
                                      }${
                                        globaluser?.family_name
                                          ? globaluser?.family_name
                                          : ""
                                      }`
                                  : isNew
                                  ? wizardProfile.name
                                  : buddyProfile.name}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        {/*copy play audio */}
                        <Grid item>
                          <Grid container alignItems='center' gap='5px'>
                            <Grid item></Grid>
                            {/* play audio */}
                            {!isUser && streamedMessage && (
                              <Grid item>
                                {/* {chat.audio && (
                                  <audio
                                    ref={(element) =>
                                      (chat.ref = element)
                                    }
                                    src={chat.audio}
                                    autoPlay={false}
                                    // controls
                                    style={{
                                      display: "none",
                                    }}
                                  >
                                     <source
                                      src={chat.audio}
                                      type='audio/mpeg'
                                    /> 
                                    Your browser does not support
                                    the audio element.
                                  </audio>
                                )} */}
                                {chat.audio && (
                                  <ReactAudioPlayer
                                    ref={(element) => {
                                      chat.ref = element;
                                    }}
                                    src={chat.audio}
                                    style={{
                                      display: "none",
                                    }}
                                  />
                                )}
                                <Button
                                  variant='contained'
                                  size='small'
                                  disableElevation
                                  sx={{
                                    fontSize: "16px",
                                    fontWeight: 600,

                                    py: 0,
                                    textTransform: "none",
                                    background: "transparent",
                                    color: (muiTheme) =>
                                      muiTheme.palette.common.success20,
                                    border: 0,
                                    "&:hover": {
                                      background: "transparent",
                                      border: 0,
                                    },
                                    "&.Mui-disabled": {
                                      background: "transparent",
                                      color: (muiTheme) =>
                                        muiTheme.palette.common.success20,
                                    },
                                    // padding: 0,
                                  }}
                                  onClick={() => {
                                    if (chat.playing) {
                                      //AUDIO
                                      //chat.ref?.pause();
                                      chat.ref?.audioEl?.current?.pause();
                                      setChats((existingChats) =>
                                        existingChats.map((c, index) => {
                                          if (i === index) {
                                            c.playing = false;
                                          }
                                          return c;
                                        })
                                      );
                                    } else {
                                      if (chat.audio === null) {
                                        textToSpeech(
                                          filteredChat(chat.message),
                                          i
                                        );
                                      } else {
                                        //AUDIO
                                        //chat.ref?.play();
                                        chat.ref?.audioEl?.current?.play();
                                        setChats((existingChats) =>
                                          existingChats.map((c, index) => {
                                            if (i === index) {
                                              c.playing = true;
                                            }
                                            return c;
                                          })
                                        );
                                      }
                                    }
                                  }}
                                  disabled={loading.active}
                                  startIcon={
                                    loading.active &&
                                    loading.action === `audio-${i}` ? (
                                      <CircularProgress
                                        size='1rem'
                                        sx={{
                                          color: (muiTheme) =>
                                            muiTheme.palette.common.success20,
                                        }}
                                      />
                                    ) : chat.playing ? (
                                      <StopIcon />
                                    ) : (
                                      <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='24'
                                        height='24'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                      >
                                        <path
                                          stroke='#B6F09C'
                                          strokeLinecap='round'
                                          strokeWidth='1.5'
                                          d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                                        ></path>
                                        <path
                                          stroke='#B6F09C'
                                          strokeLinecap='round'
                                          strokeWidth='1.5'
                                          d='M10 9.414c0-.89 1.077-1.337 1.707-.707l2.586 2.586a1 1 0 010 1.414l-2.586 2.586c-.63.63-1.707.184-1.707-.707V9.414z'
                                        ></path>
                                      </svg>
                                    )
                                  }
                                >
                                  {chat.playing
                                    ? t("chat.pauseAudio")
                                    : t("chat.playAudio")}
                                </Button>
                              </Grid>
                            )}
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                    {/* markdown */}
                    <Grid item sx={{ width: "100%" }}>
                      <Typography
                        variant='subtitle1'
                        sx={{
                          fontWeight: 500,
                          mt: "12px",
                          mb: isUser ? 0 : "10px",
                          //whiteSpace: "break-spaces",
                          //maxWidth: "100%",
                        }}
                        className='editor'
                      >
                        <ReactMarkdown
                          children={filteredChat(chat.message)}
                          remarkPlugins={[remarkBreaks, remarkMath]}
                          rehypePlugins={[rehypeRaw, rehypeKatex]}
                          components={{
                            pre: Pre,
                            code({
                              node,
                              inline,
                              className,
                              children,
                              ...props
                            }) {
                              const match = /language-(\w+)/.exec(
                                className || ""
                              );
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  {...props}
                                  customStyle={{
                                    borderRadius: "16px",
                                    padding: "16px",
                                  }}
                                  children={String(children)
                                    .replace(/\n$/, "")
                                    // .replace(/&nbsp; \n/g, "")
                                    .replace(
                                      /<span class='chat-cursor'\/>/g,
                                      ""
                                    )}
                                  style={
                                    globaluser?.isDarkTheme
                                      ? a11yDark
                                      : atelierSavannaLight
                                  }
                                  language={match[1]}
                                  PreTag='div'
                                />
                              ) : (
                                <code {...props} className={className}>
                                  {children}
                                </code>
                              );
                            },

                            // p({ node, children, ...props }) {
                            //   if (chats.length === i + 1) {
                            //     console.log(node);
                            //   }
                            //   return (
                            //     <p {...props}>
                            //       {[...children, cursorElement]}
                            //     </p>
                            //   );
                            // },
                          }}
                        />
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CoursePaper>
          </Grid>
        );
      })}
      {/* cursor when streaming not yet started(api just hit to stream stra) */}
      {loading.active && loading.action === "send-start" && (
        <Grid item sx={{ width: "100%", mt: "20px" }}>
          <CoursePaper
            sx={{
              border: (muiTheme) =>
                `1px solid ${
                  globaluser?.isDarkTheme
                    ? muiTheme.palette.common.primary60
                    : muiTheme.palette.common.primary70
                }`,

              background: (muiTheme) =>
                globaluser?.isDarkTheme
                  ? muiTheme.palette.common.primary60
                  : muiTheme.palette.common.primary100,

              color: (muiTheme) => muiTheme.palette.common.primary30,
            }}
          >
            <Grid container wrap='nowrap' alignItems='center' gap='24px'>
              {/* profile */}
              <Grid item>
                <Avatar
                  src={isNew ? wizardProfile.image : buddyProfile.image}
                  sx={{
                    width: "48px",
                    height: "48px",
                  }}
                />
              </Grid>
              <Grid item>
                <span class='chat-cursor' />
              </Grid>
            </Grid>
          </CoursePaper>
        </Grid>
      )}
      {/* when new dialog partner is generated */}
      {loading.active && loading.action === "animation" && (
        <Grid item sx={{ width: "100%", mt: "20px" }}>
          <CoursePaper
            sx={{
              p: "24px",
              border: (muiTheme) =>
                `1px solid ${
                  globaluser?.isDarkTheme
                    ? muiTheme.palette.common.primary60
                    : muiTheme.palette.common.primary70
                }`,

              background: (muiTheme) =>
                globaluser?.isDarkTheme
                  ? muiTheme.palette.common.primary60
                  : muiTheme.palette.common.primary100,

              color: (muiTheme) => muiTheme.palette.common.primary30,
            }}
          >
            <Grid container gap={"24px"} alignItems='center' wrap='nowrap'>
              <Grid item>
                <Loader color={theme.palette.common.primary30} />
              </Grid>
              <Grid item>
                <Typography
                  variant='subtitle2'
                  sx={{
                    fontWeight: 500,
                    // color: (muiTheme) =>
                    //   muiTheme.palette.secondary.main,
                  }}
                >
                  {t("chat.animationText")}
                </Typography>
              </Grid>
            </Grid>
          </CoursePaper>
        </Grid>
      )}

      {/*REST is generated */}
      {loading.active && loading.action === "animation-rest" && (
        <Grid item sx={{ width: "100%", mt: "20px" }}>
          <CoursePaper
            sx={{
              p: "24px",
              border: (muiTheme) =>
                `1px solid ${
                  globaluser?.isDarkTheme
                    ? muiTheme.palette.common.primary60
                    : muiTheme.palette.common.primary70
                }`,

              background: (muiTheme) =>
                globaluser?.isDarkTheme
                  ? muiTheme.palette.common.primary60
                  : muiTheme.palette.common.primary100,

              color: (muiTheme) => muiTheme.palette.common.primary30,
            }}
          >
            <Grid container gap={"24px"} alignItems='center' wrap='nowrap'>
              <Grid item>
                <Loader color={theme.palette.common.primary30} />
              </Grid>
              <Grid item>
                <Typography
                  variant='subtitle2'
                  sx={{
                    fontWeight: 500,
                    // color: (muiTheme) =>
                    //   muiTheme.palette.secondary.main,
                  }}
                >
                  {t("chat.break")}
                </Typography>
              </Grid>
            </Grid>
          </CoursePaper>
        </Grid>
      )}

      {/* //show thinking */}
      {loading.active && loading.action === "page" && (
        <Grid item sx={{ width: "100%", mt: "20px" }}>
          <Grid container spacing={2} alignItems='center'>
            <Grid item>
              <Avatar
                src={isNew ? wizardProfile.image : buddyProfile.image}
                sx={{
                  width: "48px",
                  height: "48px",
                }}
              />
            </Grid>
            <Grid item>
              <Typography
                variant='subtitle1'
                sx={{
                  fontWeight: 500,
                  color: (muiTheme) => muiTheme.palette.primary.main,
                }}
              >
                {t("chat.pageLoading")}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      )}
      {error.status && error.action === "send" && (
        <Alert severity='error' sx={{ mt: "20px" }}>
          {error.message}
        </Alert>
      )}
    </Grid>
  );
};
export default function Index() {
  const { t } = useTranslation();

  const router = useRouter();
  const theme = useTheme();
  const matchesSM = useMediaQuery(theme.breakpoints.down("md"));
  const matches700 = useMediaQuery(theme.breakpoints.down("700"));
  const matches1200 = useMediaQuery(theme.breakpoints.down("1200"));

  const { user: globaluser } = useContext(GlobalContext);

  const bottomRef = useRef(null);
  const headingRef = useRef(null);
  const sendButtonRef = useRef(null);
  const chatContainerRef = useRef(null);
  const audioRef = useRef(null);
  const inpRef = useRef();
  const sideBarWidth = "312px";
  const [showSidebar, setShowSidebar] = useState(true);

  const [loading, setLoading] = useState({
    active: false,
    action: "",
  });
  const [error, setError] = useState({
    status: false,
    message: "",
    action: "",
  });
  const [showToast, setShowToast] = useState({
    active: false,
    message: "",
    severity: "",
  });
  const [isNew, setIsNew] = useState(false);
  const [id, setId] = useState(router.query.id);
  const [langId, setLangId] = useState();
  const [langName, setLangName] = useState();
  const [monacoName, setMonacoName] = useState("");
  const [topic, setTopic] = useState();
  const [goal, setGoal] = useState();
  const [page, setPage] = useState(0);
  const [showEditor, setShowEditor] = useState({
    active: false,
    type: "", //text, code
  });

  const [chats, setChats] = useState([]);
  const [buddyExpireDialog, setBuddyExpireDialog] = useState(false);
  const [messageExpireDialog, setMessageExpireDialog] = useState(false);
  const [upgradeMessageDialog, setUpgradeMessageDialog] = useState({
    active: false,
    error: false,
  });
  const [audioDialog, setAudioDialog] = useState(false);
  const [audioSrc, setAudioSrc] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [buddyProfile, setBuddyProfile] = useState({
    image: "/dev/chatbot.png",
    name: t("chat.buddyName"),
  });
  const [wizardProfile, setWizardProfile] = useState({
    image: "/dev/chatbot.png",
    name: t("chat.wizardName"),
  });
  const [signInDialog, setSignInDialog] = useState(false);

  useEffect(() => {
    setPage(0);
    setId(router.query.id);
  }, [router.query.id]);

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

  const chatHistory = async (newPage, action) => {
    if (!globaluser?.email) {
      router.push("/login");
    }
    if (router.query.id === "new") return;
    try {
      setError({
        status: false,
        message: "",
        action: "",
      });
      setLoading({
        active: true,
        action: action,
      });
      console.log('Chat History Request:', {
        url: `/api/v1/page_wise_chat_history`,
        body: {
          id: router.query.id,
          page_number: newPage,
        },
        headers: {
          authorization: "Bearer " + globaluser.token,
        }
      });
      const result = await axios.post(
        `/api/v1/page_wise_chat_history`,
        {
          id: router.query.id,
          page_number: newPage,
        },
        {
          headers: {
            authorization: "Bearer " + globaluser.token,
          },
        }
      );
      console.log('Chat History Response:', {
        status: result.status,
        data: result.data
      });
      if (result.data) {
        console.log('Setting chat metadata:', {
          topic: result.data.topic,
          goal: result.data.goal,
          monaco_name: result.data.monaco_name,
          lang_id: result.data.lang_id,
          lang_name: result.data.lang_name,
          state: result.data.state
        });
        setTopic(result.data.topic);
        setGoal(result.data.goal);
        setMonacoName(result.data.monaco_name);
        setLangId(result.data.lang_id);
        setLangName(result.data.lang_name);
        console.log('Chat state check:', String(result.data.state) === "0");
        if (String(result.data.state) === "0") {
          console.log('Chat state is 0, setting ID and sending message:', {
            id: router.query.id
          });
          setId(router.query.id);
          console.log('Sending initial message for chat:', router.query.id);
          return sendMessageApi("", "", router.query.id);
        } else {
          let newEn = result.data.page.map((item) => {
            return {
              message: item,
              audio: null,
              playing: false,
              ref: React.createRef(),
            };
          });
          if (action === "page") {
            setChats(newEn);
            setTimeout(() => {
              bottomRef.current?.scrollIntoView();
            }, 300);
          } else {
            setChats((m) => [...newEn, ...m]);
          }
        }
      } else {
        setError({
          status: true,
          message: t("chat.failToLoadHistory"),
          action: "submit",
        });
      }
      setLoading({
        active: false,
        action: "",
      });
      setTimeout(() => {
        inpRef?.current?.focus();
      }, 500);
    } catch (err) {
      setError({
        status: true,
        message: err.response?.data?.message || t("chat.failToLoadHistory"),
        action: "submit",
      });
      setLoading({
        active: false,
        action: "",
      });
    }
  };

  const getCreatedTopic = async () => {
    try {
      setError({
        status: false,
        message: "",
        action: "",
      });

      setLoading({
        active: true,
        action: "animation",
      });

      let body;
      let url = "";
      if (!globaluser?.email) {
        url = "Get_created_topic_public";
        body = JSON.stringify({
          id: id,
        });
      } else {
        url = "Get_created_topic";
        body = JSON.stringify({
          user_input: "",
          topic: "",
        });
      }

      const result = await axios.post(`/api/v1/${url}`, body, {
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + globaluser?.token,
        },
      });
      if (result.data) {
        let newTopic = result.data.Topic;
        let newGoal = result.data.Goal;
        let newId = result.data.id;
        setTopic(newTopic);
        setGoal(newGoal);
        setLangId(result.data.lang_id);
        setLangName(result.data.lang_name);
        setMonacoName(result.data.monaco_name);
        setId(newId);
        setChats([]);
        setConversations((c) => [
          {
            id: newId,
            topic: newTopic,
            goal: newGoal,
            icon: result.data.icon,
            lang_id: result.data.lang_id,
            lang_name: result.data.lang_name,
            monaco_name: result.data.monaco_name,
          },
          ...c,
        ]);
        router.push(`/chat/${newId}`);
        // getBuddyProfile();
        //return sendMessageApi("", "", newId);
      } else {
        setError({
          status: true,
          message: t("chat.failToLoadCreatedTopic"),
          action: "submit",
        });
      }
      setLoading({
        active: false,
        action: "",
      });
    } catch (err) {
      console.log(err);
      setError({
        status: true,
        message:
          err.response?.data?.message || t("chat.failToLoadCreatedTopic"),
        action: "submit",
      });
      setLoading({
        active: false,
        action: "",
      });
    }
  };
  const sendMessageApi = async (user_input, messageType, newId) => {
    console.log('sendMessageApi called with:', {
      user_input,
      messageType,
      newId
    });

    setError({
      status: false,
      message: "",
      action: "",
    });
    console.log('Error state reset');

    try {
      setLoading({
        active: true,
        action: "send-start",
      });
      console.log('Loading state set to active');

      if (matchesSM) {
        setShowEditor({
          active: false,
          type: "",
        });
        console.log('ShowEditor state updated for mobile');
      }

      let body;
      let url = "";
      if (messageType === "first") {
        if (!globaluser?.email) {
          url = "Conv_first_massage_public";
          body = JSON.stringify({
            id: id,
          });
          console.log('First message - public user flow');
        } else {
          url = "Conv_first_massage";
          console.log('First message - authenticated user flow');
        }
      } else if (messageType === "next") {
        if (!globaluser?.email) {
          url = "Conv_next_massage_public";
          body = JSON.stringify({
            user_input: user_input,
            id: id,
          });
          console.log('Next message - public user flow');
        } else {
          url = "Conv_next_massage";
          body = JSON.stringify({
            user_input: user_input,
          });
          console.log('Next message - authenticated user flow');
        }
      } else {
        if (!globaluser?.email) {
          body = JSON.stringify({
            user_input: user_input,
            id: newId ? newId : id,
          });
          url = "get_response_stream_public";
          console.log('Stream message - public user flow');
        } else {
          body = JSON.stringify({
            user_input: user_input,
            id: newId ? newId : id,
          });
          url = "get_response_stream";
          console.log('Stream message - authenticated user flow');
        }
      }
      const response = await fetch(`${publicRuntimeConfig.REACT_APP_API_URL}/api/v1/${url}?email=${globaluser?.email || ''}`, {
        method: "POST",
        body: body,
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + globaluser?.token,
        },
      });
      const reader = response.body.getReader();
      let first = false;

      let doneTokenRecieved = false;
      let restTokenRecieved = false;

      while (true) {
        const { done, value } = await reader.read();
        const text = new TextDecoder().decode(value);
        try {
          let res = JSON.parse(text);
          if (res && res.subscriptionError) {
            if (messageType === "first" || messageType === "next") {
              setBuddyExpireDialog(true);
            } else {
              setMessageExpireDialog(true);
            }
            setLoading({
              active: false,
              action: "",
            });
            return;
          }
          if (res && res.SigninError) {
            setSignInDialog(true);

            setLoading({
              active: false,
              action: "",
            });
            return;
          }
        } catch (er) {}
        let codeDiv = `<span class='chat-cursor'/>`;
        let updated =
          text?.replace(/data:/g, "")?.replace(/data: /g, "") + codeDiv;
        //?.replace(/\s+/g, " ");
        //?.replace(/\n/g, "<br>")
        //.trim();

        if (done) {
          console.log(doneTokenRecieved, "isNew");
          if (doneTokenRecieved) {
            setIsNew(false);
            getCreatedTopic();
          } else {
            if (restTokenRecieved) {
            } else {
              setChats((d) => {
                let existingChats = [...d];
                let existingChatsObj = existingChats[existingChats.length - 1];
                let newValue = existingChatsObj?.message.replace(
                  /<span class='chat-cursor'\/>/g,
                  ""
                );
                existingChatsObj.message = newValue;
                //console.log(newValue);
                existingChats[existingChats.length - 1] = existingChatsObj;
                return existingChats;
              });
            }
            //console.log(chats, "Done");
            setLoading({
              active: false,
              action: "",
            });
            setTimeout(() => {
              inpRef?.current?.focus();
            }, 1000);
          }
          // chatContainer.removeEventListener("scroll", handleScrollDocument);

          break;
        }
        if (isNew && text?.endsWith("[DONE]")) {
          console.log("DONE RECIEVED");
          doneTokenRecieved = true;
          //removing chat-cursor
          setChats((d) => {
            let existingChats = [...d];
            let existingChatsObj = existingChats[existingChats.length - 1];
            let newValue = existingChatsObj?.message.replace(
              /<span class='chat-cursor'\/>/g,
              ""
            );
            existingChatsObj.message = newValue;
            existingChats[existingChats.length - 1] = existingChatsObj;
            return existingChats;
          });

          setLoading({
            active: true,
            action: "animation",
          });
          //bottomRef.current?.scrollIntoView();
        } else {
          if (!isNew && text?.endsWith("[REST]")) {
            console.log("REST RECIEVED");
            restTokenRecieved = true;
            //removing chat-cursor
            setChats((d) => {
              let existingChats = [...d];
              let existingChatsObj = existingChats[existingChats.length - 1];
              let newValue = existingChatsObj?.message.replace(
                /<span class='chat-cursor'\/>/g,
                ""
              );
              existingChatsObj.message = newValue;
              existingChats[existingChats.length - 1] = existingChatsObj;
              return existingChats;
            });

            setLoading({
              active: true,
              action: "animation-rest",
            });
          } else {
            if (!first) {
              //add new entry
              setLoading({
                active: true,
                action: "send",
              });
              setChats((d) => [
                ...d,
                {
                  message: updated,
                  audio: null,
                  playing: false,
                  ref: React.createRef(),
                },
              ]);

              first = true;
            } else {
              //update last one
              setChats((d) => {
                let existingChats = [...d];
                let existingChatsObj = existingChats[existingChats.length - 1];
                let newValue = `${existingChatsObj.message?.replace(
                  /<span class='chat-cursor'\/>/g,
                  ""
                )}${updated}`;
                existingChatsObj.message = newValue;
                existingChats[existingChats.length - 1] = existingChatsObj;
                return existingChats;
              });
              // console.log(scrollStatus);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching new chat:", error);

      setLoading({
        active: false,
        action: "",
      });
      setError({
        status: true,
        message: t("chat.newChatFailed"),
        action: "send",
      });
    }
  };
  useEffect(() => {
    if (router.query.id) {
      if (router.query.id === "new") {
        if (!globaluser?.email) {
          router.push("/login");
        }
        setIsNew(true);
        sendMessageApi("", "first");
        getWizardProfile();
      } else {
        const newConversationQuery = router.query.new;
        if (!globaluser?.email) {
          if (newConversationQuery) {
            setIsNew(true);
            sendMessageApi("", "first");
            getWizardProfile();
          } else {
            setIsNew(false);
            sendMessageApi("", "");
            getBuddyProfile();
          }

          //convFirstMessagePublic();
          // getBuddyProfile();
        } else {
          setIsNew(false);
          chatHistory(0, "page");
          getBuddyProfile();
        }
      }
    } else {
      router.push("/chat/new");
    }
  }, [router.query.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendChatHandler = (inputValue) => {
    setChats((c) => [
      ...c,
      {
        message: "user: " + inputValue,
        audio: null,
        playing: false,
        ref: React.createRef(),
      },
    ]);
    if (isNew) {
      sendMessageApi(inputValue, "next");
    } else {
      sendMessageApi(inputValue, "", "");
    }
  };

  const textToSpeech = async (text, index) => {
    setError({
      status: false,
      message: "",
      action: "",
    });
    try {
      setLoading({
        active: true,
        action: `audio-${index}`,
      });
      const result = await axios.post(
        `/v1/TTS`,
        {
          text,
        },
        {
          headers: {
            authorization: "Bearer " + globaluser.token,
          },
          responseType: "blob",
        }
      );

      if (result.status === 200) {
        const blob = new Blob([result.data], { type: "audio/mpeg" });

        // Create a URL for the Blob
        const objectUrl = URL.createObjectURL(blob);

        // Set the audio source and play
        setChats((existingChats) =>
          existingChats.map((c, i) => {
            if (i === index) {
              c.audio = objectUrl;
              c.playing = true;
            } else {
              c.playing = false;
            }
            return c;
          })
        );

        setTimeout(() => {
          //AUDIO
          // chats[index]?.ref?.play();
          let chatEle = chats[index];
          chatEle?.ref?.audioEl?.current?.play();
          chatEle?.ref?.audioEl?.current?.pause();
          chatEle?.ref?.audioEl?.current?.play();
        }, 950);
      } else {
        setShowToast({
          active: true,
          message: result.data.error || t("chat.textToSpeechFailed"),
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
        message: err.response?.data?.message || t("chat.textToSpeechFailed"),

        severity: "error",
      });

      setLoading({
        active: false,
        action: "",
      });
    }
  };
  const onTextEditorClick = async () => {
    try {
      const result = await axios.post(
        `/api/v1/text_editor`,
        {
          id: id,
        },
        {
          headers: {
            authorization: "Bearer " + globaluser.token,
          },
        }
      );
    } catch (err) {}
  };

  const getWizardProfile = async () => {
    let url = "wizard_details";
    if (!globaluser?.email) {
      url = "wizard_details_public";
    }
    try {
      const result = await axios.get(
        `/api/v1/${url}`,

        {
          headers: {
            authorization: "Bearer " + globaluser?.token,
          },
        }
      );
      if (result.data) {
        setWizardProfile(result.data);
      }
    } catch (err) {}
  };
  const getBuddyProfile = async () => {
    let url = "buddy_details";
    if (!globaluser?.email) {
      url = "buddy_details_public";
    }
    try {
      const result = await axios.get(
        `/api/v1/${url}`,

        {
          headers: {
            authorization: "Bearer " + globaluser?.token,
          },
        }
      );
      if (result.data) {
        setBuddyProfile(result.data);
      }
    } catch (err) {}
  };
  const renderTextEditorDialog = (
    <Dialog
      open={showEditor.active && showEditor.type === "text"}
      fullScreen
      fullWidth
      onClose={() => {
        setShowEditor({
          active: false,
          type: "",
        });
      }}
    >
      <DialogContent sx={{}}>
        <TextEditor
          id={id}
          onSend={sendChatHandler}
          disabled={loading.active}
          onClose={() => {
            setShowEditor({
              active: false,
              type: "",
            });
          }}
        />
      </DialogContent>
    </Dialog>
  );
  const renderCodeEditorDialog = (
    <Dialog
      open={showEditor.active && showEditor.type === "code"}
      fullScreen
      fullWidth
      onClose={() => {
        setShowEditor({
          active: false,
          type: "",
        });
      }}
    >
      <DialogContent
        sx={{
          color: (muiTheme) => muiTheme.palette.common.white,
          maxHeight: "100vh",
          maxWidth: "100vw",
          p: "8px",
        }}
      >
        <CodeEditor
          id={id}
          onSend={sendChatHandler}
          disabled={loading.active}
          langId={langId}
          langName={langName}
          monacoName={monacoName}
          onClose={() => {
            setShowEditor({
              active: false,
              type: "",
            });
          }}
        />
      </DialogContent>
    </Dialog>
  );

  const renderAudioDialog = (
    <Dialog
      open={audioDialog}
      fullWidth
      onClose={() => {
        setAudioDialog(false);
        setAudioSrc(null);
      }}
      maxWidth='md'
      sx={{
        "& .MuiPaper-root": {
          background:
            audioSrc !== null
              ? "transparent"
              : (muiTheme) => muiTheme.palette.common.main100,
          color: (muiTheme) => muiTheme.palette.common.white,
          borderRadius: "14px",
          p: 0,
        },
        "& .MuiBackdrop-root": {
          background: "#111A22",
          opacity: "0.8 !important",
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 0, right: "6px" }}>
          <IconButton
            aria-label='close'
            disableRipple
            onClick={() => {
              setAudioDialog(false);
              setAudioSrc(null);
            }}
            sx={{
              zIndex: 5,
              p: 0,
              background: (muiTheme) => muiTheme.palette.secondary.main,
              boxShadow: "none",
              color: (muiTheme) => muiTheme.palette.common.main100,
            }}
          >
            <CloseIcon />
          </IconButton>
        </div>
        {error.status && error.action === "textToSpeech" && (
          <Grid item sx={{ p: "1em" }}>
            <Typography
              variant='subtitle2'
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: (theme) => theme.palette.secondary.main,
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
        {loading.active && loading.action === "textToSpeech" && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "20vh",
            }}
          >
            <CircularProgress
              sx={{ color: (theme) => theme.palette.secondary.main }}
            />
          </div>
        )}
        {audioSrc !== null && (
          <audio
            ref={audioRef}
            autoPlay
            controls
            style={{
              background: "#111A22",
              color: "#fff",
              width: "100%",
              borderRadius: 0,
              marginTop: "35px",
            }}
          >
            <source src={audioSrc} type='audio/mpeg' />
            Your browser does not support the audio element.
          </audio>
        )}
      </DialogContent>
    </Dialog>
  );

  const renderSignInDialog = (
    <Dialog
      open={signInDialog}
      onClose={() => {
        setSignInDialog(false);
      }}
      maxWidth='md'
      sx={{
        "& .MuiPaper-root": {
          borderRadius: "14px",
          p: 0,
        },
        "& .MuiBackdrop-root": {
          background: "#111A22",
          opacity: "0.8 !important",
        },
      }}
    >
      <DialogContent
        sx={{
          px: "30px",
          position: "relative",
        }}
      >
        <Grid container direction='column'>
          <Grid item>
            <Typography
              variant='subtitle1'
              align='center'
              style={{
                color: "#1A1A1A",
                fontWeight: 600,
                whiteSpace: "break-spaces",
              }}
            >
              {t("chat.signIn")}
            </Typography>
            <div style={{ height: "24px" }} />
            <GoogleLoginComponent chatId={!isNew ? id : undefined} />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
  const paddingContainer = {
    paddingLeft: "15px",
    paddingRight: "15px",
  };

  const mainWidth = showEditor.active
    ? "100%"
    : {
        xl: "60%",
        lg: matches1200 && !isNew ? "90%" : "70%",
        md: "80%",
        sm: "85%",
        xs: "100%",
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
      wrap='nowrap'
      //alignItems='center'
      sx={{
        height: "100%",
        minHeight: "100vh",
        maxHeight: "100vh",
        overflow: "hidden",
        maxWidth: "100vw",

        // minHeight: "100vh",
        backgroundColor: (muiTheme) => muiTheme.palette.common.primary70,
        color: (muiTheme) => muiTheme.palette.primary.main,
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
      {renderAudioDialog}
      {renderSignInDialog}
      <PlanDialog
        open={buddyExpireDialog}
        setOpen={setBuddyExpireDialog}
        error={true}
        errorMessage={t("chat.freeBuddyComplete")}
        url={`/chat/${isNew ? "new" : id}`}
      />
      <PlanDialog
        open={messageExpireDialog}
        setOpen={setMessageExpireDialog}
        error={true}
        errorMessage={t("chat.freeMessageComplete")}
        url={`/chat/${isNew ? "new" : id}`}
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
              ? t("chat.subcriptionError")
              : t("chat.subcriptionSuccess")
          }
        />
      )}
      {/* Sidebar */}
      <Grid
        item
        sx={{
          height: "100%",
          width: showSidebar ? `calc(${sideBarWidth} + 14px)` : 0,
          //position: "relative",
        }}
      >
        {/* <div
          style={{
            position: "absolute",
            bottom: 20,
            left: showSidebar ? "15px" : "-20px",
          }}
        >
          <IconButton
            sx={{
              p: 0,
              background: (muiTheme) => muiTheme.palette.primary.main,
              borderRadius: "50%",
              // boxShadow: "2px 2px 8px 0px rgba(0, 0, 0, 0.10)",
              zIndex: 1300,
              width: "30px",
              height: "30px",
            }}
            disableRipple
            onClick={() => setShowSidebar((s) => !s)}
          >
            {showSidebar ? (
              <ChevronLeftIcon
                fontSize='small'
                sx={{ fill: (muiTheme) => muiTheme.palette.secondary.main }}
              />
            ) : (
              <ChevronRightIcon
                fontSize='small'
                sx={{ fill: (muiTheme) => muiTheme.palette.secondary.main }}
              />
            )}
          </IconButton>
        </div> */}
        <SideBar
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          sideBarWidth={sideBarWidth}
          disabled={loading.active}
          isNew={isNew}
          id={id}
          conversations={conversations}
          setConversations={setConversations}
          onNewBuddyClick={() => {
            if (isNew) {
              return;
            }
            setChats([]);
            router.push(`/chat/new`);
          }}
          onConversationClick={(conId) => {
            if (conId !== router.query.id) {
              setChats([]);
            }
            router.push(`/chat/${conId}`);
          }}
        />
      </Grid>
      <Grid
        item
        sx={{
          flex: 1,
          height: "100%",

          maxWidth: showSidebar
            ? `calc(100vw - ${sideBarWidth} - 14px)`
            : "100%",
        }}
      >
        {/* chat and editors */}
        <Grid container wrap='nowrap' sx={{ height: "100%" }}>
          {/* header chats input */}
          <Grid
            item
            sx={{
              height: "100%",
              pt: "12px",
              width: showEditor.active ? { md: "50%", xs: "100%" } : "100%",
            }}
          >
            <Grid container direction='column' sx={{ height: "100%" }}>
              {/* heading */}
              <Grid item sx={{ width: "100%", ...paddingContainer }}>
                <div ref={headingRef}>
                  <Grid
                    item
                    sx={{
                      width: "100%",
                      p: "8px 15px",
                      //boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                      backgroundColor: (muiTheme) =>
                        globaluser?.isDarkTheme
                          ? muiTheme.palette.common.primary80
                          : muiTheme.palette.common.primary100,
                      color: (muiTheme) =>
                        globaluser?.isDarkTheme
                          ? muiTheme.palette.common.primary0
                          : muiTheme.palette.common.primary10,
                      position: "relative",
                      minHeight: "56px",
                      borderRadius: "20px",
                    }}
                  >
                    {/* <Link href='/' style={{ textDecoration: "none" }}>
                  {matches700 ? (
                    <IconButton
                      sx={{
                        position: "absolute",
                        left: "10px",
                        top: "15px",
                        p: 0,
                        background: (muiTheme) => muiTheme.palette.common.white,
                        borderRadius: "50%",
                        boxShadow: "2px 2px 8px 0px rgba(0, 0, 0, 0.10)",
                        zIndex: 1300,
                        width: "30px",
                        height: "30px",
                      }}
                      disableRipple
                    >
                      <ChevronLeftIcon fontSize='small' />
                    </IconButton>
                  ) : (
                    <Button
                      variant='outlined'
                      sx={{
                        position: "absolute",
                        left: "4px",
                        top: "4px",

                        fontSize: "20px",
                        fontWeight: 400,
                        borderColor: "#fff",
                        color: "#fff",
                        textTransform: "none",
                        borderRadius: "7px",
                        px: "55px",
                        "&:hover": {
                          borderColor: "#fff",
                        },
                      }}
                    >
                      List of Buddies
                    </Button>
                  )}
                </Link> */}
                    <Typography
                      variant='h5'
                      align='center'
                      sx={{ fontWeight: 700, fontSize: "20px" }}
                    >
                      {loading.active && loading.action === "page"
                        ? t("chat.headerTitleLoading")
                        : isNew
                        ? t("chat.wizardHeaderTitle")
                        : topic &&
                          `${topic[0].toUpperCase()}${topic.substring(1)}`}
                    </Typography>
                    <Typography
                      variant='body2'
                      align='center'
                      sx={{
                        color: (muiTheme) => muiTheme.palette.common.primary30,
                      }}
                    >
                      {loading.active && loading.action === "page"
                        ? t("chat.headerGoalLoading")
                        : isNew
                        ? t("chat.wizardGoal")
                        : goal &&
                          `${goal[0].toUpperCase()}${goal.substring(1)}`}
                    </Typography>
                  </Grid>
                  {/* divider */}
                  {/* <Grid
                  item
                  sx={{
                    width: "100%",
                    mt: "13px",

                    borderTop: "1px solid rgba(0, 0, 0, 0.47)",
                  }}
                /> */}
                </div>
              </Grid>

              <ScrollToBottom
                className='parent'
                followButtonClassName='parent-follow-button'
              >
                <Messages
                  page={page}
                  error={error}
                  loading={loading}
                  paddingContainer={paddingContainer}
                  mainWidth={mainWidth}
                  showEditor={showEditor}
                  isNew={isNew}
                  langId={langId}
                  setShowSidebar={setShowSidebar}
                  setShowEditor={setShowEditor}
                  onTextEditorClick={onTextEditorClick}
                  chats={chats}
                  wizardProfile={wizardProfile}
                  buddyProfile={buddyProfile}
                  setChats={setChats}
                  textToSpeech={textToSpeech}
                  fetchMoreRecords={async (newPage) => {
                    setPage(newPage);
                    await chatHistory(newPage, "pagination");
                  }}
                />

                <div ref={bottomRef} />
              </ScrollToBottom>

              <Grid item sx={{ width: "100%" }}>
                {/* send */}
                <Grid container justifyContent='center'>
                  <Box ref={sendButtonRef} sx={{ width: mainWidth }}>
                    <Grid
                      item
                      sx={{
                        ...paddingContainer,
                        width: "100%",
                        mt: { md: "32px", sm: "26px", xs: "16px" },
                        mb: "16px",
                      }}
                    >
                      <SendText
                        id={id}
                        ref={inpRef}
                        onSuccess={sendChatHandler}
                        showEditor={(type) => {
                          setShowEditor({
                            active: true,
                            type: type,
                          });
                        }}
                        isNew={isNew}
                        langId={
                          loading.active && loading.action === "page"
                            ? "-1"
                            : langId
                        }
                        disabled={loading.active}
                      />
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          {/* editor */}
          {matches1200 && !isNew && renderTextEditorDialog}
          {matches1200 && !isNew && renderCodeEditorDialog}
          {showEditor.active && !isNew && !matches1200 && (
            <Grid
              item
              display='flex'
              sx={{
                //  ...paddingContainer,
                pl: 0,
                //   pt: "20px",
                width: { md: "50%", xs: 0 },
              }}
            >
              {showEditor.type === "code" ? (
                <CodeEditor
                  id={id}
                  onSend={sendChatHandler}
                  disabled={loading.active}
                  langId={langId}
                  langName={langName}
                  monacoName={monacoName}
                  onClose={() => {
                    setShowSidebar(true);
                    setShowEditor({
                      active: false,
                      type: "",
                    });
                  }}
                />
              ) : (
                <TextEditor
                  id={id}
                  onSend={sendChatHandler}
                  disabled={loading.active}
                  onClose={() => {
                    setShowSidebar(true);
                    setShowEditor({
                      active: false,
                      type: "",
                    });
                  }}
                />
              )}
            </Grid>
          )}
        </Grid>
      </Grid>

      <style>{`
      html, body, #__next{
        height: 100%;
      }
      .editor{
     
        white-space: break-spaces;
      }
     .editor ul,ol {
      margin-block-start:0;
      margin-block-end: 0;
      padding-left: 18px;
      display: flex;
      flex-direction: column;
      gap: 14px;
     }
     
      .editor pre{
        margin:0;
      }
      .editor pre code{
      white-space: break-spaces;
      }
      .editor p{
        margin-block-start:0;
        margin-block-end: 0;
      }
      
      .chat-cursor {
        display: inline-block;
        width: 5px;
        height: 18px;
        background-color: ${theme.palette.common.primary30};
        animation: blink 1s infinite;
        margin-left: 6px; /* Adjust the spacing between the cursor and text as needed */
        margin-bottom: -2px;
      }
      .parent{
        display: flex;
        flex-direction: column;
        flex: 1;
        width: 100%;        
        overflow-y: auto;
        overflow-x: hidden;
        max-height: 100%;
        max-width: 100%;
        // max-height: calc(100vh - ${headingRef?.current?.clientHeight}px - ${sendButtonRef?.current?.clientHeight}px);
      }
      .parent-follow-button{
        background-image: url(/dev/down-arrow.png);
        background-size: contain;
      }
      .parent > div{
        overflow-x: hidden;
      }
      @keyframes blink {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0;
        }
      }
      /* width */
      ::-webkit-scrollbar {
        width: 8px;
        height: 6px;
      }
    
      /* Track */
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      
      /* Handle */
      ::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 10px;
      }
      
      /* Handle on hover */
      ::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
      
      
      `}</style>
    </Grid>
  );
}
