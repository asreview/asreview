import * as React from "react";
import { useQuery, useQueryClient } from "react-query";
import { connect } from "react-redux";
import {
  Box,
  Card,
  CircularProgress,
  Divider,
  Fade,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ArrowBack } from "@mui/icons-material";

import { InfoCard } from "../../SetupComponents";
import { InlineErrorHandler } from "../../../Components";
import { EnoughPriorBanner, PriorUnlabeled } from "../DataComponents";
import { StyledIconButton } from "../../../StyledComponents/StyledButton";
import { ProjectAPI } from "../../../api/index.js";
import { mapStateToProps, projectModes } from "../../../globals.js";
import { useToggle } from "../../../hooks/useToggle";

const PREFIX = "PriorRandom";

const classes = {
  recordCard: `${PREFIX}-record-card`,
  infoCard: `${PREFIX}-info-card`,
  empty: `${PREFIX}-empty`,
  loading: `${PREFIX}-loading`,
  select: `${PREFIX}-select`,
};

const Root = styled("div")(({ theme }) => ({
  width: "50%",
  [`& .${classes.recordCard}`]: {
    alignItems: "center",
    height: "calc(100vh - 208px)",
    width: "100%",
    overflowY: "scroll",
    padding: "32px 24px",
  },

  [`& .${classes.infoCard}`]: {
    width: "100%",
    maxWidth: "400px",
  },

  [`& .${classes.empty}`]: {
    height: "calc(100% - 56px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  [`& .${classes.loading}`]: {
    height: "calc(100% - 56px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  [`& .${classes.select}`]: {
    alignItems: "center",
    marginLeft: 8,
    width: "100%",
  },
}));

const PriorRandom = (props) => {
  const queryClient = useQueryClient();
  const [reminder, toggleReminder] = useToggle();
  const [refresh, setRefresh] = React.useState(true);
  const [nRecords, setNRecords] = React.useState(5);
  const [subset, setSubset] = React.useState("relevant");

  const { data, error, isError, isFetched, isFetching, isSuccess } = useQuery(
    [
      "fetchPriorRandom",
      {
        project_id: props.project_id,
        n: nRecords,
        subset: props.mode !== projectModes.ORACLE ? subset : null,
      },
    ],
    ProjectAPI.fetchPriorRandom,
    {
      enabled: refresh,
      onSuccess: () => {
        setRefresh(false);
      },
      refetchOnWindowFocus: false,
    }
  );

  const handleNRecordsChange = (event) => {
    setNRecords(event.target.value);
    setRefresh(true);
  };

  const handleSubsetChange = (event) => {
    setSubset(event.target.value);
    setRefresh(true);
  };

  const refetchPriorRandom = () => {
    queryClient.resetQueries("fetchPriorRandom");
  };

  const onClickPriorSearch = () => {
    props.toggleSearch();
    props.toggleRandom();
  };

  React.useEffect(() => {
    if (
      props.mode === projectModes.ORACLE &&
      props.n_prior_exclusions !== 0 &&
      props.n_prior_exclusions % 5 === 0
    ) {
      toggleReminder();
    }
  }, [props.mode, props.n_prior_exclusions, toggleReminder]);

  React.useEffect(() => {
    if (
      data?.result.length &&
      !data?.result.filter((record) => record?.included === null).length
    ) {
      setRefresh(true);
    }
  }, [data?.result]);

  return (
    <Root>
      <Fade in>
        <Card
          elevation={0}
          square
          variant="outlined"
          sx={{ height: "100%", bgcolor: "transparent" }}
        >
          <Stack direction="row" sx={{ p: "4px 16px" }}>
            <Tooltip title="Select another way">
              <StyledIconButton onClick={props.toggleRandom}>
                <ArrowBack />
              </StyledIconButton>
            </Tooltip>
            <Stack className={classes.select} direction="row" spacing={1}>
              <Typography sx={{ color: "text.secondary" }}>Show</Typography>
              <FormControl variant="standard" sx={{ width: "48px" }}>
                <Select value={nRecords} onChange={handleNRecordsChange}>
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={4}>4</MenuItem>
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={6}>6</MenuItem>
                  <MenuItem value={7}>7</MenuItem>
                  <MenuItem value={8}>8</MenuItem>
                  <MenuItem value={9}>9</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                </Select>
              </FormControl>
              <Typography sx={{ color: "text.secondary" }}>
                {props.mode === projectModes.ORACLE
                  ? "random records"
                  : "random"}
              </Typography>
              {props.mode !== projectModes.ORACLE && (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <FormControl variant="standard" sx={{ width: "96px" }}>
                    <Select value={subset} onChange={handleSubsetChange}>
                      <MenuItem value="relevant">relevant</MenuItem>
                      <MenuItem value="irrelevant">irrelevant</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography sx={{ color: "text.secondary" }}>
                    records
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Stack>
          <Divider />
          {isFetching && !isError && (
            <Box className={classes.loading}>
              <CircularProgress />
            </Box>
          )}
          {!isFetching && isError && (
            <Box className={classes.empty}>
              <InlineErrorHandler
                message={error["message"]}
                refetch={refetchPriorRandom}
                button={true}
              />
            </Box>
          )}
          <EnoughPriorBanner
            n_prior_exclusions={props.n_prior_exclusions}
            onClickPriorSearch={onClickPriorSearch}
            reminder={reminder}
            toggleReminder={toggleReminder}
          />
          {!reminder &&
            !isError &&
            isFetched &&
            isSuccess &&
            data?.result.length !== 0 && (
              <Stack
                className={classes.recordCard}
                aria-label="unlabeled record card"
                spacing={3}
              >
                <Box className={classes.infoCard}>
                  <InfoCard info="Label records that you want to use as prior knowledge" />
                </Box>
                {data?.result
                  .filter((record) => record?.included === null)
                  .map((record, index) => (
                    <PriorUnlabeled
                      record={record}
                      mode={props.mode}
                      nRecords={nRecords}
                      subset={subset}
                      key={`result-page-${index}`}
                    />
                  ))}
              </Stack>
            )}
          {!reminder &&
            !isError &&
            isFetched &&
            isSuccess &&
            data?.result.length === 0 && (
              <Box className={classes.empty}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  No unlabeled records found
                </Typography>
              </Box>
            )}
        </Card>
      </Fade>
    </Root>
  );
};

export default connect(mapStateToProps)(PriorRandom);
