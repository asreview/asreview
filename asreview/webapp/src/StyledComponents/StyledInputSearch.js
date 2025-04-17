import { IconButton, InputBase, Paper } from "@mui/material";

export const StyledInputSearch = ({
  endIcon,
  disabled = false,
  onClick = null,
  loading = false,
  ...props
}) => {
  const onKeyEnter = (event) => {
    if (event.keyCode === 13) {
      onClick(event);
    }
  };

  return (
    <Paper
      component="form"
      noValidate
      autoComplete="off"
      onSubmit={(e) => e.preventDefault()}
      variant="outlined"
      sx={{
        px: 2,
        py: 1,
        display: "flex",
        bgcolor: "paper.background",
        borderRadius: 10,
      }}
    >
      <InputBase
        {...props}
        disabled={disabled}
        fullWidth
        onKeyDown={onKeyEnter}
        sx={{ ml: 1, flex: 1 }}
      />
      <IconButton disabled={disabled} onClick={onClick} loading={loading}>
        {endIcon}
      </IconButton>
    </Paper>
  );
};
