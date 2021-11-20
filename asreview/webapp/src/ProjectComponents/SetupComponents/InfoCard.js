import * as React from "react";
import { Box, Card, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function InfoCard(props) {
  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: (theme) =>
          theme.palette.mode === "dark" ? "background.paper" : "grey.100",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
        <InfoOutlinedIcon
          fontSize="small"
          sx={{ color: "text.secondary", mr: 1 }}
        />
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {props.info}
        </Typography>
      </Box>
    </Card>
  );
}
