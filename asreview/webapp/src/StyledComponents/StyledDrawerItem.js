import {
  alpha,
  Box,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

export const DrawerItem = ({
  icon,
  primary,
  rail = true,
  ...itemButtomProps
}) => {
  return (
    <ListItemButton
      {...itemButtomProps}
      sx={(theme) => ({
        p: 1,
        ".MuiBox-root": {
          borderRadius: "20px",
          height: "32px",
          p: 0.5,
          m: 0.5,
        },
        "&:hover": {
          ".MuiBox-root": {
            bgcolor: alpha(theme.palette.primary.main, 0.2),
          },
          bgcolor: "transparent",
        },
        "&.active": {
          ".MuiBox-root": {
            bgcolor: alpha(theme.palette.secondary.light, 0.6),
          },
          ".MuiTypography-root": {
            fontWeight: "bold",
          },
        },
      })}
      disableRipple={true}
    >
      {!rail && (
        <>
          <ListItemIcon sx={{ pl: 1 }}>{icon}</ListItemIcon>
          <ListItemText primary={primary} />
        </>
      )}
      {rail && (
        <ListItemText
          primary={
            <>
              <Box>{icon}</Box>
              <Typography variant="body2" fontSize={"0.8rem"}>
                {primary}
              </Typography>
            </>
          }
          sx={{
            textAlign: "center",
          }}
        />
      )}
    </ListItemButton>
  );
};
