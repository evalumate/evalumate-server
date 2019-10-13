import { green, pink } from "@material-ui/core/colors";
import { createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  palette: {
    primary: green,
    secondary: pink,
    // error: {
    //   main: red.A400,
    // },
    background: {
      default: "#fff",
    },
  },
  props: {
    MuiTextField: {
      variant: "outlined",
      fullWidth: true,
    },
  },
});

export default theme;
