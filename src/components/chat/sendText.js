import React, { useState, useContext, useRef, useEffect } from "react";
import {
  Button,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Menu,
  MenuItem,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import StopIcon from "@mui/icons-material/Stop";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import { GlobalContext } from "../../context/GlobalContext";
import axios from "../../utils/axios";
import { useTranslation } from "react-i18next";
const SendText = React.forwardRef((props, inpRef) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const matchesSM = useMediaQuery(theme.breakpoints.down("md"));

  const { user: globaluser } = useContext(GlobalContext);

  const [inputValue, setInputValue] = useState("");
  // const [plusMenu, setPlusMenu] = useState(null);
  const {
    transcript,
    interimTranscript,
    listening,

    browserSupportsSpeechRecognition,
    resetTranscript,
  } = useSpeechRecognition({ clearTranscriptOnListen: true });
  const [listeningChat, setListeningChat] = useState(false);
  const [oldChatValue, setOldChatValue] = useState(""); //this is created to save old value when voice recording start to break line

  const onTextEditorClick = async () => {
    try {
      const result = await axios.post(
        `/api/v1/text_editor`,
        {
          id: props.id,
        },
        {
          headers: {
            authorization: "Bearer " + globaluser.token,
          },
        }
      );
    } catch (err) {}
  };

  // const plusMenuID = "profile-menu";
  // const renderPlusMenu = (
  //   <Menu
  //     id={plusMenuID}
  //     anchorEl={plusMenu}
  //     anchorOrigin={{
  //       vertical: "top",
  //       horizontal: "center",
  //     }}
  //     keepMounted
  //     transformOrigin={{
  //       vertical: "bottom",
  //       horizontal: "center",
  //     }}
  //     open={Boolean(plusMenu)}
  //     onClose={() => setPlusMenu(null)}
  //     sx={{
  //       "& .MuiPaper-root": {
  //         ml: "-4px",
  //         mt: "-14px",
  //         borderRadius: "7px",
  //         minWidth: "190px",
  //         py: "10px",
  //         background: (muiTheme) => muiTheme.palette.common.main100,
  //         color: (muiTheme) => muiTheme.palette.common.white,
  //       },
  //     }}
  //   >
  //     {props.langId !== "-1" && (
  //       <MenuItem
  //         onClick={() => {
  //           setPlusMenu(null);
  //           props.showEditor("code");
  //         }}
  //         sx={{
  //           px: "15px",
  //           width: "100%",
  //           display: "flex",
  //           alignItems: "flex-start",
  //           gap: "10px",
  //         }}
  //       >
  //         <img src='/dev/code-editor.svg' style={{ marginLeft: "-4px" }} />
  //         <Typography
  //           variant='h6'
  //           sx={{
  //             mt: "3px",
  //             fontWeight: 400,
  //             // fontFamily: (muiTheme) => muiTheme.typography.secondaryFont,
  //           }}
  //         >
  //           Code Editor
  //         </Typography>
  //       </MenuItem>
  //     )}
  //     <MenuItem
  //       onClick={() => {
  //         setPlusMenu(null);
  //         props.showEditor("text");
  //         onTextEditorClick();
  //       }}
  //       sx={{
  //         px: "15px",
  //         mt: "4px",
  //         width: "100%",
  //         display: "flex",
  //         alignItems: "flex-start",
  //         gap: "10px",
  //       }}
  //     >
  //       <img src='/dev/text-editor.svg' />
  //       <Typography
  //         variant='h6'
  //         sx={{
  //           mt: "3px",
  //           fontWeight: 400,
  //           ml: "7px",
  //           //fontFamily: (muiTheme) => muiTheme.typography.secondaryFont,
  //         }}
  //       >
  //         Text Editor
  //       </Typography>
  //     </MenuItem>
  //   </Menu>
  // );
  const onSubmit = () => {
    //send message to server
    if (listeningChat) {
      handleStopRecording();
    }
    props.onSuccess(inputValue);
    setInputValue("");
  };
  const handleStartRecording = () => {
    setOldChatValue(inputValue ? `${inputValue}\n` : "");
    SpeechRecognition.startListening({ continuous: true });
    setListeningChat(true);
  };

  useEffect(() => {
    if (transcript && listeningChat) {
      setInputValue(`${oldChatValue}${transcript}`);
      if (inpRef.current) {
        inpRef.current.focus();
        inpRef.current.scrollTop = inpRef.current.scrollHeight;
      }
    }
  }, [interimTranscript]);
  const handleStopRecording = () => {
    // if (transcript) {
    //   setInputValue(`${oldChatValue}\n${transcript}`);
    // }
    inpRef.current.focus();
    setListeningChat(false);
    const recognition = SpeechRecognition.getRecognition();
    if (recognition) {
      recognition.continuous = false;
    }
    resetTranscript();
    SpeechRecognition.stopListening();
    setOldChatValue("");
  };

  return (
    <Grid container style={{ gap: "12px" }}>
      <Grid item style={{ flex: "1", minWidth: 0, display: "flex" }}>
        {/* {renderPlusMenu} */}
        <TextField
          fullWidth
          //ref={inpRef}
          placeholder={
            listening && listeningChat
              ? t("chat.send.listening")
              : t("chat.send.placeholder")
          }
          multiline
          minRows={1}
          maxRows={2}
          variant='outlined'
          sx={{
            "& .MuiOutlinedInput-input": {
              color: (muiTheme) =>
                globaluser?.isDarkTheme
                  ? muiTheme.palette.common.primary10
                  : muiTheme.palette.common.primary50,
              "::placeholder": {
                opacity: globaluser?.isDarkTheme ? 0.4 : 0.6,
              },
            },
            "& .MuiInputBase-input.Mui-disabled": {
              opacity: 0.3,
              WebkitTextFillColor: (muiTheme) =>
                globaluser?.isDarkTheme
                  ? muiTheme.palette.common.primary10
                  : muiTheme.palette.common.primary50,
            },

            "&.MuiTextField-root": {
              borderRadius: "20px",
              boxShadow: "none",
              backgroundColor: (muiTheme) =>
                globaluser?.isDarkTheme
                  ? muiTheme.palette.common.primary80
                  : muiTheme.palette.common.primary100,
              p: "8px",
            },
            "& fieldset": {
              border: "none",
            },
          }}
          disabled={props.disabled}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) {
              e.preventDefault();
              setInputValue((v) => v + "\n");
            } else if (e.key === "Enter") {
              e.preventDefault();
              onSubmit();
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                {/* mic SpeechRecognition */}
                {browserSupportsSpeechRecognition && (
                  <IconButton
                    disableTouchRipple
                    disableRipple
                    sx={{
                      background: "transparent",
                      pr: "12px",
                      // padding: 0,
                    }}
                    onClick={
                      listening && listeningChat
                        ? handleStopRecording
                        : handleStartRecording
                    }
                    disabled={props.disabled}

                    //disabled={!isMicrophoneAvailable}
                  >
                    {listening && listeningChat ? (
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='20'
                        height='20'
                        fill='none'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fill={theme.palette.common.primary40}
                          d='M6 14h8V6H6v8zm4 6a9.738 9.738 0 01-3.9-.788 10.099 10.099 0 01-3.175-2.137c-.9-.9-1.612-1.958-2.137-3.175A9.738 9.738 0 010 10c0-1.383.263-2.683.787-3.9a10.099 10.099 0 012.138-3.175c.9-.9 1.958-1.612 3.175-2.137A9.738 9.738 0 0110 0c1.383 0 2.683.263 3.9.787a10.098 10.098 0 013.175 2.138c.9.9 1.613 1.958 2.137 3.175A9.738 9.738 0 0120 10a9.738 9.738 0 01-.788 3.9 10.098 10.098 0 01-2.137 3.175c-.9.9-1.958 1.613-3.175 2.137A9.738 9.738 0 0110 20zm0-2c2.233 0 4.125-.775 5.675-2.325C17.225 14.125 18 12.233 18 10c0-2.233-.775-4.125-2.325-5.675C14.125 2.775 12.233 2 10 2c-2.233 0-4.125.775-5.675 2.325C2.775 5.875 2 7.767 2 10c0 2.233.775 4.125 2.325 5.675C5.875 17.225 7.767 18 10 18z'
                        ></path>
                      </svg>
                    ) : (
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <path
                          stroke={theme.palette.common.primary40}
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='1.5'
                          d='M6 10v1a6 6 0 006 6m6-7v1a6 6 0 01-6 6m0 0v4m0 0h4m-4 0H8m4-7a3 3 0 01-3-3V6a3 3 0 116 0v5a3 3 0 01-3 3z'
                        ></path>
                      </svg>
                    )}
                  </IconButton>
                )}
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position='end'>
                <Grid container wrap='nowrap' gap={"9px"}>
                  {/* plus icon */}
                  {/* {props.isNew === false && !matchesSM && (
                    <IconButton
                      disableTouchRipple
                      disableRipple
                      sx={{ background: "transparent", padding: 0 }}
                      aria-owns={plusMenu ? plusMenuID : undefined}
                      aria-haspopup={plusMenu ? true : false}
                      onClick={(e) => setPlusMenu(e.currentTarget)}
                    >
                      <AddCircleIcon
                        sx={{
                          fontSize: "2.35rem",
                          color: "#CBCBCB",
                        }}
                      />
                    </IconButton>
                  )} */}
                  {/* send */}
                  <IconButton
                    disableTouchRipple
                    disableRipple
                    sx={{ background: "transparent" }}
                    onClick={onSubmit}
                    disabled={props.disabled}
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='48'
                      height='48'
                      fill='none'
                      viewBox='0 0 48 48'
                    >
                      <rect
                        width='48'
                        height='48'
                        fill={
                          globaluser?.isDarkTheme
                            ? theme.palette.common.primary60
                            : theme.palette.common.success20
                        }
                        rx='12'
                      ></rect>
                      <path
                        stroke={
                          globaluser?.isDarkTheme
                            ? theme.palette.common.primary20
                            : theme.palette.common.primary0
                        }
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='1.5'
                        d='M21.73 26.27l9.504-9.504m-13.747 3.232l11.648-3.883c1.7-.566 3.316 1.05 2.75 2.75l-3.883 11.648c-.612 1.838-3.14 2.017-4.007.285l-1.94-3.88a2.173 2.173 0 00-.972-.973l-3.881-1.94c-1.732-.866-1.553-3.395.285-4.007z'
                      ></path>
                    </svg>
                  </IconButton>
                </Grid>
              </InputAdornment>
            ),
          }}
          inputRef={inpRef}
        />
      </Grid>
    </Grid>
  );
});

export default SendText;
