import { useMediaQuery } from "@mui/material";
import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";

import { RecordCard, ReviewPageFinished } from ".";
import { Container } from "@mui/material";

import { ProjectAPI } from "api";

import FinishSetup from "./ReviewPageTraining";

const Screener = (props) => {
  const { project_id } = useParams();
  const queryClient = useQueryClient();

  const [tagValues, setTagValues] = React.useState({});

  const { data } = useQuery(
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
    <>
      {data["result"] && (
        <RecordCard
          project_id={project_id}
          record={data["result"]}
          afterDecision={afterDecision}
          fontSize={props.fontSize}
          showBorder={props.showBorder}
          tagValues={tagValues}
          setTagValues={setTagValues}
          collapseAbstract={false}
          hotkeys={true}
          key={project_id + "-" + data["result"]["record_id"]}
        />
      )}
    </>
  );
};

const ReviewPage = ({ fontSize }) => {
  let { project_id } = useParams();

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
    <Container aria-label="review page" maxWidth="md" sx={{ mt: 6 }}>
      {isSuccess && (
        <>
          {data?.result !== null && (
            <Screener
              record={data}
              fontSize={fontSize}
              showBorder={showBorder}
            />
          )}

          {data?.result === null && !data?.pool_empty && (
            <FinishSetup project_id={project_id} refetch={refetch} />
          )}

          {/* Review finished */}
          {data?.result === null && data?.pool_empty && <ReviewPageFinished />}
        </>
      )}
    </Container>
  );
};

export default ReviewPage;
