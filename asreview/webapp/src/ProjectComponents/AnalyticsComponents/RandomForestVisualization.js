import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Popover,
  Divider,
  Button,
  Skeleton,
} from "@mui/material";
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { useTheme } from '@mui/material/styles';

// Updated Mock Trees Data with More Realistic Branching
const mockTrees = [
  {
    id: 1,
    rules: {
      condition: "Combat Duration >= 7",
      yes: {
        condition: "Age >= 30",
        yes: "Relevant",
        no: "Non-relevant",
      },
      no: {
        condition: "PTSD Score >= 5",
        yes: "Relevant",
        no: "Non-relevant",
      },
    },
  },
  {
    id: 2,
    rules: {
      condition: "Shellshock Score >= 6",
      yes: {
        condition: "Support Level >= 3",
        yes: "Relevant",
        no: "Non-relevant",
      },
      no: {
        condition: "Stress Level >= 4",
        yes: "Non-relevant",
        no: "Non-relevant",
      },
    },
  },
  {
    id: 3,
    rules: {
      condition: "Deployment Period >= 5",
      yes: {
        condition: "Exposure Level >= 2",
        yes: "Relevant",
        no: "Non-relevant",
      },
      no: {
        condition: "Therapy Sessions >= 3",
        yes: "Relevant",
        no: "Non-relevant",
      },
    },
  },
  {
    id: 4,
    rules: {
      condition: "Recovery Rate >= 6",
      yes: {
        condition: "Medication Adherence >= 80%",
        yes: "Relevant",
        no: "Non-relevant",
      },
      no: {
        condition: "Anxiety Level >= 4",
        yes: "Non-relevant",
        no: "Non-relevant",
      },
    },
  },
  {
    id: 5,
    rules: {
      condition: "Flashbacks Occurrence >= 7",
      yes: {
        condition: "Trauma Score >= 5",
        yes: "Relevant",
        no: "Non-relevant",
      },
      no: {
        condition: "Coping Mechanisms Effective",
        yes: "Relevant",
        no: "Non-relevant",
      },
    },
  },
];

// Mock Papers Data with Realistic Names
const mockPapers = [
  {
    id: 1,
    title: "Long-Term Effects of Combat on PTSD Recovery",
    treePredictions: {
      1: "Relevant",
      2: "Relevant",
      3: "Relevant",
      4: "Relevant",
      5: "Relevant",
    },
  },
  {
    id: 2,
    title: "Impact of Social Support on Substance Abuse Rehabilitation",
    treePredictions: {
      1: "Non-relevant",
      2: "Non-relevant",
      3: "Non-relevant",
      4: "Non-relevant",
      5: "Relevant",
    },
  },
  {
    id: 3,
    title: "Age at Exposure and Its Influence on Mental Health Outcomes",
    treePredictions: {
      1: "Non-relevant",
      2: "Non-relevant",
      3: "Relevant",
      4: "Relevant",
      5: "Relevant",
    },
  },
];

