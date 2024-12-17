import React, { useContext } from "react";
import { useQuery, useQueryClient } from "react-query";

import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  // FormControl,
  // FormControlLabel,
  // FormLabel,
  // Radio,
  // RadioGroup,
  Link,
  Typography,
} from "@mui/material";
import { LabelHistoryPrior } from "ProjectComponents/HistoryComponents";
import { ProjectContext } from "context/ProjectContext";
import { ProjectAPI } from "api";
import { useToggle } from "hooks/useToggle";
import { AddPriorKnowledge } from "./SearchComponents";
import { projectModes } from "globals.js";

const PriorCard = ({ editable = true, mode = projectModes.ORACLE }) => {
  const project_id = useContext(ProjectContext);
  const queryClient = useQueryClient();

  const [openPriorSearch, setOpenPriorSearch] = React.useState(false);
  const [openPriorView, toggleOpenPriorView] = useToggle(false);
  // const [priorType, setPriorType] = React.useState("records");
  const priorType = "records";

  const { data } = useQuery(
    ["fetchLabeledStats", { project_id: project_id }],
    ProjectAPI.fetchLabeledStats,
    {
      refetchOnWindowFocus: false,
    },
  );

  const onClosePriorSearch = () => {
    queryClient.resetQueries("fetchLabeledStats");
    setOpenPriorSearch(false);
  };

  return (
    <Card>
      <CardHeader
        title="Prior knowledge"
        subheader={
          <>
            <>Prior knowledge helps to warm up and accelerate the AI. </>
            <Link
              underline="none"
              href={`https://asreview.nl/blog/active-learning-explained/`}
              target="_blank"
            >
              learn more
            </Link>
          </>
        }
      />

      {/* <CardContent>
        <FormControl>
          <FormLabel id="prior-type-radio">
            What knowledge so you want the AI to use in the beginning?
          </FormLabel>
          <RadioGroup
            row
            aria-labelledby="prior-type-radio"
            name="prior-type"
            defaultValue={priorType}
            onChange={(event) => setPriorType(event.target.value)}
          >
            <FormControlLabel
              value="records"
              control={<Radio />}
              label="Records"
            />
            <FormControlLabel
              value="criteria"
              control={<Radio />}
              label="Review criteria"
            />
            <FormControlLabel
              value="file"
              control={<Radio />}
              label="From file"
            />
          </RadioGroup>
        </FormControl>
      </CardContent> */}

      {priorType === "records" && (
        <>
          <CardContent>
            {(data?.n_prior_inclusions === 0 ||
              data?.n_prior_exclusions === 0) && (
              <Typography>
                Search for one or more relevant records and label them relevant.
                It's also possible to label irrelevant records.
              </Typography>
            )}
            {data?.n_prior_inclusions !== 0 &&
              data?.n_prior_exclusions !== 0 && (
                <Typography>
                  You added{" "}
                  {`${data?.n_prior_inclusions} relevant records and ${data?.n_prior_exclusions} records that aren't relevant.`}
                </Typography>
              )}
          </CardContent>

          <CardContent>
            <Button
              id={"add-prior-search"}
              onClick={() => setOpenPriorSearch(true)}
              variant="contained"
              disabled={!editable}
              sx={{ mr: 2 }}
            >
              Search
            </Button>

            <Button
              id={"add-prior-view"}
              onClick={toggleOpenPriorView}
              disabled={
                data?.n_prior_inclusions === 0 && data?.n_prior_exclusions === 0
              }
            >
              {openPriorView
                ? "Hide records"
                : "Show records (" + data?.n_prior + ")"}
            </Button>
          </CardContent>
        </>
      )}
      {priorType === "records" && openPriorView && (
        <>
          <Divider />
          <CardContent>
            <LabelHistoryPrior
              project_id={project_id}
              mode={mode}
              n_prior_inclusions={data && data?.n_prior_inclusions}
              n_prior_exclusions={data && data?.n_prior_exclusions}
            />
          </CardContent>
        </>
      )}

      {(priorType === "criteria" || priorType === "file") && (
        <CardContent>
          <Alert severity="info">
            Coming soon! Keep an eye on our website and socials.
          </Alert>
        </CardContent>
      )}

      <AddPriorKnowledge open={openPriorSearch} onClose={onClosePriorSearch} />
    </Card>
  );
};

export default PriorCard;
