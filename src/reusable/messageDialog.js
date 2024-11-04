import React, { useContext } from "react";
import {
  Dialog,
  DialogTitle,
  Grid,
  Typography,
  IconButton,
  Box,
  DialogContent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { GlobalContext } from "../context/GlobalContext";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

export default function MessageDialog({ open, onClose, message, error }) {
  const { user: globaluser } = useContext(GlobalContext);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      // fullWidth
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
          p: "16px 20px",
        },
        "& .MuiBackdrop-root": {
          background: "rgba(6, 7, 8, 0.64)",
          backdropFilter: "blur(4px)",

          // opacity: "0.8 !important",
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* <IconButton
              aria-label='close'
              onClick={onClose}
              sx={{
                color: (muiTheme) => muiTheme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton> */}
        <Grid container wrap='nowrap' gap={"16px"} alignItems='center'>
          <Grid item>
            {error ? (
              <ReportGmailerrorredIcon
                sx={{ fill: "#D0302F", width: "24px", height: "24px" }}
              />
            ) : (
              <CheckCircleOutlineIcon
                sx={{ fill: "#4AC97E", width: "24px", height: "24px" }}
              />
            )}
          </Grid>
          <Grid item>
            <Typography
              variant='subtitle1'
              sx={{
                fontWeight: 600,

                color: (muiTheme) =>
                  globaluser?.isDarkTheme
                    ? muiTheme.palette.common.primary0
                    : "#1A1A1A",
              }}
            >
              {error ? (
                message.includes("Something went wrong.") ? (
                  <span style={{ whiteSpace: "break-spaces" }}>
                    {message.split("Something went wrong.")[0]}
                    <Box
                      component='span'
                      sx={{
                        color: "#D0302F",
                        fontWeight: 600,
                      }}
                    >
                      Something went wrong.
                    </Box>{" "}
                    {message.split("Something went wrong.")[1]}
                  </span>
                ) : (
                  <span style={{ whiteSpace: "break-spaces" }}>{message}</span>
                )
              ) : message.includes("Success!") ? (
                <span style={{ whiteSpace: "break-spaces" }}>
                  {message.split("Success!")[0]}
                  <Box
                    component='span'
                    sx={{
                      color: "#4AC97E",
                      fontWeight: 600,
                    }}
                  >
                    Success!
                  </Box>{" "}
                  {message.split("Success!")[1]}
                </span>
              ) : (
                <span style={{ whiteSpace: "break-spaces" }}>{message}</span>
              )}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
