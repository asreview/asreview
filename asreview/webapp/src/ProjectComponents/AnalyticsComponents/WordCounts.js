import {
  Card,
  CardContent,
  CardHeader,
  Grid2 as Grid,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { ProjectAPI } from "api";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

const WordCounts = () => {
  const { project_id } = useParams();

  const { data } = useQuery(
    ["fetchWordCounts", { project_id }],
    ProjectAPI.fetchWordCounts,
    {
      refetchOnWindowFocus: false,
    },
  );

  return (
    <Card>
      <CardHeader title="Words of importance" />
      <CardContent>
        <Grid container spacing={2} columns={2}>
          <Grid size={1}>
            <Typography sx={{ my: 2 }} variant="h6" component="div">
              Words in relevant records
            </Typography>
            {data && data.relevant.length !== 0 ? (
              <List dense={true}>
                {Object.entries(data.relevant).map(([count, word]) => (
                  <ListItem key={word}>{word}</ListItem>
                ))}
              </List>
            ) : (
              <Typography>No word available.</Typography>
            )}
          </Grid>
          <Grid size={1}>
            <Typography sx={{ my: 2 }} variant="h6" component="div">
              Words in not relevant records
            </Typography>
            {data && data.irrelevant.length !== 0 ? (
              <List dense={true}>
                {Object.entries(data.irrelevant).map(([count, word]) => (
                  <ListItem key={word}>{word}</ListItem>
                ))}
              </List>
            ) : (
              <Typography>No word available.</Typography>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default WordCounts;
