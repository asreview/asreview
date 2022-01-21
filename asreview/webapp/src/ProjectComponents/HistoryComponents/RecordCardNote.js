import * as React from "react";
import { connect } from "react-redux";
import {
  Avatar,
  Card,
  CardContent,
  Collapse,
  Divider,
  FormControl,
  IconButton,
  OutlinedInput,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { Edit, Send } from "@mui/icons-material";
import { mapStateToProps } from "../../globals.js";
import ElasAvatar from "../../images/ElasAvatar.svg";

const Root = styled("div")(({ theme }) => ({}));

const RecordCardNote = (props) => {
  const handleClickEditNote = (prevNote, doc_id) => {
    props.setNote({
      data: prevNote,
      editing: doc_id,
    });
  };

  const handleClickSaveNote = (prevNote) => {
    if (props.note?.data !== prevNote) {
      props.mutate({
        project_id: props.project_id,
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
      <Collapse in={props.record?.note !== null} timeout="auto" unmountOnExit>
        <Divider />
        <CardContent sx={{ padding: "24px 16px 24px 24px" }}>
          <Stack direction="row" spacing={3}>
            <Avatar
              alt="user"
              src={ElasAvatar}
              size={50}
              sx={{
                width: 56,
                height: 56,
                bgcolor: (theme) =>
                  theme.palette.mode === "dark" ? "grey.600" : "grey.400",
              }}
              imgProps={{ sx: { p: 1 } }}
            />
            <Stack
              direction="row"
              spacing={2}
              sx={{ alignItems: "center", width: "100%" }}
            >
              {props.note?.editing === props.record?.id && (
                <FormControl sx={{ width: "100%" }} variant="outlined">
                  <OutlinedInput
                    autoFocus
                    multiline
                    value={props.note?.data}
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
              )}
              {props.note?.editing !== props.record?.id && (
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
              )}
              {props.note?.editing !== props.record?.id && (
                <Tooltip
                  title={
                    !disableEditNoteButton()
                      ? "Edit note"
                      : "Save another note before editing"
                  }
                >
                  <span>
                    <IconButton
                      disabled={disableEditNoteButton()}
                      onClick={() =>
                        handleClickEditNote(
                          props.record?.note,
                          props.record?.id
                        )
                      }
                      size="large"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              {props.note?.editing === props.record?.id && (
                <Tooltip title="Save note">
                  <span>
                    <IconButton
                      disabled={props.isLoading}
                      onClick={() => handleClickSaveNote(props.record?.note)}
                      size="large"
                    >
                      <Send fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Collapse>
    </Root>
  );
};

export default connect(mapStateToProps)(RecordCardNote);
