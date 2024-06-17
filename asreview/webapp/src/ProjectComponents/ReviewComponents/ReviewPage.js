import { styled } from "@mui/material/styles";
import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";

import { ActionsFeedbackBar } from "Components";
import { RecordCard, ReviewPageFinished } from ".";

import { ProjectAPI } from "api";
// import { useKeyPress } from "hooks/useKeyPress";

import "./ReviewPage.css";
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
      {
        data["result"] && (
          // <Fade in>
          <RecordCard
            project_id={project_id}
            record={data["result"]}
            afterDecision={afterDecision}
            // recordNote={recordNote}
            // setRecordNote={setRecordNote}
            fontSize={props.fontSize}
            mobileScreen={props.mobileScreen}
            // noteFieldAutoFocus={noteFieldAutoFocus}
            // previousRecord={previousRecord}
            tags={props.tags}
            tagValues={tagValues}
            setTagValues={setTagValues}
            collapseAbstract={false}
            key={project_id + "-" + data["result"]["record_id"]}
          />
        )

        // </Fade>
      }

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

const ReviewPage = ({
  project_id,
  mobileScreen,
  fontSize,
  undoEnabled,
  tags,
}) => {
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

  return (
    <Root aria-label="review page">
      {isSuccess && (
        <>
          {data?.result !== null && (
            <Screener
              record={data}
              mobileScreen={mobileScreen}
              fontSize={fontSize}
              undoEnabled={undoEnabled}
              tags={tags}
            />
          )}

          {data?.result === null && !data?.pool_empty && (
            <FinishSetup project_id={project_id} refetch={refetch} />
          )}

          {/* Review finished */}
          {data?.result === null && data?.pool_empty && (
            <ReviewPageFinished mobileScreen={mobileScreen} />
          )}
        </>
      )}
    </Root>
  );
};

export default ReviewPage;
