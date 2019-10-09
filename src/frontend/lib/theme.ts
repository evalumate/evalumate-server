import { createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#4CAF50",
    },
    // secondary: {
    //   main: '#19857b',
    // },
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
