import React, { useRef, useState, useEffect, useContext } from "react";
import {
  Grid,
  IconButton,
  TextField,
  Button,
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import Editor, { useMonaco } from "@monaco-editor/react";
import { GlobalContext } from "../../context/GlobalContext";

import axios from "../../utils/axios";
import { Resizable } from "re-resizable";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

export default function CodeEditor({
  id,
  disabled,
  onClose,
  langId,
  langName,
  monacoName,
  onSend,
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const parentRef = useRef(null);
  const inpRef = useRef();
  const monaco = useMonaco();
  const { user: globaluser } = useContext(GlobalContext);

  const [parentHeight, setParentHeight] = useState(0);
  const [editorHeight, setEditorHeight] = useState(0);

  const [value, setValue] = useState("");
  const [output, setOutput] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    status: false,
    message: "",
  });

  // useEffect(() => {
  //   inpRef.current.focus();
  // }, []);
  useEffect(() => {
    if (parentRef.current) {
      const calculatedParentHeight = parentRef.current.clientHeight;
      setParentHeight(calculatedParentHeight);
      setEditorHeight((calculatedParentHeight * 70) / 100);
    }
  }, []);

  useEffect(() => {
    if (monaco) {
      //here is monaco
      monaco.editor?.defineTheme("onedark", {
        base: globaluser?.isDarkTheme ? "vs-dark" : "vs",
        inherit: true,
        rules: [],
        // rules: [{ background: "#241326" }],
        colors: {
          "editor.background": globaluser?.isDarkTheme
            ? theme.palette.common.primary80
            : theme.palette.common.success20,
          // "editor.foreground": globaluser?.isDarkTheme
          //   ? theme.palette.common.primary30
          //   : "#1A1A1A",
        },
      });
      monaco.editor.setTheme("onedark");
    }
  }, [monaco]);

  const runCodeHandler = async () => {
    setError({
      status: false,
      message: "",
    });
    try {
      setLoading(true);
      const result = await axios.post(
        `/api/v1/code_excecution`,
        {
          code: value,
          lang_id: langId,
          stdin: "",
          id: id,
        },
        {
          headers: {
            "Content-Type": "application/json",

            authorization: "Bearer " + globaluser.token,
          },
        }
      );

      if (result.data?.output) {
        setOutput(result.data.output);
      } else {
        setError({
          status: true,
          message: result.data.error,
        });
      }
      setLoading(false);
    } catch (err) {
      console.log(err);

      setError({
        status: true,
        message: err.response?.data?.error || t("chat.codeEditor.errorParsing"),
      });
      setLoading(false);
    }
  };
  const onSubmit = () => {
    //send message to server
    let inputValue = value;
    if (output) {
      inputValue += `\n${output}`;
    }
    if (error.status) {
      inputValue += `\n${error.message}`;
    }
    onSend(inputValue);
    //setValue("");
  };

  console.log(parentHeight, editorHeight);
  return (
    <Grid
      container
      direction='column'
      wrap='nowrap'
      sx={{
        height: "100%",
        maxHeight: "100%",
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
        // maxHeight: parentHeight === 0 ? "unset" : `${parentHeight}px`,
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
              {langName}
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
      <Grid item ref={parentRef} sx={{ flex: 1 }}>
        {parentHeight !== 0 && (
          <Grid
            container
            direction='column'
            sx={{
              height: "100%",
              mt: "30px",
              maxHeight:
                parentHeight === 0 ? "unset" : `${parentHeight - 30}px`,
            }}
          >
            {/* editor */}
            <Grid
              item
              sx={{
                width: "100%",
                //  minHeight: "60px",
              }}
            >
              <Resizable
                size={{ width: "100%", height: `${editorHeight - 14}px` }}
                enable={{
                  right: false,
                  left: false,
                  top: false,
                  bottom: true,
                }}
                className='scrollable-element'
                style={{
                  // overflowY: "auto",
                  boxShadow: globaluser.isDarkTheme
                    ? "0px 8px 10px -6px rgba(182, 240, 156, 0.04), 0px 25px 50px -12px rgba(182, 240, 156, 0.12), 0px 0px 0px 5px rgba(182, 240, 156, 0.12)"
                    : "none",
                  borderRadius: "14px",
                  border: `1px solid ${theme.palette.common.success20}`,
                }}
                maxHeight={parentHeight - 90}
                //onResize={(e,direction,)}
                onResizeStop={(e, direction, ref, d) => {
                  setEditorHeight((w) => w + d.height);
                }}
              >
                <Editor
                  width='100%'
                  height='100%'
                  theme='onedark'
                  className='monaco-editor'
                  language={monacoName}
                  onMount={(editor) => {
                    editor.focus();
                  }}
                  //defaultLanguage='python'
                  options={{
                    selectOnLineNumbers: true,
                    automaticLayout: true,
                    fontLigatures: "",
                  }}
                  value={value}
                  onChange={setValue}
                />
              </Resizable>
            </Grid>
            {/* output */}
            <Grid
              item
              sx={{
                width: "100%",
                flex: 1,
                maxHeight: "100%",
                overflowY: "auto",
                mt: "14px",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "100%",

                  borderRadius: "12px",
                  backgroundColor: (muiTheme) =>
                    globaluser?.isDarkTheme
                      ? muiTheme.palette.common.primary80
                      : muiTheme.palette.common.primary70,
                  // height:
                  //   parentHeight === 0
                  //     ? "unset"
                  //     : `${parentHeight - (editorHeight + 40)}px`,
                  // maxHeight:
                  //   parentHeight === 0
                  //     ? "unset"
                  //     : `${parentHeight - (editorHeight + 40)}px`,
                  // overflowY: "auto",
                  p: "24px",
                }}
              >
                <Typography
                  variant='subtitle2'
                  sx={{
                    // mt: "3px",
                    // fontFamily: (muiTheme) => muiTheme.typography.codeFont,
                    whiteSpace: "break-spaces",
                    color: (muiTheme) =>
                      error.status ? "red" : muiTheme.palette.common.primary50,
                  }}
                >
                  {t("chat.codeEditor.output")}{" "}
                  {error.status
                    ? error.message
                    : loading
                    ? t("chat.codeEditor.executing")
                    : output}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </Grid>
      {/* button */}
      <Grid
        item
        sx={{
          width: "100%",
          mt: "16px",
        }}
      >
        <Grid container justifyContent='flex-end' gap={"10px"}>
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
              // fontFamily: (muiTheme) => muiTheme.typography.secondaryFont,
              px: "24px",
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
            {t("chat.codeEditor.send")}
          </Button>
          <Button
            size='small'
            startIcon={
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='25'
                height='24'
                fill='none'
                viewBox='0 0 25 24'
              >
                <path
                  stroke='#fff'
                  strokeLinecap='round'
                  strokeWidth='1.5'
                  d='M17.5 7.83l1.697 1.526c1.542 1.389 2.313 2.083 2.313 2.974 0 .89-.771 1.585-2.314 2.973L17.5 16.83M14.487 5L12.5 12.415l-1.987 7.415M7.5 7.83L5.804 9.356C4.26 10.745 3.49 11.44 3.49 12.33c0 .89.771 1.585 2.314 2.973L7.5 16.83'
                ></path>
              </svg>
            }
            sx={{
              fontSize: "16px",
              fontWeight: 500,
              // fontFamily: (muiTheme) => muiTheme.typography.secondaryFont,
              px: "24px",
              background: "rgba(18, 144, 114, 0.80)",
              color: "#fff",
              borderRadius: "12px",
              boxShadow: "none",
              textTransform: "none",
              "&:hover": {
                background: "rgba(18, 144, 114, 0.80)",
                color: "#fff",
              },
              "&.Mui-disabled": {
                background: "rgba(18, 144, 114, 0.80)",
                color: "#fff",
              },
            }}
            onClick={runCodeHandler}
            disabled={disabled}
          >
            {t("chat.codeEditor.run")}
          </Button>
        </Grid>
      </Grid>
      <style>{`
                  .monaco-editor{
                  
                    border-radius: 14px; 
                    padding-top: 8px;
                    padding-bottom: 18px;
                  }
                  
      `}</style>
    </Grid>
  );
}
