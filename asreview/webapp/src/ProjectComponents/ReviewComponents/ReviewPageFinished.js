import React from "react";
import { useMutation, useQueryClient } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Fade, Link, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import { ProjectAPI } from "api";
import { projectStatuses } from "globals.js";
import ElasFinished from "images/ElasFinished.svg";

const PREFIX = "ReviewPageFinished";

const classes = {
  img: `${PREFIX}-img`,
  textTitle: `${PREFIX}-textTitle`,
  text: `${PREFIX}-text`,
};

const Root = styled("div")(({ theme }) => ({
  height: "inherit",
  [`& .${classes.img}`]: {
    maxWidth: 350,
    [theme.breakpoints.down("md")]: {
      maxWidth: 250,
    },
  },
  [`& .${classes.textTitle}`]: {
    textAlign: "center",
    [theme.breakpoints.down("md")]: {
      width: "80%",
    },
  },
  [`& .${classes.text}`]: {
    textAlign: "center",
    width: "60%",
    [theme.breakpoints.down("md")]: {
      width: "80%",
    },
  },
}));

const ReviewPageFinished = (props) => {
  const navigate = useNavigate();
  const { project_id } = useParams();
  const queryClient = useQueryClient();

  const [recordEmpty, setRecordEmpty] = React.useState(false);

  const { mutate } = useMutation(ProjectAPI.mutateReviewStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries("fetchInfo");
    },
  });

  const handleChangeStatus = () => {
    mutate({
      project_id,
      status: projectStatuses.REVIEW,
    });
  };

  const handleClickExport = () => {
    navigate(`export`);
  };

  const ifRecordPoolEmpty = React.useCallback(async () => {
    const data = await queryClient.fetchQuery(
      ["fetchRecord", { project_id }],
      ProjectAPI.fetchRecord,
    );
    setRecordEmpty(data["pool_empty"]);
  }, [project_id, queryClient]);

  React.useEffect(() => {
    ifRecordPoolEmpty();
  }, [ifRecordPoolEmpty]);

  return (
    <Root aria-label="review page finished">
      <Fade in>
        <Stack
          spacing={1}
          sx={{
            alignItems: "center",
            height: "inherit",
            justifyContent: "center",
          }}
        >
          <img src={ElasFinished} alt="ElasFinished" className={classes.img} />
          {!recordEmpty && (
            <Stack spacing={1} sx={{ alignItems: "center" }}>
              <Typography className={classes.textTitle} variant="h5">
                Congratulations! You have finished this project.
              </Typography>
              <Typography className={classes.text}>
                You have stopped reviewing and marked this project as finished.{" "}
                <Link
                  component="button"
                  variant="body1"
                  onClick={handleChangeStatus}
                >
                  Resume the review
                </Link>
              </Typography>
            </Stack>
          )}
          {recordEmpty && (
            <Stack spacing={3} sx={{ alignItems: "center" }}>
              <Typography className={classes.textTitle} variant="h5">
                Congratulations! You have reviewed all the records.
              </Typography>
              <Button onClick={handleClickExport}>Export results</Button>
            </Stack>
          )}
        </Stack>
      </Fade>
    </Root>
  );
};

export default ReviewPageFinished;
