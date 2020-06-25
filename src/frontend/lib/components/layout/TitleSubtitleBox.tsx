import { Box, Typography } from "@material-ui/core";

import { useTranslation } from "../../util/i18n";

export const TitleSubtitleBox: React.FunctionComponent = (props) => {
  const { t } = useTranslation();

  return (
    <Box style={{ flexGrow: 1 }}>
      <Typography variant="h3" component="h1" align="center">
        Evaluate? EvaluMate!
      </Typography>
      <Typography variant="subtitle1" align="center">
        {t("subtitle")}
      </Typography>
    </Box>
  );
};
