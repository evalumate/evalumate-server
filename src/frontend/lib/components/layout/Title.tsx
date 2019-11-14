import Typography from "@material-ui/core/Typography";
import * as React from "react";

export const Title: React.FunctionComponent<{}> = props => (
  <Typography component="h2" variant="h6" gutterBottom>
    {props.children}
  </Typography>
);
