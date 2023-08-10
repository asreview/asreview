import * as React from "react";
import { useParams } from "react-router-dom";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  Collapse,
  FormControl,
  OutlinedInput,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import ElasAvatar from "../../images/ElasAvatar.svg";

const Root = styled("div")(({ theme }) => ({}));

const RecordCardNote = (props) => {
  const { project_id } = useParams();

  const handleClickEditNote = (prevNote, doc_id) => {
    props.setNote({
      data: prevNote,
      editing: doc_id,
    });
  };

  const handleClickSaveNote = (prevNote) => {
    if (props.note?.data !== prevNote) {
      props.mutate({
        project_id: project_id,
        doc_id: props.record.id,
        label: props.record.included,
        note: props.note?.data,
        initial: false,
        is_prior: !props.is_prior ? 0 : 1,
      });
    } else {
      props.setNote({
        data: null,
        editing: null,
      });
    }
  };

  const handleChangeNote = (event) => {
    props.setNote((s) => {
      return {
        ...s,
        data: event.target.value,
      };
    });
  };

  const disableEditNoteButton = () => {
    return (
      props.note?.editing !== null && props.note?.editing !== props.record?.id
    );
  };

  return (
    <Root>
      <Collapse
        in={
          props.record?.note !== null ||
          props.record?.id === props.note?.editing
        }
        timeout="auto"
        unmountOnExit
      >
        <CardContent sx={{ padding: "16px 16px 24px 24px" }}>
          <Stack direction="row" spacing={!props.mobileScreen ? 3 : 2}>
            <Avatar
              alt="user"
              src={ElasAvatar}
              sx={{
                width: !props.mobileScreen ? 56 : 40,
                height: !props.mobileScreen ? 56 : 40,
                bgcolor: (theme) =>
                  theme.palette.mode === "dark" ? "grey.600" : "grey.400",
              }}
              imgProps={{ sx: { p: 1 } }}
            />
            {props.note?.editing === props.record?.id && (
              <Stack
                direction="row"
                spacing={!props.mobileScreen ? 2 : 1}
                sx={{ alignItems: "baseline", width: "100%" }}
              >
                <FormControl sx={{ width: "100%" }} variant="outlined">
                  <OutlinedInput
                    autoComplete="off"
                    disabled={props.isLoading}
                    multiline
                    placeholder="Write something..."
                    value={!props.note?.data ? "" : props.note?.data}
                    onChange={handleChangeNote}
                    inputProps={{
                      sx: {
                        lineHeight: (theme) =>
                          theme.typography.body1.lineHeight,
                      },
                    }}
                    sx={{ p: 2 }}
                  />
                </FormControl>
                <Button
                  disabled={props.isLoading}
                  onClick={() => handleClickSaveNote(props.record?.note)}
                  size={!props.mobileScreen ? "medium" : "small"}
                >
                  Save
                </Button>
              </Stack>
            )}
            {props.record?.note && props.note?.editing !== props.record?.id && (
              <Stack
                direction="row"
                spacing={!props.mobileScreen ? 2 : 1}
                sx={{ alignItems: "baseline", width: "100%" }}
              >
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    width: "100%",
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "background.paper"
                        : "grey.100",
                  }}
                >
                  <CardContent sx={{ pb: "16px !important" }}>
                    <Typography sx={{ color: "text.secondary" }}>
                      {props.record?.note}
                    </Typography>
                  </CardContent>
                </Card>
                <Tooltip
                  title={
                    !disableEditNoteButton()
                      ? ""
                      : "Save another note before editing"
                  }
                >
                  <span>
                    <Button
                      disabled={disableEditNoteButton()}
                      onClick={() =>
                        handleClickEditNote(
                          props.record?.note,
                          props.record?.id,
                        )
                      }
                      size={!props.mobileScreen ? "medium" : "small"}
                    >
                      Edit
                    </Button>
                  </span>
                </Tooltip>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Collapse>
    </Root>
  );
};

export default RecordCardNote;
