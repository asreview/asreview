import React from "react";
import { Banner } from "material-ui-banner";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const ExplorationModeBanner = (props) => {
  return (
    <div aria-label="exploration mode banner">
      <Banner
        open={props.explorationMode}
        onClose={() => props.setExplorationMode(false)}
        label="You are reviewing a (partly) labeled dataset in the validation mode."
        icon={<InfoOutlinedIcon sx={{ color: "text.secondary" }} />}
        iconProps={{
          sx: { bgcolor: "transparent" },
        }}
        buttonLabel="Learn more"
        buttonProps={{
          href: "https://asreview.readthedocs.io/en/latest/screening.html#screening-in-validation-mode",
          target: "_blank",
          sx: { color: "text.secondary" },
        }}
        dismissButtonLabel="Got it"
        dismissButtonProps={{
          sx: { color: "text.secondary" },
        }}
        paperProps={{
          sx: {
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "grey.900" : "grey.50",
          },
        }}
        cardProps={{
          sx: {
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "grey.900" : "grey.50",
          },
        }}
        appBar
      />
    </div>
  );
};

export default ExplorationModeBanner;
