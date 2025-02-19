import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import { useTheme } from "@mui/material/styles";

export function StyledLightBulb({ size = "small" }) {
  const theme = useTheme();

  return (
    <LightbulbOutlinedIcon
      fontSize={size}
      sx={{
        color: theme.palette.text.secondary,
        ...(theme.palette.mode === "dark" && {
          "& path:first-of-type": {
            fill: theme.palette.tertiary.main,
            fillOpacity: 0.8,
          },
          filter: `drop-shadow(0px -6px 10px ${theme.palette.tertiary.main})`,
          "&:hover": {
            "& path:first-of-type": {
              fillOpacity: 1,
            },
            filter: `drop-shadow(0px 0px 8px ${theme.palette.tertiary.main})`,
          },
        }),
      }}
    />
  );
}
