import * as React from "react";
import { useIsMutating, useQuery } from "react-query";
import { connect } from "react-redux";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
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
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";

import { AppBarWithinDialog } from "../../../Components";
import { InfoCard } from "..";
import { PriorLabeled, PriorRandom, PriorSearch } from "../PriorComponents";
import { ProjectAPI } from "../../../api";
import { useToggle } from "../../../hooks/useToggle";
import { useContext } from "react";
import { ProjectContext } from "../../../ProjectContext";

const PREFIX = "AddPriorKnowledge";

const classes = {
  form: `${PREFIX}-form`,
  layout: `${PREFIX}-layout`,
  method: `${PREFIX}-method`,
  unlabeled: `${PREFIX}-unlabeled`,
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  height: "100%",
  overflowY: "hidden",
  [`& .${classes.form}`]: {
    height: "inherit",
    display: "flex",
    overflowY: "hidden",
    padding: 0,
  },

  [`& .${classes.layout}`]: {
    width: "100%",
    flexDirection: "row",
    [`${theme.breakpoints.down("md")} and (orientation: portrait)`]: {
      flexDirection: "column",
    },
  },

  [`& .${classes.method}`]: {
    padding: "24px 32px",
    [theme.breakpoints.down("md")]: {
      padding: "24px",
    },
  },

  [`& .${classes.unlabeled}`]: {
    backgroundColor: "transparent",
    height: "100%",
    width: "50%",
    [`${theme.breakpoints.down("md")} and (orientation: portrait)`]: {
      height: "50%",
      width: "100%",
    },
  },
}));

const AddPriorKnowledge = (props) => {
  const project_id = useContext(ProjectContext);

  const isMutatingPrior = useIsMutating(["mutatePriorKnowledge"]);
  const isMutatingLabeled = useIsMutating(["mutateLabeledPriorKnowledge"]);

  const [savingState, setSavingState] = React.useState(false);
  const timerRef = React.useRef(null);

  const [search, toggleSearch] = useToggle();
  const [random, toggleRandom] = useToggle();

  console.log("AddPriorKnowledge.js:project_id: ", project_id);

  const { data: info } = useQuery(
    ["fetchInfo", { project_id: project_id }],
    ProjectAPI.fetchInfo,
    {
      enabled: props.open && project_id !== null,
      refetchOnWindowFocus: false,
    },
  );

  const { data } = useQuery(
    ["fetchLabeledStats", { project_id: project_id }],
    ProjectAPI.fetchLabeledStats,
    {
      enabled: props.open && project_id !== null,
      refetchOnWindowFocus: false,
    },
  );

  const isEnoughPriorKnowledge = () => {
    return data?.n_prior_exclusions > 4 && data?.n_prior_inclusions > 4;
  };

  const handleClickClose = () => {
    props.toggleAddPrior();
    if (random) {
      toggleRandom();
    }
    if (search) {
      toggleSearch();
    }
  };

  React.useEffect(() => {
    const currentSavingStatus =
      isMutatingPrior === 1 || isMutatingLabeled === 1;

    // If the status changes to 'saving', immediately update the state
    if (currentSavingStatus) {
      setSavingState(true);
      if (timerRef.current) clearTimeout(timerRef.current);
    } else {
      // If the status changes to 'not saving', delay the update by 1000ms
      timerRef.current = setTimeout(() => setSavingState(false), 1000);
    }

    // Cleanup on unmount or if dependencies change
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isMutatingPrior, isMutatingLabeled]);

  return (
    <StyledDialog
      hideBackdrop
      open={props.open}
      fullScreen={props.mobileScreen}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { height: !props.mobileScreen ? "calc(100% - 96px)" : "100%" },
      }}
      TransitionComponent={Fade}
    >
      {props.mobileScreen && (
        <AppBarWithinDialog
          onClickStartIcon={handleClickClose}
          startIconIsClose={false}
          title="Prior knowledge"
        />
      )}
      {!props.mobileScreen && (
        <Stack className="dialog-header" direction="row">
          <DialogTitle>Prior knowledge</DialogTitle>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            {isEnoughPriorKnowledge() && (
              <Typography variant="body2" sx={{ color: "secondary.main" }}>
                Enough prior knowledge. Click CLOSE to move on to the next step.
              </Typography>
            )}
            {/* {data?.n_prior !== 0 && <SavingStateBox isSaving={savingState} />} */}
            <Box className="dialog-header-button right">
              <Button
                variant={!isEnoughPriorKnowledge() ? "text" : "contained"}
                onClick={handleClickClose}
              >
                Close
              </Button>
            </Box>
          </Stack>
        </Stack>
      )}
      <DialogContent className={classes.form}>
        <Stack className={classes.layout}>
          <Card
            elevation={0}
            square
            variant="outlined"
            className={classes.unlabeled}
          >
            {!search && !random && (
              <Stack className={classes.method} spacing={2}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Label at least 1 relevant and 1 irrelevant record to warm up
                  the AI.{" "}
                  <Link
                    underline="none"
                    href="https://asreview.readthedocs.io/en/latest/project_create.html#select-prior-knowledge"
                    target="_blank"
                  >
                    Learn more
                  </Link>
                </Typography>
                <InfoCard info="Editing prior knowledge does not train the model" />
                <Typography
                  variant="subtitle1"
                  sx={{ color: "text.secondary" }}
                >
                  Select a way to add prior knowledge:
                </Typography>
                <List>
                  <ListItem disablePadding divider>
                    <Tooltip title="Search for specific records in the dataset">
                      <ListItemButton onClick={toggleSearch}>
                        <ListItemText primary="Search" />
                        <AddIcon color="primary" />
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                  <ListItem disablePadding divider>
                    <Tooltip title="Get random records from the dataset">
                      <ListItemButton onClick={toggleRandom}>
                        <ListItemText primary="Random" />
                        <AddIcon color="primary" />
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                </List>
              </Stack>
            )}
            {search && !random && (
              <PriorSearch
                n_prior={data?.n_prior}
                toggleSearch={toggleSearch}
              />
            )}
            {!search && random && (
              <PriorRandom
                mode={info?.mode}
                n_prior_exclusions={data?.n_prior_exclusions}
                toggleRandom={toggleRandom}
                toggleSearch={toggleSearch}
              />
            )}
          </Card>
          <Card
            elevation={0}
            square
            variant="outlined"
            className={classes.unlabeled}
          >
            <PriorLabeled
              mobileScreen={props.mobileScreen}
              n_prior={data?.n_prior}
              n_prior_exclusions={data?.n_prior_exclusions}
              n_prior_inclusions={data?.n_prior_inclusions}
            />
          </Card>
        </Stack>
      </DialogContent>
    </StyledDialog>
  );
};

export default AddPriorKnowledge;