const RandomForestVisualization = () => {
  const theme = useTheme();

  // State for Popover
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTree, setSelectedTree] = useState(null);

  // State for Selected Paper and Paper Index
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [currentPaperIndex, setCurrentPaperIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Function to handle Popover Open
  const handlePopoverOpen = (event, tree) => {
    setAnchorEl(event.currentTarget);
    setSelectedTree(tree);
  };

  // Function to handle Popover Close
  const handlePopoverClose = () => {
    setAnchorEl(null);
    setSelectedTree(null);
  };

  const open = Boolean(anchorEl);

  // Updated Function to render tree rules in SVG with dynamic positioning
  const renderTreeSVG = (rules) => {
    const nodeRadius = 15;
    const verticalSpacing = 80;
    const svgWidth = 400;
    const svgHeight = 220;

    const nodes = [];
    const links = [];

    let maxDepth = 0;

    // Recursive function to assign positions
    const assignPositions = (node, depth, x) => {
      if (!node) return;

      maxDepth = Math.max(maxDepth, depth);

      // Store node with depth and x position
      nodes.push({ node, depth, x });

      // Calculate horizontal offset for child nodes
      const offset = svgWidth / Math.pow(2, depth + 2);

      if (typeof node === 'object' && node.condition) {
        if (node.yes) {
          assignPositions(node.yes, depth + 1, x - offset);
          links.push({ from: node, to: node.yes });
        }
        if (node.no) {
          assignPositions(node.no, depth + 1, x + offset);
          links.push({ from: node, to: node.no });
        }
      }
    };

    assignPositions(rules, 0, svgWidth / 2);

    // Map to hold node positions
    const nodePositions = new Map();
    nodes.forEach(({ node, depth, x }) => {
      const y = 20 + depth * verticalSpacing;
      nodePositions.set(node, { x, y });
    });

    const elements = [];

    // Draw links
    links.forEach(({ from, to }) => {
      const fromPos = nodePositions.get(from);
      const toPos = nodePositions.get(to);

      elements.push(
        <line
          key={`line-${fromPos.x}-${fromPos.y}-${toPos.x}-${toPos.y}`}
          x1={fromPos.x}
          y1={fromPos.y + nodeRadius}
          x2={toPos.x}
          y2={toPos.y - nodeRadius}
          stroke={theme.palette.text.secondary}
        />
      );
    });

    // Draw nodes
    nodes.forEach(({ node }) => {
      const pos = nodePositions.get(node);

      // Determine node color based on decision
      const isLeaf = typeof node === 'string' || !node.condition;
      let nodeColor;
      if (isLeaf) {
        nodeColor = node === 'Relevant' ? theme.palette.grey[600] : theme.palette.primary.main;
      } else {
        nodeColor = theme.palette.text.primary;
      }

      elements.push(
        <circle
          key={`circle-${pos.x}-${pos.y}`}
          cx={pos.x}
          cy={pos.y}
          r={nodeRadius}
          fill={nodeColor}
          stroke={theme.palette.text.primary}
          strokeWidth={1}
        />
      );

      // Add condition or decision text below the node
      const text = typeof node === 'string' ? node : node.condition;
      elements.push(
        <text
          key={`text-${pos.x}-${pos.y}`}
          x={pos.x}
          y={pos.y + nodeRadius + 10}
          textAnchor="middle"
          alignmentBaseline="middle"
          fill={theme.palette.text.primary}
          fontSize="10"
          fontWeight="bold"
        >
          {text}
        </text>
      );
    });

    return (
      <svg width={svgWidth} height={svgHeight}>
        {elements}
      </svg>
    );
  };

  // Function to handle Sequential Paper Selection
  const handleRandomPaper = () => {
    setLoading(true);
    setSelectedPaper(null);

    // Simulate loading delay
    setTimeout(() => {
      const paper = mockPapers[currentPaperIndex];
      setSelectedPaper(paper);
      setCurrentPaperIndex((currentPaperIndex + 1) % mockPapers.length);
      setLoading(false);
    }, 1000); // 1 second delay
  };

  // Function to calculate majority vote based on selected paper's tree predictions
  const calculateMajorityVote = () => {
    if (!selectedPaper) return null;
    const voteCounts = Object.values(selectedPaper.treePredictions).reduce(
      (acc, prediction) => {
        acc[prediction] += 1;
        return acc;
      },
      { 'Relevant': 0, 'Non-relevant': 0 }
    );

    return voteCounts['Relevant'] > voteCounts['Non-relevant'] ? 'Relevant' : 'Non-relevant';
  };

  const finalPrediction = calculateMajorityVote();
  const finalVoteColor = finalPrediction === 'Relevant' ? theme.palette.grey[600] : theme.palette.primary.main;

  return (
    <Card sx={{ backgroundColor: "transparent", width: "100%", mx: "auto" }}>
      <CardContent>
        {/* Emphasized Introduction Text with Voting Symbol */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.palette.background.paper,
            borderRadius: 3,
            padding: theme.spacing(2),
            mb: 4,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HowToVoteIcon sx={{ color: 'black', fontSize: 24 }} />
            <Typography variant="h6" color="text.primary" align="center">
              The majority vote determines the final classification.
            </Typography>
          </Box>
        </Box>

        {/* Random Paper Selection */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 4,
            justifyContent: 'center',
            gap: 2,
            mt: 2,
          }}
        >
          <Button
            onClick={handleRandomPaper}
            variant="text"
            sx={{
              color: theme.palette.primary.main,
              textTransform: 'none',
              fontSize: '14px',
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
          >
            Pick a Random Paper
          </Button>
          {loading ? (
            <Skeleton variant="text" width={300} height={30} />
          ) : (
            selectedPaper && (
              <Typography variant="body2" color="text.secondary">
                {selectedPaper.title}
              </Typography>
            )
          )}
        </Box>

        {/* Decision Trees */}
        <Box sx={{ my: 4 }}>
          {loading ? (
            <Grid container spacing={4} justifyContent="center" alignItems="center">
              {[...Array(5)].map((_, index) => (
                <Grid item key={index} xs={6} sm={4} md={2} sx={{ textAlign: 'center' }}>
                  <Skeleton variant="circular" width={50} height={50} />
                  <Skeleton variant="text" width={60} height={20} sx={{ mt: 1 }} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={4} justifyContent="center" alignItems="center">
              {mockTrees.map((tree) => (
                <Grid item key={tree.id} xs={6} sm={4} md={2} sx={{ textAlign: 'center' }}>
                  <Box
                    onMouseEnter={(e) => handlePopoverOpen(e, tree)}
                    onMouseLeave={handlePopoverClose}
                    sx={{ cursor: 'pointer' }}
                  >
                    <AccountTreeIcon
                      sx={{
                        fontSize: 50,
                        color: selectedPaper
                          ? selectedPaper.treePredictions[tree.id] === 'Relevant'
                            ? theme.palette.grey[600]
                            : theme.palette.primary.main
                          : theme.palette.text.disabled,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Tree {tree.id}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Popover for Tree Rules */}
        <Popover
          id="mouse-over-popover"
          sx={{
            pointerEvents: 'none',
          }}
          open={open}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          disableRestoreFocus
          PaperProps={{
            elevation: 3,
            sx: {
              backgroundColor: theme.palette.background.paper,
              padding: 2,
              borderRadius: 3,
              maxWidth: 500,
            },
          }}
        >
          {selectedTree && selectedPaper && (
            <Box sx={{ maxWidth: 500 }}>
              {renderTreeSVG(selectedTree.rules)}
            </Box>
          )}
        </Popover>

        {/* Voting Mechanism */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 4 }}>
          {!loading && selectedPaper && (
            <>
              <HowToVoteIcon sx={{ fontSize: 50, color: finalVoteColor }} />
              <Typography
                variant="h6"
                sx={{
                  ml: 2,
                  color: finalVoteColor,
                }}
              >
                {finalPrediction}
              </Typography>
            </>
          )}
          {loading && (
            <>
              <Skeleton variant="circular" width={50} height={50} />
              <Skeleton variant="text" width={100} height={30} sx={{ ml: 2 }} />
            </>
          )}
        </Box>

        {/* Legend */}
        {selectedPaper && (
          <Box sx={{ my: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
            {/* Relevant Prediction */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: theme.palette.grey[600],
                  borderRadius: '50%',
                  mr: 1,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Relevant
              </Typography>
            </Box>
            {/* Non-relevant Prediction */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: theme.palette.primary.main,
                  borderRadius: '50%',
                  mr: 1,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Not Relevant
              </Typography>
            </Box>
          </Box>
        )}

        {/* Divider */}
        <Divider sx={{ my: 2 }} />
      </CardContent>
    </Card>
  );
};

export default RandomForestVisualization;
