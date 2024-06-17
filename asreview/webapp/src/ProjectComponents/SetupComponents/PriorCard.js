import { useContext } from "react";
import React from "react";
import { useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  FormControlLabel,
  FormLabel,
  Link,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { ProjectContext } from "ProjectContext";
import { ProjectAPI } from "api";
import { AddPriorKnowledge } from "./SearchComponents";

const PriorCard = ({ mobileScreen, editable = true }) => {
  const project_id = useContext(ProjectContext);
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const [openPriorSearch, setOpenPriorSearch] = React.useState(false);
  const [priorType, setPriorType] = React.useState("records");

  const handleClickViewPrior = () => {
    if (!editable) {
      navigate(`/projects/${project_id}/history`);

      // todo set filter to prior knowledge
    }
  };

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

      <CardContent>
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
              label="Criteria"
            />
          </RadioGroup>
        </FormControl>
      </CardContent>

      {priorType === "records" && (
        <>
          <CardContent>
            {(data?.n_inclusions === 0 || data?.n_exclusions === 0) && (
              <Typography>
                Search for one or more relevant records and label them relevant.
                It's also possible to label irrelevant records.
              </Typography>
            )}
            {data?.n_inclusions !== 0 && data?.n_exclusions !== 0 && (
              <Typography>
                You added{" "}
                {`${data?.n_inclusions} relevant records and ${data?.n_exclusions} records that aren't relevant.`}
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
              onClick={handleClickViewPrior}
              disabled={data?.n_inclusions === 0 && data?.n_exclusions === 0}
            >
              View ({data?.n_inclusions + data?.n_exclusions})
            </Button>
          </CardContent>
        </>
      )}
      {priorType === "criteria" && (
        <CardContent>
          Coming soon! Keep an eye on our website and socials.
        </CardContent>
      )}

      <AddPriorKnowledge
        open={openPriorSearch}
        mobileScreen={mobileScreen}
        onClose={onClosePriorSearch}
      />
    </Card>
  );
};

export default PriorCard;
