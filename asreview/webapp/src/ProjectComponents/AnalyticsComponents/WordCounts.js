import {
  Card,
  CardContent,
  Grid2 as Grid,
  List,
  ListItem,
  Typography,
  Box,
} from "@mui/material";

const WordCounts = () => {
  const mockData = {
    relevant: [
      { word: "PTSD", count: 120 },
      { word: "trauma", count: 85 },
      { word: "veterans", count: 60 },
      { word: "warfare", count: 50 },
      { word: "combat", count: 45 },
      { word: "shellshock", count: 30 },
      { word: "WWII", count: 25 },
      { word: "resilience", count: 20 },
      { word: "military", count: 15 },
      { word: "treatment", count: 10 },
      { word: "anxiety", count: 8 },
      { word: "depression", count: 8 },
      { word: "recovery", count: 7 },
      { word: "exposure", count: 6 },
      { word: "posttraumatic", count: 6 },
      { word: "flashbacks", count: 5 },
      { word: "soldiers", count: 5 },
      { word: "coping", count: 4 },
      { word: "therapy", count: 4 },
      { word: "conflict", count: 3 },
    ],
    irrelevant: [
      { word: "childhood", count: 110 },
      { word: "abuse", count: 95 },
      { word: "caregiving", count: 70 },
      { word: "natural", count: 50 },
      { word: "disaster", count: 45 },
      { word: "accident", count: 40 },
      { word: "workplace", count: 30 },
      { word: "harassment", count: 20 },
      { word: "survivors", count: 15 },
      { word: "intervention", count: 12 },
      { word: "family", count: 11 },
      { word: "burnout", count: 10 },
      { word: "clinical", count: 8 },
      { word: "trauma-informed", count: 7 },
      { word: "refugees", count: 6 },
      { word: "community", count: 5 },
      { word: "disaster-prone", count: 4 },
      { word: "pandemic", count: 4 },
      { word: "resilience-building", count: 3 },
      { word: "cultural", count: 3 },
    ],
  };

  const renderWordList = (data, color) => (
    <List dense={true}>
      {data.map(({ word, count }) => (
        <ListItem
          key={word}
          sx={{
            display: "flex",
            alignItems: "center",
            padding: "4px 0",
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              bgcolor: color,
              color: "white",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "bold",
              mr: 2,
            }}
          >
            {count}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {word}
          </Typography>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Card sx={{ backgroundColor: "transparent" }}>
      <CardContent>
        <Grid container spacing={{ xs: 4, md: 28 }}>
          {/* Relevant Words */}
          <Grid item xs={12} md={6}>
            <Typography sx={{ my: 2 }} variant="h6" component="div">
              Words in relevant records
            </Typography>
            {mockData.relevant.length !== 0 ? (
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  {renderWordList(mockData.relevant.slice(0, 10), "grey.600")}
                </Grid>
                <Grid item xs={6}>
                  {renderWordList(mockData.relevant.slice(10), "grey.600")}
                </Grid>
              </Grid>
            ) : (
              <Typography>No word available.</Typography>
            )}
          </Grid>

          {/* Irrelevant Words */}
          <Grid item xs={12} md={6}>
            <Typography sx={{ my: 2 }} variant="h6" component="div">
              Words in not relevant records
            </Typography>
            {mockData.irrelevant.length !== 0 ? (
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  {renderWordList(mockData.irrelevant.slice(0, 10), "primary.main")}
                </Grid>
                <Grid item xs={6}>
                  {renderWordList(mockData.irrelevant.slice(10), "primary.main")}
                </Grid>
              </Grid>
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
