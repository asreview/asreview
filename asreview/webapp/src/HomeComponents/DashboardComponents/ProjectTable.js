import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import * as React from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "react-query";
import { connect, useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { DialogErrorHandler } from "Components";
import { ProjectDeleteDialog } from "ProjectComponents";
import { SetupDialog } from "ProjectComponents/SetupComponents";
import { ProjectAPI } from "api";
import {
  checkIfSimulationFinishedDuration,
  formatDate,
  mapDispatchToProps,
  projectModes,
  projectStatuses,
} from "globals.js";
import { useRowsPerPage } from "hooks/SettingsHooks";
import useAuth from "hooks/useAuth";
import { useToggle } from "hooks/useToggle";
import { setMyProjects } from "redux/actions";
import { ProjectCheckDialog, TableRowButton } from ".";

const PREFIX = "ProjectTable";

const classes = {
  root: `${PREFIX}-root`,
  error: `${PREFIX}-error`,
  table: `${PREFIX}-table`,
  tableCell: `${PREFIX}-tableCell`,
  converting: `${PREFIX}-converting`,
  img: `${PREFIX}-img`,
  title: `${PREFIX}-title`,
  titleWrapper: `${PREFIX}-title-wrapper`,
  loadingProjects: `${PREFIX}-loading-projects`,
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  [`&.${classes.root}`]: {
    width: "100%",
    borderRadius: 16,
    marginBottom: 64,
  },

  [`& .${classes.error}`]: {
    display: "flex",
    justifyContent: "center",
    paddingTop: 64,
    paddingBottom: 132,
  },

  [`& .${classes.table}`]: {
    minWidth: 700,
  },

  [`& .${classes.tableCell}`]: {
    letterSpacing: "0.25px",
  },

  [`& .${classes.converting}`]: {
    display: "flex",
    alignItems: "center",
  },

  [`& .${classes.title}`]: {
    cursor: "pointer",
    display: "-webkit-box",
    letterSpacing: "0.25px",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 1,
    whiteSpace: "pre-line",
    overflow: "hidden",
  },

  [`& .${classes.titleWrapper}`]: {
    display: "flex",
    alignItems: "center",
    width: "100%",
  },

  [`& .${classes.loadingProjects}`]: {
    display: "flex",
    justifyContent: "center",
    paddingTop: 64,
    paddingBottom: 248,
  },
}));

const columns = [
  { id: "name", label: "Project", width: "55%" },
  { id: "created_at_unix", label: "Date", width: "15%" },
  { id: "status", label: "Status", width: "15%" },
];

const StatusChip = ({ status }) => {
  switch (status) {
    case projectStatuses.SETUP:
      return (
        <Chip
          size="small"
          label="Setup"
          sx={{ color: "#424242", backgroundColor: "#bdbdbd" }}
        />
      );
    case projectStatuses.REVIEW:
      return (
        <Chip
          size="small"
          label="In Review"
          sx={{ color: "#91620b", backgroundColor: "#fffbe7" }}
        />
      );
    case projectStatuses.FINISHED:
      return (
        <Chip
          size="small"
          label="Finished"
          sx={{ color: "#007b55", backgroundColor: "#e1fae3" }}
        />
      );
    default:
      return;
  }
};

