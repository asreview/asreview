import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import { Box, Fade } from "@mui/material";
import { styled } from "@mui/material/styles";

import { ActionsFeedbackBar } from "Components";
import { RecordCard, ReviewPageFinished } from ".";

import { ProjectAPI } from "api";
// import { useKeyPress } from "hooks/useKeyPress";

import "./ReviewPage.css";
import FinishSetup from "./ReviewPageTraining";

const Root = styled("div")(({ theme }) => ({
  // height: "100%",
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
            keyPressEnabled={props.keyPressEnabled}
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
  keyPressEnabled,
  tags,
}) => {
  const [record, setRecord] = React.useState(null);

  /* fetch the record and check if the project is training */
  const { refetch } = useQuery(
    ["fetchRecord", { project_id }],
    ProjectAPI.fetchRecord,
    {
      refetchOnWindowFocus: false,
      retry: false,
      refetchInterval: 4000,
      refetchIntervalInBackground: true,
      // enabled only during the training phase
      enabled:
        record === null ||
        (record?.result === null &&
          !record?.has_ranking &&
          !record?.pool_empty),
      onSuccess: (data) => {
        setRecord(data);
      },
    },
  );

  return (
    <Root aria-label="review page">
      {record?.result === null &&
        !record?.has_ranking &&
        !record?.pool_empty && (
          <FinishSetup project_id={project_id} refetch={refetch} />
        )}

      {record?.result !== null &&
        record?.has_ranking &&
        !record?.pool_empty && (
          <Screener
            record={record}
            mobileScreen={mobileScreen}
            fontSize={fontSize}
            undoEnabled={undoEnabled}
            keyPressEnabled={keyPressEnabled}
            tags={tags}
          />
        )}

      {/* Review finished */}
      {record?.result === null &&
        !record?.has_ranking &&
        record?.pool_empty && (
          <ReviewPageFinished mobileScreen={mobileScreen} />
        )}
    </Root>
  );
};

export default ReviewPage;
