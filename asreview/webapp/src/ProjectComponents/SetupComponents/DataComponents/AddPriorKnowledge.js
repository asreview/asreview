import * as React from "react";
import { connect } from "react-redux";
import {
  Card,
  DialogContent,
  Fade,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { InfoCard } from "../../SetupComponents";
import { PriorLabeled, PriorSearch } from "../DataComponents";
import { mapStateToProps } from "../../../globals.js";
import { useToggle } from "../../../hooks/useToggle";

const AddPriorKnowledge = (props) => {
  const [search, toggleSearch] = useToggle();

  return (
    <Fade in>
      <DialogContent sx={{ p: 0, display: "flex", overflowY: "hidden" }}>
        {!search && (
          <Card
            elevation={0}
            square
            variant="outlined"
            sx={{ width: "50%", padding: "24px 32px", bgcolor: "transparent" }}
          >
            <Stack spacing={2}>
              {/*
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Prior to training the active learning model, you need to provide
               at least 1 relevant and 1 irrelevant records.{" "}
              <Link
                underline="none"
                href="https://asreview.readthedocs.io/en/latest/features/pre_screening.html#select-prior-knowledge"
                target="_blank"
              >
                Learn more
              </Link>
            </Typography>
            */}
              <InfoCard info="Editing the prior knowledge does not train the model." />
              <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
                Select a way to add prior knowledge:
              </Typography>
              <List>
                <ListItem disablePadding divider>
                  <Tooltip title="Search for records in added dataset">
                    <ListItemButton onClick={toggleSearch}>
                      <ListItemText primary="Search" />
                      <AddIcon color="primary" />
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
                <ListItem disablePadding divider>
                  <Tooltip title="Get a random record from added dataset">
                    <ListItemButton>
                      <ListItemText primary="Random" />
                      <AddIcon color="primary" />
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              </List>
            </Stack>
          </Card>
        )}
        {search && (
          <PriorSearch n_prior={props.n_prior} toggleSearch={toggleSearch} />
        )}
        <PriorLabeled n_prior={props.n_prior} />
        {/*
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
        */}
      </DialogContent>
    </Fade>
  );
};

export default connect(mapStateToProps)(AddPriorKnowledge);
