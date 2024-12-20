import { useEffect, useRef } from "react";
import { Card, CardContent, Typography, Box, useTheme } from "@mui/material";
import * as d3 from "d3";

const EmbeddingVisualizationNeural = () => {
  const theme = useTheme();
  const svgRef = useRef(null);

  // Comprehensive mock data simulating PTSD in warfare post-WW2
  const mockData = [
    // Relevant Records (e.g., PTSD related to warfare)
    { x: 1.0, y: 1.5, label: "Relevant" },
    { x: 1.2, y: 1.8, label: "Relevant" },
    { x: 0.8, y: 1.2, label: "Relevant" },
    { x: 1.1, y: 1.6, label: "Relevant" },
    { x: 0.9, y: 1.4, label: "Relevant" },
    { x: 1.3, y: 1.9, label: "Relevant" },
    { x: 0.7, y: 1.1, label: "Relevant" },
    { x: 1.4, y: 2.0, label: "Relevant" },
    { x: 1.0, y: 1.7, label: "Relevant" },
    { x: 0.6, y: 1.0, label: "Relevant" },
    // Irrelevant Records (e.g., PTSD not related to warfare)
    { x: -1.0, y: -1.5, label: "Irrelevant" },
    { x: -1.2, y: -1.8, label: "Irrelevant" },
    { x: -0.8, y: -1.2, label: "Irrelevant" },
    { x: -1.1, y: -1.6, label: "Irrelevant" },
    { x: -0.9, y: -1.4, label: "Irrelevant" },
    { x: -1.3, y: -1.9, label: "Irrelevant" },
    { x: -0.7, y: -1.1, label: "Irrelevant" },
    { x: -1.4, y: -2.0, label: "Irrelevant" },
    { x: -1.0, y: -1.7, label: "Irrelevant" },
    { x: -0.6, y: -1.0, label: "Irrelevant" },
    // Additional Data Points to Simulate Larger Dataset
    // Relevant
    { x: 1.5, y: 2.1, label: "Relevant" },
    { x: 1.6, y: 2.2, label: "Relevant" },
    { x: 1.7, y: 2.3, label: "Relevant" },
    { x: 1.8, y: 2.4, label: "Relevant" },
    { x: 1.9, y: 2.5, label: "Relevant" },
    // Irrelevant
    { x: -1.5, y: -2.1, label: "Irrelevant" },
    { x: -1.6, y: -2.2, label: "Irrelevant" },
    { x: -1.7, y: -2.3, label: "Irrelevant" },
    { x: -1.8, y: -2.4, label: "Irrelevant" },
    { x: -1.9, y: -2.5, label: "Irrelevant" },
    // ... Add more data points as needed
  ];

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const container = svgRef.current.parentElement;
    const width = container.clientWidth;
    const height = 400;

    svg.attr("width", width).attr("height", height);

    // Clear previous contents
    svg.selectAll("*").remove();

    // Define margins
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create a group element for margins
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define scales
    const xExtent = d3.extent(mockData, (d) => d.x);
    const yExtent = d3.extent(mockData, (d) => d.y);

    const xScale = d3
      .scaleLinear()
      .domain([xExtent[0] - 0.5, xExtent[1] + 0.5])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([yExtent[0] - 0.5, yExtent[1] + 0.5])
      .range([innerHeight, 0]);

    // Define color scale
    const colorScale = d3
      .scaleOrdinal()
      .domain(["Relevant", "Irrelevant"])
      .range([theme.palette.grey[600], theme.palette.primary.light]);

    // Add X Axis
    const xAxis = d3.axisBottom(xScale).ticks(6);
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(xAxis)
      .selectAll("text")
      .attr("fontSize", "12px");

    // Add Y Axis
    const yAxis = d3.axisLeft(yScale).ticks(6);
    g.append("g").call(yAxis).selectAll("text").attr("fontSize", "12px");

    // Add axis labels
    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", margin.left + innerWidth / 2)
      .attr("y", height - 5)
      .text("Dimension 1")
      .attr("fontSize", "14px")
      .attr("fill", theme.palette.text.primary);

    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", 15)
      .attr("x", -margin.top - innerHeight / 2)
      .text("Dimension 2")
      .attr("fontSize", "14px")
      .attr("fill", theme.palette.text.primary);

    // Add data points
    g.selectAll("circle")
      .data(mockData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 6)
      .attr("fill", (d) => colorScale(d.label))
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .on("mouseover", function (event, d) {
        // Show tooltip on hover
        const tooltip = d3.select("#tooltip");
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px")
          .style("display", "block")
          .html(
            `<strong>Label:</strong> ${d.label}<br/><strong>Dimensions:</strong> (${d.x}, ${d.y})`,
          );
      })
      .on("mouseout", function () {
        // Hide tooltip when not hovering
        d3.select("#tooltip").style("display", "none");
      });

    // Add Legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${margin.left + 20}, ${margin.top})`);

    const legendData = ["Relevant", "Irrelevant"];

    legendData.forEach((label, index) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${index * 20})`);

      legendRow
        .append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", colorScale(label))
        .attr("rx", 4)
        .attr("ry", 4);

      legendRow
        .append("text")
        .attr("x", 18)
        .attr("y", 10)
        .text(label)
        .attr("fontSize", "12px")
        .attr("fill", theme.palette.text.primary);
    });
  }, [mockData, theme]);

  return (
    <Card sx={{ backgroundColor: "transparent", maxWidth: "100%", mx: "auto" }}>
      <CardContent>
        <Typography
          sx={{ my: 2 }}
          variant="h6"
          component="div"
          align="center"
          color="text.primary"
        >
          Document Embeddings Visualization (t-SNE)
        </Typography>
        <Box sx={{ position: "relative" }}>
          {/* Tooltip */}
          <Box
            id="tooltip"
            sx={{
              position: "absolute",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: "white",
              padding: "8px",
              borderRadius: "4px",
              pointerEvents: "none",
              display: "none",
              fontSize: "12px",
              zIndex: 10,
            }}
          ></Box>
          {/* SVG Canvas */}
          <svg ref={svgRef}></svg>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EmbeddingVisualizationNeural;
