import {
  Grid,
  IconButton,
  TextField,
  Button,
  InputAdornment,
  Typography,
} from "@mui/material";
import React, { useRef, useState, useEffect, useContext } from "react";
import CloseIcon from "@mui/icons-material/Close";
import StopIcon from "@mui/icons-material/Stop";

import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { GlobalContext } from "../../context/GlobalContext";
import { useTheme } from "@emotion/react";
import { useTranslation } from "react-i18next";

export default function TextEditor({ disabled, onClose, onSend }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const inputRef = useRef(null);
  const inpRef = useRef();
  const { user: globaluser } = useContext(GlobalContext);

  const {
    transcript,
    interimTranscript,
    listening,
    browserSupportsSpeechRecognition,
    resetTranscript,
  } = useSpeechRecognition();
  const [listeningEditor, setListeningEditor] = useState(false);

  const [inputHeight, setInputHeight] = useState(0);
  const [value, setValue] = useState("");
  const [oldChatValue, setOldChatValue] = useState(""); //this is created to save old value when voice recording start to break line

  useEffect(() => {
    if (inputRef.current) {
      const calculatedInputHeight = inputRef.current.clientHeight;
      setInputHeight(calculatedInputHeight);
    }
  }, []);
  useEffect(() => {
    inpRef.current.focus();
  }, []);

  const onSubmit = () => {
    //send message to server
    if (listeningEditor) {
      handleStopRecording();
    }
    onSend(value);
    setValue("");
  };

  const handleStartRecording = () => {
    setOldChatValue(value ? `${value}\n` : "");
    SpeechRecognition.startListening({ continuous: true });
    setListeningEditor(true);
  };
  // useEffect(() => {
  //   if (!listening && transcript && listeningEditor) {
  //     setValue((v) => (v ? `${v}\n${transcript}` : transcript));
  //     inpRef.current.focus();
  //     setListeningEditor(false);
  //   }
  // }, [listening]);
  useEffect(() => {
    if (transcript && listeningEditor) {
      setValue(`${oldChatValue}${transcript}`);
      if (inpRef.current) {
        inpRef.current.focus();
        inpRef.current.scrollTop = inpRef.current.scrollHeight;
      }
    }
  }, [interimTranscript]);

  const handleStopRecording = () => {
    // if (transcript) {
    //   setValue((v) => (v ? `${v}\n${transcript}` : transcript));
    // }
    inpRef.current.focus();
    setListeningEditor(false);

    const recognition = SpeechRecognition.getRecognition();
    if (recognition) {
      recognition.continuous = false;
    }
    resetTranscript();
    SpeechRecognition.stopListening();
    setOldChatValue("");
  };
  return (
    <Grid
      container
      direction='column'
      sx={{
        height: "100%",
        // maxHeight: "100%",
        width: "100%",
        position: "relative",
        p: "40px",
        borderTopLeftRadius: "24px",
        borderBottomLeftRadius: "24px",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        background: (muiTheme) =>
          globaluser?.isDarkTheme
            ? muiTheme.palette.common.primary60
            : muiTheme.palette.common.primary100,
        boxShadow: globaluser?.isDarkTheme
          ? "0px 8px 12px 0px rgba(255, 255, 255, 0.04) inset, 0px 24px 64px -16px rgba(0, 0, 0, 0.24), 16px 24px 64px -24px rgba(255, 255, 255, 0.04) inset"
          : "0px 8px 12px 0px rgba(255, 255, 255, 0.04) inset, 0px 24px 64px -16px rgba(0, 0, 0, 0.24), 16px 24px 64px -24px rgba(255, 255, 255, 0.04) inset",
      }}
    >
      {/* heading and close icon */}
      <Grid
        item
        sx={{
          width: "100%",
          pb: "16px",
          borderBottom: (muiTheme) =>
            `1px solid ${
              globaluser?.isDarkTheme
                ? "rgba(160, 160, 160, 0.5)"
                : muiTheme.palette.common.primary70
            }`,
        }}
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
              {t("chat.textEditor.heading")}
            </Typography>
          </Grid>
          <Grid item>
            <IconButton
              aria-label='close'
              onClick={onClose}
              sx={{
                color: (muiTheme) => muiTheme.palette.common.primary40,
              }}
            >
              <CloseIcon fontSize='small' />
            </IconButton>
          </Grid>
        </Grid>
      </Grid>
      {/* input */}
      <Grid item sx={{ flex: 1, mt: "30px", width: "100%" }}>
        <Grid
          container
          direction='column'
          sx={{
            height: "100%",
            p: "16px",
            borderRadius: "12px",
            background: "transparent",
            border: (muiTheme) =>
              `1px solid ${
                globaluser?.isDarkTheme
                  ? muiTheme.palette.common.primary50
                  : muiTheme.palette.common.primary70
              }`,
          }}
        >
          <Grid item>
            {browserSupportsSpeechRecognition && (
              <IconButton
                disableTouchRipple
                disableRipple
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: (muiTheme) =>
                    globaluser?.isDarkTheme
                      ? muiTheme.palette.common.primary100
                      : muiTheme.palette.common.success20,
                  // padding: 0,
                }}
                onClick={
                  listening && listeningEditor
                    ? handleStopRecording
                    : handleStartRecording
                }
              >
                {listening && listeningEditor ? (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='20'
                    height='20'
                    fill='none'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fill={
                        globaluser?.isDarkTheme
                          ? theme.palette.common.primary20
                          : theme.palette.common.primary0
                      }
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
                      stroke={
                        globaluser?.isDarkTheme
                          ? theme.palette.common.primary20
                          : theme.palette.common.primary0
                      }
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='1.5'
                      d='M6 10v1a6 6 0 006 6m6-7v1a6 6 0 01-6 6m0 0v4m0 0h4m-4 0H8m4-7a3 3 0 01-3-3V6a3 3 0 116 0v5a3 3 0 01-3 3z'
                    ></path>
                  </svg>
                )}
              </IconButton>
            )}
          </Grid>
          <Grid item sx={{ flex: 1, mt: "12px" }}>
            <TextField
              variant='outlined'
              multiline
              fullWidth
              autoFocus
              ref={inputRef}
              inputRef={inpRef}
              sx={{
                height: "100%",
                minHeight: "100%",
                maxHeight: `${inputHeight}px`,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "7px",
                  background: "transparent",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                },
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: (muiTheme) =>
                    muiTheme.palette.secondary.main50,
                },
                "& .MuiOutlinedInput-input": {
                  // height: "100% !important",
                  color: (muiTheme) => muiTheme.palette.primary.main,
                  maxHeight: `${inputHeight}px`,
                  overflowY: "auto !important",
                },

                "& fieldset": {
                  border: "none",
                },
              }}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </Grid>
        </Grid>
      </Grid>
      {/* button */}
      <Grid
        item
        sx={{
          width: "100%",
          mt: { sm: "24px", xs: "16px" },
        }}
      >
        <Grid container justifyContent='flex-end'>
          <Button
            size='small'
            startIcon={
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
                      ? theme.palette.common.primary20
                      : theme.palette.common.primary0
                  }
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='1.5'
                  d='M9.73 14.27l9.504-9.504M5.487 7.998l11.648-3.883c1.7-.566 3.316 1.05 2.75 2.75l-3.883 11.648c-.612 1.838-3.14 2.017-4.007.285l-1.94-3.88a2.174 2.174 0 00-.972-.973l-3.881-1.94c-1.732-.866-1.553-3.394.285-4.007z'
                ></path>
              </svg>
            }
            sx={{
              fontSize: "16px",
              fontWeight: 500,
              //fontFamily: (muiTheme) => muiTheme.typography.secondaryFont,
              px: "30px",
              minHeight: "48px",
              background: (muiTheme) =>
                globaluser?.isDarkTheme
                  ? muiTheme.palette.common.primary100
                  : muiTheme.palette.common.success20,
              color: (muiTheme) =>
                globaluser?.isDarkTheme
                  ? muiTheme.palette.common.primary20
                  : muiTheme.palette.common.primary0,
              borderRadius: "12px",
              boxShadow: "none",

              textTransform: "none",
              "&:hover": {
                background: (muiTheme) =>
                  globaluser?.isDarkTheme
                    ? muiTheme.palette.common.primary100
                    : muiTheme.palette.common.success20,
              },
              "&.Mui-disabled": {
                background: (muiTheme) =>
                  globaluser?.isDarkTheme
                    ? muiTheme.palette.common.primary100
                    : muiTheme.palette.common.success20,
              },
            }}
            onClick={onSubmit}
            disabled={disabled}
          >
            {t("chat.textEditor.send")}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}
