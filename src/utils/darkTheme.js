import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

const primaryFont = "Plus Jakarta Sans";
const secondaryFont = "Nunito Sans";
const codeFont = "Cascadia";

const success100 = "#29541d";
const success70 = "#51A937";
const success60 = "#3AA50A";
const success30 = "#cee6d5";
const success20 = "#B6F09C";

const primary100 = "#000";
const primary90 = "#282B30";
const primary80 = "#0D0F10";
const primary70 = "#131619";
const primary60 = "#1A1D21";
const primary50 = "#363A3D";
const primary40 = "#686B6E";
const primary30 = "#9B9C9E";
const primary20 = "#CDCECF";
const primary10 = "#E8E9E9";
const primary0 = "#fff";

//const secondary100 = "#fff";

// Create a theme instance.
const theme = createTheme({
  palette: {
    common: {
      success100: success100,
      success70: success70,
      success60,
      success30: success30,
      success20,
      primary100,
      primary90,
      primary80,
      primary70,
      primary60,
      primary50,
      primary40,
      primary30,
      primary20,
      primary10,
      primary0,
    },
    primary: {
      main: primary0,
    },
    secondary: {
      main: primary100,
      main50: "rgba(255, 255, 255, 0.50)",
    },
    error: {
      main: red.A400,
    },
  },
  typography: {
    fontFamily: primaryFont,
    secondaryFont: secondaryFont,
    codeFont: codeFont,
  },
});

export default theme;
