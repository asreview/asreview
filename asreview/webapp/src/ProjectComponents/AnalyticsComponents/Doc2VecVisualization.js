
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  Box,
  useTheme,
  Typography,
  Popover,
} from "@mui/material";
import * as d3 from "d3";

const Doc2VecVisualization = () => {
  const theme = useTheme();
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 2000 });

  // State for Popover
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [popoverContent, setPopoverContent] = useState(null);

  // Define a muted color palette
  const colorPalette = [
    theme.palette.primary.light,
    theme.palette.secondary.light,
    theme.palette.success.light,
    theme.palette.warning.light,
    theme.palette.info.light,
    theme.palette.error.light,
    "#a6cee3",
    "#1f78b4",
    "#b2df8a",
    "#33a02c",
    "#fb9a99",
    "#e31a1c",
    "#fdbf6f",
    "#ff7f00",
    "#cab2d6",
    "#6a3d9a",
    "#ffff99",
    "#b15928",
  ];

  // Mock Data representing Doc2Vec architecture with realistic paper names and mock dates
  const mockData = useMemo(
    () => ({
      documents: [
        // Relevant Papers
        {
          id: "Doc1",
          label: "The Impact of Combat on Veterans (2020)",
          words: ["PTSD", "combat", "veterans", "resilience"],
          vector: [0.5, 0.2, 0.1],
          relevance: "Relevant",
        },
        {
          id: "Doc2",
          label: "Assessing Resilience in Soldiers (2019)",
          words: ["resilience", "soldiers", "PTSD", "support"],
          vector: [0.45, 0.25, 0.15],
          relevance: "Relevant",
        },
        {
          id: "Doc3",
          label: "Therapy Approaches for War Trauma (2021)",
          words: ["therapy", "war", "trauma", "recovery"],
          vector: [0.4, 0.3, 0.2],
          relevance: "Relevant",
        },
        {
          id: "Doc4",
          label: "Social Support Networks in Military (2018)",
          words: ["social support", "military", "network", "PTSD"],
          vector: [0.35, 0.35, 0.25],
          relevance: "Relevant",
        },
        {
          id: "Doc5",
          label: "Substance Abuse Among Veterans (2022)",
          words: ["substance abuse", "veterans", "PTSD", "treatment"],
          vector: [0.3, 0.4, 0.3],
          relevance: "Relevant",
        },
        {
          id: "Doc6",
          label: "Age at Exposure and PTSD (2023)",
          words: ["age", "exposure", "PTSD", "mental health"],
          vector: [0.25, 0.45, 0.35],
          relevance: "Relevant",
        },
        {
          id: "Doc7",
          label: "Long-Term Effects of Warfare (2020)",
          words: ["long-term", "effects", "warfare", "PTSD"],
          vector: [0.2, 0.5, 0.4],
          relevance: "Relevant",
        },
        {
          id: "Doc8",
          label: "Mental Health Interventions for Soldiers (2021)",
          words: ["mental health", "interventions", "soldiers", "therapy"],
          vector: [0.15, 0.55, 0.45],
          relevance: "Relevant",
        },
        {
          id: "Doc9",
          label: "Recovery Pathways Post-Combat Exposure (2019)",
          words: ["recovery", "combat exposure", "pathways", "PTSD"],
          vector: [0.1, 0.6, 0.5],
          relevance: "Relevant",
        },
        {
          id: "Doc10",
          label: "Family Support in PTSD Recovery (2022)",
          words: ["family support", "PTSD", "recovery", "therapy"],
          vector: [0.05, 0.65, 0.55],
          relevance: "Relevant",
        },
        // Irrelevant Papers
        {
          id: "Doc11",
          label: "Childhood Abuse and Its Long-Term Effects (2017)",
          words: ["childhood abuse", "long-term", "effects", "recovery"],
          vector: [0.05, 0.7, 0.6],
          relevance: "Irrelevant",
        },
        {
          id: "Doc12",
          label: "Adolescent Trauma and Mental Health (2018)",
          words: ["adolescent trauma", "mental health", "recovery", "therapy"],
          vector: [0.0, 0.75, 0.65],
          relevance: "Irrelevant",
        },
        {
          id: "Doc13",
          label: "Impact of Domestic Violence on Children (2016)",
          words: ["domestic violence", "children", "abuse", "recovery"],
          vector: [-0.05, 0.8, 0.7],
          relevance: "Irrelevant",
        },
        {
          id: "Doc14",
          label: "School Environment and Student Well-being (2015)",
          words: ["school environment", "student well-being", "mental health"],
          vector: [-0.1, 0.85, 0.75],
          relevance: "Irrelevant",
        },
        {
          id: "Doc15",
          label: "Early Intervention in Child Mental Health (2014)",
          words: ["early intervention", "child", "mental health", "therapy"],
          vector: [-0.15, 0.9, 0.8],
          relevance: "Irrelevant",
        },
        // Additional Relevant Papers for More Connections
        {
          id: "Doc16",
          label: "Combat Stress and Recovery Techniques (2021)",
          words: ["combat", "stress", "recovery", "therapy"],
          vector: [0.4, 0.3, 0.25],
          relevance: "Irrelevant",
        },
        {
          id: "Doc17",
          label: "Psychological Resilience in Combat Veterans (2022)",
          words: ["resilience", "combat", "veterans", "PTSD"],
          vector: [0.35, 0.4, 0.2],
          relevance: "Relevant",
        },
        {
          id: "Doc18",
          label: "Support Systems for War Veterans (2023)",
          words: ["support", "military", "veterans", "resilience"],
          vector: [0.3, 0.45, 0.25],
          relevance: "Relevant",
        },
        {
          id: "Doc19",
          label: "Advanced Therapy Methods for PTSD (2024)",
          words: ["therapy", "PTSD", "recovery", "interventions"],
          vector: [0.25, 0.5, 0.3],
          relevance: "Relevant",
        },
        {
          id: "Doc20",
          label: "The Role of Family Support in Mental Health Recovery (2025)",
          words: ["family support", "mental health", "recovery", "therapy"],
          vector: [0.2, 0.55, 0.35],
          relevance: "Relevant",
        },
        // Additional Irrelevant Papers for More Connections
        {
          id: "Doc21",
          label: "Effects of Childhood Bullying on Adult Mental Health (2013)",
          words: ["childhood bullying", "mental health", "recovery", "abuse"],
          vector: [-0.2, 0.95, 0.85],
          relevance: "Irrelevant",
        },
        {
          id: "Doc22",
          label: "Mental Health Strategies for School Counselors (2012)",
          words: ["mental health", "school", "strategies", "well-being"],
          vector: [-0.25, 1.0, 0.9],
          relevance: "Irrelevant",
        },
        {
          id: "Doc23",
          label: "Impact of Parental Support on Child Development (2011)",
          words: ["parental support", "child development", "mental health", "therapy"],
          vector: [-0.3, 1.05, 0.95],
          relevance: "Irrelevant",
        },
        {
          id: "Doc24",
          label: "Coping Mechanisms in Adolescents (2010)",
          words: ["coping mechanisms", "adolescents", "mental health", "trauma"],
          vector: [-0.35, 1.1, 1.0],
          relevance: "Irrelevant",
        },
        {
          id: "Doc25",
          label: "Stress Management Techniques in Schools (2009)",
          words: ["stress management", "schools", "well-being", "therapy"],
          vector: [-0.4, 1.15, 1.05],
          relevance: "Irrelevant",
        },
      ],
      wordEmbeddings: {
        PTSD: [0.7, 0.1, 0.2],
        combat: [0.6, 0.15, 0.25],
        veterans: [0.65, 0.05, 0.3],
        resilience: [0.55, 0.2, 0.25],
        soldiers: [0.5, 0.25, 0.25],
        therapy: [0.45, 0.3, 0.25],
        war: [0.4, 0.35, 0.25],
        trauma: [0.35, 0.4, 0.25],
        recovery: [0.3, 0.45, 0.25],
        socialSupport: [0.25, 0.5, 0.25],
        military: [0.2, 0.55, 0.25],
        network: [0.15, 0.6, 0.25],
        substanceAbuse: [0.1, 0.65, 0.25],
        treatment: [0.05, 0.7, 0.25],
        age: [0.1, 0.75, 0.15],
        exposure: [0.15, 0.8, 0.05],
        mentalHealth: [0.2, 0.85, -0.05],
        longTerm: [0.25, 0.9, -0.15],
        effects: [0.3, 0.95, -0.25],
        warfare: [0.35, 1.0, -0.35],
        interventions: [0.4, 1.05, -0.45],
        pathways: [0.45, 1.1, -0.55],
        familySupport: [0.5, 1.15, -0.65],
        "childhood abuse": [0.55, 1.2, -0.75],
        "adolescent trauma": [0.6, 1.25, -0.85],
        "domestic violence": [0.65, 1.3, -0.95],
        "school environment": [0.7, 1.35, -1.05],
        "early intervention": [0.75, 1.4, -1.15],
        children: [0.8, 1.45, -1.25],
        abuse: [0.85, 1.5, -1.35],
        studentWellbeing: [0.9, 1.55, -1.45],
        child: [0.95, 1.6, -1.55],
        "childhood bullying": [1.0, 1.65, -1.65],
        "mental health": [1.05, 1.7, -1.75],
        "recovery": [1.1, 1.75, -1.85],
        "abuse": [1.15, 1.8, -1.95],
        "adolescents": [1.2, 1.85, -2.05],
        "strategies": [1.25, 1.9, -2.15],
        "well-being": [1.3, 1.95, -2.25],
        "parental support": [1.35, 2.0, -2.35],
        "child development": [1.4, 2.05, -2.45],
        "coping mechanisms": [1.45, 2.1, -2.55],
        "stress management": [1.5, 2.15, -2.65],
      },
    }),
    []
  );

  // Determine word relevancy based on document associations
  const wordRelevancy = useMemo(() => {
    const wordMap = {};
    mockData.documents.forEach((doc) => {
      doc.words.forEach((word) => {
        if (!wordMap[word]) {
          wordMap[word] = new Set();
        }
        wordMap[word].add(doc.relevance);
      });
    });

    const relevancy = {};
    Object.keys(wordMap).forEach((word) => {
      if (wordMap[word].has("Relevant")) {
        relevancy[word] = "Relevant";
      } else {
        relevancy[word] = "Irrelevant";
      }
    });

    return relevancy;
  }, [mockData.documents]);

  // Setup ResizeObserver to make SVG responsive
  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      setDimensions({ width: width, height: 2000 }); // Adjusted height based on content
    });

    resizeObserver.observe(containerRef.current);

    // Cleanup function to unobserve the container
    return () => {
      resizeObserver.unobserve(containerRef.current);
    };
  }, []);

  // Draw the visualization
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;

    svg.attr("width", width).attr("height", height);

    // Clear previous contents
    svg.selectAll("*").remove();

    // Define margins
    const margin = { top: 100, right: 100, bottom: 200, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create a group element for margins
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define x positions for documents and words
    const docsX = innerWidth * 0.2;
    const wordsX = innerWidth * 0.8;

    // Calculate y positions for documents
    const docCount = mockData.documents.length;
    const docSpacing = innerHeight / (docCount + 1);
    const docNodes = mockData.documents.map((doc, i) => ({
      ...doc,
      x: docsX,
      y: docSpacing * (i + 1),
      type: "Document",
      color: colorPalette[i % colorPalette.length],
    }));

    // Get unique words
    const uniqueWords = Array.from(
      new Set(mockData.documents.flatMap((doc) => doc.words))
    );

    // Calculate y positions for words
    const wordCount = uniqueWords.length;
    const wordSpacing = innerHeight / (wordCount + 1);
    const wordNodes = uniqueWords.map((word, i) => ({
      id: word,
      label: word,
      vector: mockData.wordEmbeddings[word] || [0, 0, 0],
      x: wordsX,
      y: wordSpacing * (i + 1),
      type: "Word",
      color:
        wordRelevancy[word] === "Relevant"
          ? theme.palette.grey[600]
          : theme.palette.primary.main,
    }));

    // Create a lookup for node positions
    const nodePositions = {};
    docNodes.forEach((doc) => {
      nodePositions[doc.id] = { x: doc.x, y: doc.y };
    });
    wordNodes.forEach((word) => {
      nodePositions[word.id] = { x: word.x, y: word.y };
    });

    // Connections between documents and words
    const connections = [];
    mockData.documents.forEach((doc) => {
      doc.words.forEach((word) => {
        connections.push({
          source: doc.id,
          target: word,
          weight: Math.random() * 2 - 1, // Random weight between -1 and 1
          relevance: doc.relevance, // Inherit relevance from the document
        });
      });
    });

    // Draw connections
    g.selectAll("line.connection")
      .data(connections)
      .enter()
      .append("line")
      .attr("class", "connection")
      .attr("x1", (d) => nodePositions[d.source].x)
      .attr("y1", (d) => nodePositions[d.source].y)
      .attr("x2", (d) => nodePositions[d.target].x)
      .attr("y2", (d) => nodePositions[d.target].y)
      .attr("stroke", (d) => {
        const sourceDoc = docNodes.find((doc) => doc.id === d.source);
        return sourceDoc.color;
      })
      .attr("stroke-width", (d) => Math.max(Math.abs(d.weight) * 2, 1))
      .attr("opacity", 0.6)
      .attr("stroke-dasharray", (d) =>
        d.relevance === "Relevant" ? "0" : "4,2"
      )
      .style("cursor", "pointer")
      .on("mouseover", function () {
        d3.select(this).attr("stroke-width", function (d) {
          return Math.max(Math.abs(d.weight) * 3, 2);
        });
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke-width", function (d) {
          return Math.max(Math.abs(d.weight) * 2, 1);
        });
      })
      .on("click", (event, d) => {
        handleNodeClick(event, { type: "Connection", ...d });
      });

    // Draw document nodes
    g.selectAll("circle.document")
      .data(docNodes)
      .enter()
      .append("circle")
      .attr("class", "document")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 25)
      .attr("fill", (d) => d.color)
      .style("cursor", "pointer")
      .on("mouseover", function () {
        d3.select(this).transition().duration(200).attr("r", 28);
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(200).attr("r", 25);
      })
      .on("click", (event, d) => handleNodeClick(event, d));

    // Draw word nodes
    g.selectAll("circle.word")
      .data(wordNodes)
      .enter()
      .append("circle")
      .attr("class", "word")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 15)
      .attr("fill", (d) => d.color)
      .style("cursor", "pointer")
      .on("mouseover", function () {
        d3.select(this).transition().duration(200).attr("r", 18);
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(200).attr("r", 15);
      })
      .on("click", (event, d) => handleNodeClick(event, d));

    // Add labels to nodes with increased spacing and positioning
    g.selectAll("text.node-label")
      .data([...docNodes, ...wordNodes])
      .enter()
      .append("text")
      .attr("class", "node-label")
      .attr("x", (d) => {
        if (d.type === "Word") {
          return d.x + 20; // Position to the right of the circle
        }
        return d.x;
        if (d.type === "Document") return d.x - 20; // Increased space
      })
      .attr("y", (d) => {
        if (d.type === "Document") return d.y + 35; // Increased space
        if (d.type === "Word") return d.y ; // Align vertically for right-side labels
        return d.y + 20;
      })
      .attr("text-anchor", (d) => (d.type === "Word" ? "start" : "middle"))
      .attr("alignment-baseline", (d) => (d.type === "Word" ? "middle" : "middle"))
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", theme.palette.text.primary)
      .text((d) => d.label);

    // Add titles
    g.append("text")
      .attr("x", docsX)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("fill", theme.palette.text.primary)
      .text("Papers");

    g.append("text")
      .attr("x", wordsX)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("fill", theme.palette.text.primary)
      .text("Keywords");

    // Add Legend
    const legendData = [
      { label: "Relevant Paper", color: colorPalette[0], type: "circle" },
      { label: "Irrelevant Paper", color: colorPalette[5], type: "circle" },
      { label: "Keyword (Relevant)", color: theme.palette.grey[600], type: "circle" },
      { label: "Keyword (Irrelevant)", color: theme.palette.primary.main, type: "circle" },
      {
        label: "Relevant Connection",
        color: colorPalette[0],
        type: "line",
      },
      {
        label: "Irrelevant Connection",
        color: colorPalette[5],
        type: "line",
      },
    ];

    const legend = g
      .append("g")
      .attr(
        "transform",
        `translate(${innerWidth / 2 - 200},${innerHeight + 150})`
      )
      .attr("overflow", "visible");

    legendData.forEach((item, index) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${index * 30})`);

      if (item.type === "circle") {
        legendRow
          .append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 10)
          .attr("fill", item.color);
      } else if (item.type === "line") {
        legendRow
          .append("line")
          .attr("x1", -10)
          .attr("y1", 0)
          .attr("x2", 10)
          .attr("y2", 0)
          .attr("stroke", item.color)
          .attr("stroke-width", 2)
          .attr(
            "stroke-dasharray",
            item.label.includes("Irrelevant") ? "4,2" : "0"
          );
      }

      legendRow
        .append("text")
        .attr("x", 15)
        .attr("y", 5)
        .text(item.label)
        .attr("font-size", "12px")
        .attr("fill", theme.palette.text.primary);
    });
  }, [mockData, dimensions, theme, colorPalette, wordRelevancy]);

  // Function to handle node clicks
  const handleNodeClick = (event, d) => {
    // Prevent default behavior
    event.stopPropagation();

    let content = {};

    if (d.type === "Connection") {
      content = {
        type: "Connection",
        source: d.source,
        target: d.target,
        weight: d.weight.toFixed(2),
        relevance: d.relevance,
      };
    } else if (d.type === "Document") {
      content = {
        type: "Document",
        label: d.label,
        relevance: d.relevance,
        words: d.words,
        vector: d.vector.join(", "),
      };
    } else if (d.type === "Word") {
      content = {
        type: "Word",
        label: d.label,
        vector: d.vector.join(", "),
      };
    }

    setPopoverContent(content);

    // Set the popover anchor position to the mouse click position
    setPopoverAnchor({
      vertical: event.clientY,
      horizontal: event.clientX,
    });
  };

  // Function to handle popover close
  const handleClose = () => {
    setPopoverAnchor(null);
    setPopoverContent(null);
  };

  return (
    <Card
      sx={{
        backgroundColor: "transparent",
        width: "100%",
        mx: "auto",
        boxShadow: "none", // Removed box shadow for a cleaner look
      }}
    >
      <CardContent>
        <Box
          ref={containerRef}
          sx={{
            position: "relative",
            width: "100%",
            height: "800px", // Fixed height with overflow scroll
            overflowY: "scroll",
            borderRadius: "8px",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: theme.palette.primary.main,
              borderRadius: "8px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: theme.palette.divider,
            },
          }}
        >
          {/* SVG Canvas */}
          <svg ref={svgRef} />

          {/* Popover for Node and Connection Details */}
          <Popover
            open={Boolean(popoverAnchor)}
            onClose={handleClose}
            anchorReference="anchorPosition"
            anchorPosition={
              popoverAnchor
                ? {
                    top: popoverAnchor.vertical,
                    left: popoverAnchor.horizontal,
                  }
                : { top: 0, left: 0 }
            }
            anchorOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            {popoverContent && (
              <Box sx={{ p: 2, maxWidth: 300 }}>
                {popoverContent.type === "Connection" ? (
                  <>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "bold", mb: 1 }}
                    >
                      Connection Details
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>From:</strong> {popoverContent.source}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>To:</strong> {popoverContent.target}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Weight:</strong> {popoverContent.weight}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Relevance:</strong> {popoverContent.relevance}
                    </Typography>
                  </>
                ) : popoverContent.type === "Document" ? (
                  <>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "bold", mb: 0.5 }}
                    >
                      {popoverContent.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={
                        popoverContent.relevance === "Relevant"
                          ? theme.palette.success.main
                          : theme.palette.error.main
                      }
                      sx={{ mb: 1 }}
                    >
                      {popoverContent.relevance}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Vector:</strong> {popoverContent.vector}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Keywords:</strong>{" "}
                      {popoverContent.words.join(", ")}
                    </Typography>
                  </>
                ) : popoverContent.type === "Word" ? (
                  <>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "bold", mb: 0.5 }}
                    >
                      {popoverContent.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {popoverContent.type}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Vector:</strong> {popoverContent.vector}
                    </Typography>
                  </>
                ) : null}
              </Box>
            )}
          </Popover>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Doc2VecVisualization;
