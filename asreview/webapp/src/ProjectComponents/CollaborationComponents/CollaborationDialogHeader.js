import {
  DialogTitle,
  Stack,
  Tooltip,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { StyledIconButton } from "../../StyledComponents/StyledButton.js";


const CollaborationDialogHeader = (props) => {
  return (
    <Stack className="dialog-header" direction="row">
      <DialogTitle>{props.title}</DialogTitle>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Stack
          className="dialog-header-button right"
          direction="row"
          spacing={1}
        >
          <Tooltip title="Close">
            <StyledIconButton onClick={props.handleClose}>
              <Close />
            </StyledIconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Stack>
  )
}

export default CollaborationDialogHeader;