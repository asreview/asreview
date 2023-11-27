import * as React from "react";
import { Stack } from "@mui/material";

import { StyledTextButton } from "../StyledComponents/StyledButton";
import { discussionsURL, asreviewURL } from "../globals";

export default function HelpPrivacyTermsButton(props) {
  return (
    <Stack
      spacing={2}
      direction="row"
      sx={{
        justifyContent: "flex-end",
        marginTop: (theme) => theme.spacing(3),
      }}
    >
      <StyledTextButton
        size="small"
        href={discussionsURL}
        target="_blank"
        sx={{ color: "text.secondary" }}
      >
        Help
      </StyledTextButton>
      <StyledTextButton
        size="small"
        href={asreviewURL}
        target="_blank"
        sx={{ color: "text.secondary" }}
      >
        Free and Open Source
      </StyledTextButton>
    </Stack>
  );
}
