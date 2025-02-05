import React, { useState, useEffect } from "react";
import { Typography, Box } from "@mui/material";
import { ProjectAPI } from "api";

const RankingJourney = ({ project_id, record_id }) => {
  const [rankingHistory, setRankingHistory] = useState("");

  console.log("Rendering RankingJourney for record_id:", record_id); // Debug log

  useEffect(() => {
    console.log("useEffect triggered for record_id:", record_id); // Debug log
    // Fetch ranking history for the record
    if (record_id && project_id) {
      console.log("Fetching ranking history for record_id:", record_id); // Debug log
      ProjectAPI.fetchRankingHistory({ project_id, record_id })
        .then((data) => {
          console.log("Ranking history data:", data); // Debug log
          setRankingHistory(data.ranking_history);
        })
        .catch((error) => {
          console.error("Error fetching ranking history:", error);
        });
    }
  }, [project_id, record_id]);

  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
        Ranking Journey
      </Typography>
      <Typography variant="body1" sx={{ color: "text.secondary" }}>
        {rankingHistory || "No ranking history available."}
      </Typography>
    </Box>
  );
};

export default RankingJourney;
