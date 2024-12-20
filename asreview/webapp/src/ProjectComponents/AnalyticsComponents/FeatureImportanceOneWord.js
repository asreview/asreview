import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  List,
  ListItem,
  TextField,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const FeatureImportanceOneWord = () => {
  const theme = useTheme();

  // Initial mock data
  const initialMockData = {
    positive: [
      { word: "veterans", coefficient: 2.5 },
      { word: "combat", coefficient: 2.3 },
      { word: "military", coefficient: 2.1 },
      { word: "warfare", coefficient: 2.0 },
      { word: "soldiers", coefficient: 1.8 },
      { word: "WWII", coefficient: 1.7 },
      { word: "shellshock", coefficient: 1.6 },
      { word: "posttraumatic", coefficient: 1.5 },
      { word: "PTSD", coefficient: 1.4 },
      { word: "resilience", coefficient: 1.2 },
      { word: "deployment", coefficient: 1.1 },
      { word: "treatment", coefficient: 1.0 },
      { word: "anxiety", coefficient: 0.9 },
      { word: "recovery", coefficient: 0.8 },
      { word: "exposure", coefficient: 0.7 },
      { word: "flashbacks", coefficient: 0.6 },
      { word: "trauma", coefficient: 0.5 },
      { word: "therapy", coefficient: 0.4 },
      { word: "stress", coefficient: 0.3 },
      { word: "conflict", coefficient: 0.2 },
    ],
    negative: [
      { word: "childhood", coefficient: -2.5 },
      { word: "abuse", coefficient: -2.3 },
      { word: "disaster", coefficient: -2.1 },
      { word: "accident", coefficient: -2.0 },
      { word: "harassment", coefficient: -1.8 },
      { word: "refugees", coefficient: -1.7 },
      { word: "pandemic", coefficient: -1.6 },
      { word: "community", coefficient: -1.5 },
      { word: "family", coefficient: -1.4 },
      { word: "burnout", coefficient: -1.2 },
      { word: "caregiving", coefficient: -1.1 },
      { word: "workplace", coefficient: -1.0 },
      { word: "natural", coefficient: -0.9 },
      { word: "survivors", coefficient: -0.8 },
      { word: "intervention", coefficient: -0.7 },
      { word: "clinical", coefficient: -0.6 },
      { word: "trauma-informed", coefficient: -0.5 },
      { word: "resilience-building", coefficient: -0.4 },
      { word: "cultural", coefficient: -0.3 },
      { word: "disaster-prone", coefficient: -0.2 },
    ],
  };

  // State for keyword lists, initialized with mock data
  const [positiveList, setPositiveList] = useState(initialMockData.positive);
  const [negativeList, setNegativeList] = useState(initialMockData.negative);

  // State for form inputs
  const [positiveWord, setPositiveWord] = useState("");
  const [positiveCoefficient, setPositiveCoefficient] = useState("");
  const [negativeWord, setNegativeWord] = useState("");
  const [negativeCoefficient, setNegativeCoefficient] = useState("");

  // Handler to add a new positive keyword
  const handleAddPositive = (e) => {
    e.preventDefault();
    const coef = parseFloat(positiveCoefficient);
    if (positiveWord.trim() !== "" && !isNaN(coef)) {
      const newList = [
        ...positiveList,
        { word: positiveWord.trim(), coefficient: coef, isUser: true },
      ]
        .sort((a, b) => b.coefficient - a.coefficient)
        .slice(0, 20); // Keep top 20

      setPositiveList(newList);
      setPositiveWord("");
      setPositiveCoefficient("");
    }
  };

  // Handler to add a new negative keyword
  const handleAddNegative = (e) => {
    e.preventDefault();
    const coef = parseFloat(negativeCoefficient);
    if (negativeWord.trim() !== "" && !isNaN(coef)) {
      const newList = [
        ...negativeList,
        { word: negativeWord.trim(), coefficient: coef, isUser: true },
      ]
        .sort((a, b) => a.coefficient - b.coefficient) // Negative coefficients: more negative is higher
        .slice(0, 20); // Keep top 20

      setNegativeList(newList);
      setNegativeWord("");
      setNegativeCoefficient("");
    }
  };

  // Function to render the list of coefficients
  const renderCoefficientList = (data, isPositive) => (
    <List dense={true}>
      {data.map(({ word, coefficient, isUser }, index) => (
        <ListItem
          key={`${word}-${isUser ? "user" : "mock"}-${index}`}
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
              bgcolor: isUser
                ? theme.palette.secondary.main // User-defined
                : isPositive
                  ? theme.palette.grey[600] // System-defined positive
                  : theme.palette.primary.main, // System-defined negative
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
            {coefficient.toFixed(1)}
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
        <Grid container spacing={4}>
          {/* Positive Coefficients */}
          <Grid item xs={12} md={6}>
            <Typography sx={{ my: 2 }} variant="h6" component="div">
              Words Indicating Relevance
            </Typography>
            {positiveList.length !== 0 ? (
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  {renderCoefficientList(
                    positiveList.slice(0, Math.ceil(positiveList.length / 2)),
                    true,
                  )}
                </Grid>
                <Grid item xs={6}>
                  {renderCoefficientList(
                    positiveList.slice(Math.ceil(positiveList.length / 2)),
                    true,
                  )}
                </Grid>
              </Grid>
            ) : (
              <Typography>No data available.</Typography>
            )}
          </Grid>

          {/* Negative Coefficients */}
          <Grid item xs={12} md={6}>
            <Typography sx={{ my: 2 }} variant="h6" component="div">
              Words Indicating Non-relevance
            </Typography>
            {negativeList.length !== 0 ? (
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  {renderCoefficientList(
                    negativeList.slice(0, Math.ceil(negativeList.length / 2)),
                    false,
                  )}
                </Grid>
                <Grid item xs={6}>
                  {renderCoefficientList(
                    negativeList.slice(Math.ceil(negativeList.length / 2)),
                    false,
                  )}
                </Grid>
              </Grid>
            ) : (
              <Typography>No data available.</Typography>
            )}
          </Grid>
        </Grid>

        {/* Centered Legend */}
        <Box
          sx={{
            my: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* System-defined Keywords with Split Color Circle */}
          <Box sx={{ display: "flex", alignItems: "center", mr: 4 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                mr: 1,
                background: `linear-gradient(90deg, ${theme.palette.grey[600]} 50%, ${theme.palette.primary.main} 50%)`,
              }}
            />
            <Typography variant="body2" color="text.secondary">
              System-defined Keywords
            </Typography>
          </Box>
          {/* User-defined Keywords */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                bgcolor: "secondary.main",
                borderRadius: "50%",
                mr: 1,
              }}
            />
            <Typography variant="body2" color="text.secondary">
              User-defined Keywords
            </Typography>
          </Box>
        </Box>

        {/* Divider */}
        <Divider sx={{ my: 2 }} />

        {/* Expandable User Input Section */}
        <Accordion
          sx={{
            borderRadius: 3, // Rounded corners
            boxShadow: "none", // Remove default shadow
            "&:before": {
              display: "none", // Remove the default divider line
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="add-keywords-content"
            id="add-keywords-header"
          >
            <Typography variant="h6">Add Keywords & Weights</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/* User Input Forms */}
            <Grid container spacing={4}>
              {/* Add Positive Keyword */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" component="div" gutterBottom>
                  Add Relevant Word
                </Typography>
                <form onSubmit={handleAddPositive}>
                  <TextField
                    label="Word"
                    value={positiveWord}
                    onChange={(e) => setPositiveWord(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                  />
                  <TextField
                    label="Coefficient"
                    type="number"
                    value={positiveCoefficient}
                    onChange={(e) => setPositiveCoefficient(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                  >
                    Add Relevant Word
                  </Button>
                </form>
              </Grid>

              {/* Add Negative Keyword */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" component="div" gutterBottom>
                  Add Non-relevant Word
                </Typography>
                <form onSubmit={handleAddNegative}>
                  <TextField
                    label="Word"
                    value={negativeWord}
                    onChange={(e) => setNegativeWord(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                  />
                  <TextField
                    label="Coefficient"
                    type="number"
                    value={negativeCoefficient}
                    onChange={(e) => setNegativeCoefficient(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                  >
                    Add Non-relevant Word
                  </Button>
                </form>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default FeatureImportanceOneWord;
