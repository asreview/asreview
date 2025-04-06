import { Close } from "@mui/icons-material";
import { Dialog, DialogTitle, IconButton, Stack } from "@mui/material";

export function StyledDialog(props) {
  return (
    <Dialog {...props} slotProps={{ paper: { sx: { overflowY: "clip" } } }}>
      {!props.fullScreen && (
        <IconButton
          edge="end"
          color="inherit"
          onClick={props.onClose}
          aria-label="close"
          size="small"
          sx={{
            position: "absolute",
            right: -42,
            top: 16,
            color: "white",
            bgcolor: "black",
            opacity: 0.4,
            zIndex: 0,
          }}
        >
          <Close fontSize="inherit" />
        </IconButton>
      )}
      {props.title && props.fullScreen && (
        <DialogTitle>
          <Stack direction="row" justify="space-between" alignItems="center">
            <IconButton onClick={props.onClose}>
              <Close />
            </IconButton>
            {props.title}
          </Stack>
        </DialogTitle>
      )}
      {props.title && !props.fullScreen && (
        <DialogTitle>{props.title}</DialogTitle>
      )}

      {props.children}
    </Dialog>
  );
}
