import { styled } from "@mui/material/styles";
import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { useMediaQuery } from "@mui/material";
import { useParams } from "react-router-dom";

import { ActionsFeedbackBar } from "Components";
import { RecordCard, ReviewPageFinished } from ".";

import { ProjectAPI } from "api";

import FinishSetup from "./ReviewPageTraining";

const Root = styled("div")(({ theme }) => ({
  margin: "auto",
  maxWidth: 960,
  [theme.breakpoints.down("md")]: {
    padding: "4px 0px",
  },
  [theme.breakpoints.up("md")]: {
    padding: "2rem 1rem",
  },
}));

const Screener = (props) => {
  const { project_id } = useParams();
  const queryClient = useQueryClient();

  const [tagValues, setTagValues] = React.useState({});

  const { data, error, isError } = useQuery(
    ["fetchRecord", { project_id }],
    ProjectAPI.fetchRecord,
    {
      refetchOnWindowFocus: false,
    },
  );

  const afterDecision = () => {
    queryClient.invalidateQueries("fetchRecord");
  };

  return (
    <Root aria-label="review page">
      {data["result"] && (
        <RecordCard
          project_id={project_id}
          record={data["result"]}
          afterDecision={afterDecision}
          fontSize={props.fontSize?.label}
          showBorder={props.showBorder}
          tags={props.tags}
          tagValues={tagValues}
          setTagValues={setTagValues}
          collapseAbstract={false}
          hotkeys={true}
          key={project_id + "-" + data["result"]["record_id"]}
        />
      )}

      {/* Error handler */}
      {isError && (
        <ActionsFeedbackBar
          feedback={error?.message + " Please try again."}
          open={isError}
        />
      )}
    </Root>
  );
};

const ReviewPage = ({ project_id, fontSize, tags }) => {
  /* fetch the record and check if the project is training */
  const { refetch, data, isSuccess } = useQuery(
    ["fetchRecord", { project_id }],
    ProjectAPI.fetchRecord,
    {
      refetchOnWindowFocus: false,
      retry: false,
      refetchInterval: (data) =>
        data?.result && !data?.pool_empty ? -1 : 4000,
      refetchIntervalInBackground: true,
    },
  );

  let showBorder = useMediaQuery((theme) => theme.breakpoints.up("md"), {
    noSsr: true,
  });

  return (
    <Root aria-label="review page">
      {isSuccess && (
        <>
          {data?.result !== null && (
            <Screener
              record={data}
              fontSize={fontSize}
              showBorder={showBorder}
              tags={tags}
            />
          )}

          {data?.result === null && !data?.pool_empty && (
            <FinishSetup project_id={project_id} refetch={refetch} />
          )}

          {/* Review finished */}
          {data?.result === null && data?.pool_empty && <ReviewPageFinished />}
        </>
      )}
    </Root>
  );
};

export default ReviewPage;
