import * as React from "react";
import {
  Card,
  DialogContent,
  Fade,
  Link,
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
import { PriorLabeled, PriorRandom, PriorSearch } from "../DataComponents";
import { useToggle } from "../../../hooks/useToggle";

const AddPriorKnowledge = (props) => {
  const [search, toggleSearch] = useToggle();
  const [random, toggleRandom] = useToggle();

  return (
    <Fade in>
      <DialogContent sx={{ p: 0, display: "flex", overflowY: "hidden" }}>
        {!search && !random && (
          <Card
            elevation={0}
            square
            variant="outlined"
            sx={{ width: "50%", padding: "24px 32px", bgcolor: "transparent" }}
          >
            <Stack spacing={2}>
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
              <InfoCard info="Editing the prior knowledge does not train the model" />
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
                    <ListItemButton onClick={toggleRandom}>
                      <ListItemText primary="Random" />
                      <AddIcon color="primary" />
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              </List>
            </Stack>
          </Card>
        )}
        {search && !random && (
          <PriorSearch
            n_prior={props.n_prior}
            project_id={props.project_id}
            toggleSearch={toggleSearch}
          />
        )}
        {!search && random && (
          <PriorRandom
            n_prior={props.n_prior}
            n_prior_exclusions={props.n_prior_exclusions}
            project_id={props.project_id}
            toggleRandom={toggleRandom}
            toggleSearch={toggleSearch}
          />
        )}
        <PriorLabeled
          project_id={props.project_id}
          n_prior={props.n_prior}
          n_prior_exclusions={props.n_prior_exclusions}
          n_prior_inclusions={props.n_prior_inclusions}
        />
      </DialogContent>
    </Fade>
  );
};

export default AddPriorKnowledge;
