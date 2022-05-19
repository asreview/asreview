import React from "react";
import { Banner } from "material-ui-banner";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const EnoughPriorBanner = (props) => {
  return (
    <div>
      <Banner
        open={props.reminder}
        onClose={props.toggleReminder}
        label={`${props.n_prior_exclusions} records were labeled as irrelevant. You have found enough irrelevant records as prior knowledge. Try to search for relevant records?`}
        icon={<InfoOutlinedIcon sx={{ color: "text.secondary" }} />}
        iconProps={{
          sx: { bgcolor: "transparent" },
        }}
        buttonLabel="Search"
        buttonOnClick={props.onClickPriorSearch}
        buttonProps={{
          sx: { color: "text.secondary" },
        }}
        dismissButtonLabel="Show more"
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
      />
    </div>
  );
};

export default EnoughPriorBanner;