const ProjectTable = (props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const myProjects = useSelector((state) => state.myProjects);
  const dispatch = useDispatch();
  const { auth } = useAuth();

  const [page] = React.useState(0);
  const [rowsPerPage] = useRowsPerPage();
  const [setupDialogState, setSetupDialogState] = React.useState({
    open: false,
    project_info: null,
  });

  /**
   * Dialog state
   */
  const [onDeleteDialog, toggleDeleteDialog] = useToggle();

  /**
   * Simulation status query state
   */
  const [querySimulationFinished, setQuerySimulationFinished] = React.useState(
    [],
  );
  const [querySimulationError, setQuerySimulationError] = React.useState({
    isError: false,
    message: null,
  });

  /**
   * Fetch projects and check if simulation running in the background
   */
  const { isError, isFetched, isFetching, isSuccess } = useQuery(
    ["fetchProjects", { subset: props.mode }],
    ProjectAPI.fetchProjects,
    {
      onError: () => {
        setQuerySimulationFinished([]);
      },
      onSuccess: (data) => {
        // set in redux store
        dispatch(setMyProjects(data.result));
        // reset query for fetching simulation project(s) status
        setQuerySimulationFinished([]);
        // get simulation project(s) running in the background
        const simulationProjects = data.result.filter(
          (element) =>
            element.mode === projectModes.SIMULATION &&
            element.reviews[0] !== undefined &&
            element.reviews[0].status === projectStatuses.REVIEW,
        );
        if (!simulationProjects.length) {
          console.log("No simulation running");
        } else {
          const simulationQueries = [];
          const project_id = simulationProjects.map((element) => element.id);
          // prepare query array for fetching simulation project(s) status
          for (let key in project_id) {
            // reset query if error
            if (querySimulationError.isError) {
              queryClient.resetQueries(`fetchProjectStatus-${project_id[key]}`);
              setQuerySimulationError({
                isError: false,
                message: null,
              });
            }
            // update query array
            simulationQueries.push({
              queryKey: [
                `fetchProjectStatus-${project_id[key]}`,
                { project_id: project_id[key] },
              ],
              queryFn: ProjectAPI.fetchProjectStatus,
              enabled: project_id[key] !== null,
              onError: (error) => {
                setQuerySimulationError({
                  isError: true,
                  message: error.message,
                });
              },
              onSuccess: (data) => {
                if (data["status"] === projectStatuses.FINISHED) {
                  // simulation finished
                  queryClient.invalidateQueries("fetchDashboardStats");
                  // update cached data
                  queryClient.setQueryData("fetchProjects", (prev) => {
                    return {
                      ...prev,
                      result: prev.result.map((project) => {
                        return {
                          ...project,
                          reviews: project.reviews.map((review) => {
                            return {
                              ...review,
                              status:
                                project.id === project_id[key]
                                  ? projectStatuses.FINISHED
                                  : review.status,
                            };
                          }),
                        };
                      }),
                    };
                  });
                } else {
                  // not finished yet
                  setTimeout(
                    () =>
                      queryClient.invalidateQueries(
                        `fetchProjectStatus-${project_id[key]}`,
                      ),
                    checkIfSimulationFinishedDuration,
                  );
                }
              },
              refetchOnWindowFocus: false,
            });
          }
          // pass prepared query array
          setQuerySimulationFinished(simulationQueries);
        }
      },
      refetchOnWindowFocus: false,
    },
  );

  /**
   * Fetch if simulation project(s) finished
   */
  useQueries(querySimulationFinished);

  const { mutate: mutateStatus } = useMutation(ProjectAPI.mutateProjectStatus, {
    onError: (error) => {
      props.setFeedbackBar({
        open: true,
        message: error.message,
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries("fetchDashboardStats");
      // update cached data
      queryClient.setQueryData("fetchProjects", (prev) => {
        return {
          ...prev,
          result: prev.result.map((project) => {
            return {
              ...project,
              reviews: project.reviews.map((review) => {
                return {
                  ...review,
                  status:
                    project.id === variables.project_id
                      ? variables.status
                      : review.status,
                };
              }),
            };
          }),
        };
      });
    },
  });

  const handleChangeStatus = (project) => {
    mutateStatus({
      project_id: project["id"],
      status:
        project.reviews[0].status === projectStatuses.REVIEW
          ? projectStatuses.FINISHED
          : projectStatuses.REVIEW,
    });
  };

  const openProject = (project, path) => {
    if (project["reviews"][0]["status"] === projectStatuses.SETUP) {
      setSetupDialogState({
        open: true,
        project_info: project,
      });
    } else if (!project["projectNeedsUpgrade"]) {
      // open project page
      navigate(`/projects/${project["id"]}/${path}`);
    } else {
      // open project check dialog
      props.setProjectCheck({
        open: true,
        issue: "upgrade",
        path: path,
        project_id: project["id"],
      });
    }
  };

  return (
    <StyledPaper elevation={2} className={classes.root}>
      <TableContainer>
        <Table className={classes.table} stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} style={{ width: column.width }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {!isError &&
              !isFetching &&
              isFetched &&
              isSuccess &&
              myProjects
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  // if we do authentication, then we need to know who the owner is
                  row["owner_id"] =
                    window.authenticated && "owner_id" in row
                      ? row["owner_id"]
                      : false;
                  // A collaborator can not edit
                  const isOwner =
                    window.authenticated && row["owner_id"] === auth.id;

                  const isSimulating = () => {
                    return (
                      row["mode"] === projectModes.SIMULATION &&
                      row["reviews"][0] !== undefined &&
                      row["reviews"][0]["status"] === projectStatuses.REVIEW
                    );
                  };

                  const showReviewButton = () => {
                    return (
                      row["reviews"][0] !== undefined &&
                      row["reviews"][0]["status"] === projectStatuses.REVIEW
                    );
                  };

                  const disableProjectStatusChange = () => {
                    return (
                      row["projectNeedsUpgrade"] ||
                      row["mode"] === projectModes.SIMULATION ||
                      row["reviews"][0] === undefined ||
                      row["reviews"][0]["status"] === projectStatuses.SETUP ||
                      row["reviews"][0]["status"] === projectStatuses.ERROR
                    );
                  };

                  const onClickProjectExport = () => {
                    if (row["reviews"][0]["status"] === projectStatuses.SETUP) {
                      queryClient.prefetchQuery(
                        ["fetchExportProject", { project_id: row["id"] }],
                        ProjectAPI.fetchExportProject,
                      );
                    } else {
                      openProject(row, "export");
                    }
                  };

                  const onClickProjectDetails = () => {
                    openProject(row, "details");
                  };

                  const updateProjectStatus = () => {
                    handleChangeStatus(row);
                  };
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      <TableCell sx={{ display: "flex" }}>
                        <Box className={classes.titleWrapper}>
                          <Typography
                            onClick={() => {
                              openProject(row, "");
                            }}
                            className={classes.title}
                            variant="subtitle1"
                          >
                            {row["name"]}
                          </Typography>
                          <Box sx={{ flex: 1 }}></Box>
                          <TableRowButton
                            disableProjectStatusChange={
                              disableProjectStatusChange
                            }
                            isSimulating={isSimulating}
                            isOwner={isOwner}
                            showReviewButton={showReviewButton}
                            onClickCollaboration={() => {
                              openProject(row, "team");
                            }}
                            onClickEndCollaboration={() => {
                              openProject(row, "team");
                            }} /* !!!!!!!!! */
                            onClickProjectReview={() => {
                              openProject(row, "review");
                            }}
                            onClickProjectExport={onClickProjectExport}
                            onClickProjectDetails={onClickProjectDetails}
                            projectStatus={row["reviews"][0]["status"]}
                            toggleDeleteDialog={toggleDeleteDialog}
                            updateProjectStatus={updateProjectStatus}
                            //canEdit={canEdit}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          className={classes.tableCell}
                          variant="subtitle1"
                          noWrap
                        >
                          {formatDate(row["created_at_unix"])}
                        </Typography>
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        <StatusChip
                          size="small"
                          status={row["reviews"][0]["status"]}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
        {/* {!isError && isFetching && (
          <Box className={classes.loadingProjects}>
            <CircularProgress />
          </Box>
        )} */}
        {/* {!isError &&
          !isFetching &&
          isFetched &&
          isSuccess &&
          myProjects.length === 0 && (
            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography sx={{ color: "text.secondary", marginTop: "64px" }}>
                Start your first {modeLabel.toLowerCase()} project
              </Typography>
              <Button
                id="get-started"
                onClick={() => {
                  // props.openDataPick(props.mode);
                }}
              >
                Start
              </Button>
            </Box>
          )} */}
        {/* {isError && !isFetching && (
          <Box className={classes.error}>
            <BoxErrorHandler error={error} queryKey="fetchProjects" />
          </Box>
        )} */}
      </TableContainer>
      {/* {!isError &&
        !isFetching &&
        isFetched &&
        isSuccess &&
        myProjects.length !== 0 && (
          <TablePagination
            rowsPerPageOptions={[15, 30, 100]}
            component="div"
            count={myProjects.length}
            rowsPerPage={rowsPerPage}
            labelRowsPerPage="Projects per page:"
            page={page}
            onPageChange={handlePage}
            onRowsPerPageChange={setRowsPerPage}
          />
        )} */}
      <SetupDialog
        projectInfo={setupDialogState.project_info}
        mode={props.mode}
        mobileScreen={props.mobileScreen}
        open={setupDialogState.open}
        onClose={() => {
          setSetupDialogState({ open: false, project_info: null });
        }}
        setFeedbackBar={props.setFeedbackBar}
        key={"setup-dialog-" + setupDialogState.project_info?.id}
      />
      <ProjectCheckDialog
        projectCheck={props.projectCheck}
        setProjectCheck={props.setProjectCheck}
      />
      <ProjectDeleteDialog
        onDeleteDialog={onDeleteDialog}
        toggleDeleteDialog={toggleDeleteDialog}
        projectTitle={null}
        project_id={null}
      />
      <DialogErrorHandler
        error={querySimulationError}
        isError={querySimulationError.isError}
        queryKey="fetchProjects"
      />
    </StyledPaper>
  );
};

export default connect(null, mapDispatchToProps)(ProjectTable);
