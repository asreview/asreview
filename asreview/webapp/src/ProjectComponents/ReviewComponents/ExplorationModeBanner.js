import React from "react";
import { Banner } from "material-ui-banner";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const ExplorationModeBanner = (props) => {
  return (
    <div aria-label="exploration mode banner">
      <Banner
        open={props.explorationMode}
        onClose={() => props.setExplorationMode(false)}
        label="You are screening through a manually pre-labeled dataset."
        icon={<InfoOutlinedIcon sx={{ color: "text.secondary" }} />}
        iconProps={{
          sx: { bgcolor: "transparent" },
        }}
        buttonLabel="read more"
        buttonProps={{
          href: "https://asreview.readthedocs.io/en/latest/lab/exploration.html",
          target: "_blank",
          sx: { color: "text.secondary" },
        }}
        dismissButtonProps={{
          sx: { color: "text.secondary" },
        }}
        appBar
      />
    </div>
  );
};

export default ExplorationModeBanner;
