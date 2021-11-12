import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { connect } from "react-redux";
import {
  Box,
  Button,
  Chip,
  DialogContent,
  Divider,
  Fade,
  IconButton,
  InputBase,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";

import { InlineErrorHandler } from "../../Components";
import { ProjectAPI } from "../../api/index.js";
import { mapStateToProps } from "../../globals.js";

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`:hover`]: {
    backgroundColor: "transparent",
  },
}));

const AddPriorKnowledge = (props) => {
  const queryClient = useQueryClient();
  const [label, setLabel] = React.useState("unlabeled");

  const handleClickUnlabeled = () => {
    setLabel("unlabeled");
  };

  const handleClickLabeled = () => {
    setLabel("labeled");
  };

  return (
    <Fade in>
      <DialogContent sx={{ p: 0 }}>
        <Box>
          <Stack direction="row" spacing={2} sx={{ p: "8px 24px" }}>
            <Chip
              label="Unlabeled"
              color="primary"
              variant={label === "unlabeled" ? "filled" : "outlined"}
              onClick={handleClickUnlabeled}
            />
            <Chip
              label="Labeled"
              color="primary"
              variant={label === "labeled" ? "filled" : "outlined"}
              onClick={handleClickLabeled}
            />
          </Stack>
          <Divider />
          <Stack direction="row" sx={{ p: "4px 16px" }}>
            <StyledIconButton>
              <SearchIcon />
            </StyledIconButton>
            <InputBase
              autoFocus
              fullWidth
              placeholder="Keyword in title, abstract, or author"
              sx={{ ml: 1 }}
            />
            <Button>Search</Button>
          </Stack>
          <Divider />
        </Box>
        {/*!props.isAddingDataset && isError && (
            <InlineErrorHandler
              message={error?.message}
              refetch={refetchData}
              button="Try to refresh"
            />
          )}
          {!props.isAddingDataset && !isError && isFetched && isSuccess && (
            <Typography variant="subtitle2">
              Dataset <i>{data?.filename}</i> with <i>{data?.n_rows}</i> records
              is added. Editing the dataset removes the prior knowledge.
            </Typography>
          )*/}
      </DialogContent>
    </Fade>
  );
};

export default connect(mapStateToProps)(AddPriorKnowledge);
