// BertVisualization.jsx

import React, { useEffect, useRef, useMemo } from "react";
import {
  Card,
  CardContent,
  Box,
  useTheme,
  Typography,
} from "@mui/material";
import * as d3 from "d3";

const BertVisualization = () => {
  const theme = useTheme();
  const svgRef = useRef(null);

  // Generate realistic mock sentences and embeddings
  const mockData = useMemo(() => {
    const warfarePTDSSentences = [
      "The impact of combat on veterans is profound.",
      "Resilience in soldiers is crucial for recovery.",
      "Therapy approaches aid in war trauma recovery.",
      "Family support plays a role in PTSD recovery.",
      "Social networks enhance mental health in military personnel.",
      "Deployment experiences significantly affect soldiers' well-being.",
      "Posttraumatic stress disorder requires comprehensive treatment.",
      "Long-term effects of warfare include psychological challenges.",
      "Substance abuse among veterans is a growing concern.",
      "Recovery pathways post-combat exposure are essential.",
      "Shellshock in WWII veterans highlights the need for better mental health support.",
      "Anxiety disorders are prevalent among active-duty military members.",
      "Stress management techniques improve soldiers' performance.",
      "Conflict zones exacerbate PTSD symptoms in soldiers.",
      "Exposure to warfare leads to long-lasting trauma.",
      "Therapy sessions are vital for trauma-informed care.",
      "Deployment can strain family relationships.",
      "Resilience-building programs are effective in military settings.",
      "Combat exposure increases the risk of mental health issues.",
      "Veterans face unique challenges during their recovery journey.",
    ];

    const nonWarfarePTDSSentences = [
      "Pandemic-related stress affects mental health.",
      "Natural disasters can lead to trauma.",
      "Community support is vital during crises.",
      "Workplace harassment can cause significant stress.",
      "Burnout in caregivers impacts their effectiveness.",
      "Refugees face numerous challenges in new environments.",
      "Accidents in the workplace need immediate attention.",
      "Harassment in schools affects student performance.",
      "Caregiving responsibilities can lead to exhaustion.",
      "Family dynamics play a role in personal development.",
      "Cultural differences influence community integration.",
      "Environmental disasters require immediate intervention.",
      "Pandemics disrupt global supply chains.",
      "Natural disasters necessitate emergency response.",
      "Workplace stress can reduce productivity.",
      "Community resilience strengthens after disasters.",
      "Refugee support programs are essential for integration.",
      "Accidents highlight the need for safety protocols.",
      "Harassment cases require proper investigation.",
      "Caregiving involves emotional and physical challenges.",
    ];

    // Define keywords for each sentence
    const extractKeyword = (sentence) => {
      // Simple keyword extraction: manually define keywords
      const keywordsMap = {
        // Warfare PTSD
        "The impact of combat on veterans is profound.": "Combat",
        "Resilience in soldiers is crucial for recovery.": "Resilience",
        "Therapy approaches aid in war trauma recovery.": "Therapy",
        "Family support plays a role in PTSD recovery.": "Family Support",
        "Social networks enhance mental health in military personnel.": "Social Networks",
        "Deployment experiences significantly affect soldiers' well-being.": "Deployment",
        "Posttraumatic stress disorder requires comprehensive treatment.": "PTSD",
        "Long-term effects of warfare include psychological challenges.": "Long-term Effects",
        "Substance abuse among veterans is a growing concern.": "Substance Abuse",
        "Recovery pathways post-combat exposure are essential.": "Recovery Pathways",
        "Shellshock in WWII veterans highlights the need for better mental health support.": "Shellshock",
        "Anxiety disorders are prevalent among active-duty military members.": "Anxiety Disorders",
        "Stress management techniques improve soldiers' performance.": "Stress Management",
        "Conflict zones exacerbate PTSD symptoms in soldiers.": "Conflict Zones",
        "Exposure to warfare leads to long-lasting trauma.": "Exposure",
        "Therapy sessions are vital for trauma-informed care.": "Therapy Sessions",
        "Deployment can strain family relationships.": "Deployment Strain",
        "Resilience-building programs are effective in military settings.": "Resilience Programs",
        "Combat exposure increases the risk of mental health issues.": "Combat Exposure",
        "Veterans face unique challenges during their recovery journey.": "Recovery Challenges",
        // Non-Warfare PTSD
        "Pandemic-related stress affects mental health.": "Pandemic Stress",
        "Natural disasters can lead to trauma.": "Natural Disasters",
        "Community support is vital during crises.": "Community Support",
        "Workplace harassment can cause significant stress.": "Workplace Harassment",
        "Burnout in caregivers impacts their effectiveness.": "Burnout",
        "Refugees face numerous challenges in new environments.": "Refugee Challenges",
        "Accidents in the workplace need immediate attention.": "Workplace Accidents",
        "Harassment in schools affects student performance.": "School Harassment",
        "Caregiving responsibilities can lead to exhaustion.": "Caregiving Exhaustion",
        "Family dynamics play a role in personal development.": "Family Dynamics",
        "Cultural differences influence community integration.": "Cultural Differences",
        "Environmental disasters require immediate intervention.": "Environmental Disasters",
        "Pandemics disrupt global supply chains.": "Pandemics",
        "Natural disasters necessitate emergency response.": "Emergency Response",
        "Workplace stress can reduce productivity.": "Workplace Stress",
        "Community resilience strengthens after disasters.": "Community Resilience",
        "Refugee support programs are essential for integration.": "Refugee Support",
        "Accidents highlight the need for safety protocols.": "Safety Protocols",
        "Harassment cases require proper investigation.": "Harassment Investigation",
        "Caregiving involves emotional and physical challenges.": "Caregiving Challenges",
      };
      return keywordsMap[sentence] || "Keyword";
    };

    const generateEmbeddings = (type) => {
      // Define centers for the two clusters closer to the origin
      const centers = {
        "Warfare PTSD": [0.5, 0.5],
        "Non-Warfare PTSD": [-0.5, -0.5],
      };

      const baseX = centers[type][0];
      const baseY = centers[type][1];
      const variance = 0.3; // Reduced variance for tighter clusters

      return [
        baseX + Math.random() * variance - variance / 2, // x with variance
        baseY + Math.random() * variance - variance / 2, // y with variance
      ];
    };

    const data = [];

    warfarePTDSSentences.forEach((sentence, idx) => {
      data.push({
        id: `W${idx + 1}`,
        sentence,
        keyword: extractKeyword(sentence),
        embedding: generateEmbeddings("Warfare PTSD"),
        context: "Warfare PTSD",
      });
    });

    nonWarfarePTDSSentences.forEach((sentence, idx) => {
      data.push({
        id: `NW${idx + 1}`,
        sentence,
        keyword: extractKeyword(sentence),
        embedding: generateEmbeddings("Non-Warfare PTSD"),
        context: "Non-Warfare PTSD",
      });
    });

    // Expand to create a larger dataset by adding slight variations
    const expandedData = [];
    data.forEach((d) => {
      for (let i = 0; i < 2; i++) { // 2 variations per sentence for brevity
        expandedData.push({
          id: `${d.id}-V${i + 1}`,
          sentence: `${d.sentence} (Variation ${i + 1})`,
          keyword: d.keyword, // Use the same keyword for variations
          embedding: [
            d.embedding[0] + Math.random() * 0.05 - 0.025, // slight variation
            d.embedding[1] + Math.random() * 0.05 - 0.025,
          ],
          context: d.context,
        });
      }
    });

    return expandedData;
  }, []);

  // Fixed dimensions
  const dimensions = { width: 800, height: 600 };

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;

    svg.attr("width", width).attr("height", height);

    // Clear previous contents
    svg.selectAll("*").remove();

    // Define margins
    const margin = { top: 50, right: 200, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create a group element for margins
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xExtent = d3.extent(mockData, (d) => d.embedding[0]);
    const yExtent = d3.extent(mockData, (d) => d.embedding[1]);

    const xScale = d3
      .scaleLinear()
      .domain([xExtent[0] - 0.5, xExtent[1] + 0.5]) // Add padding to include origin
      .range([0, innerWidth])
      .nice();

    const yScale = d3
      .scaleLinear()
      .domain([yExtent[0] - 0.5, yExtent[1] + 0.5])
      .range([innerHeight, 0])
      .nice();

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(6);
    const yAxis = d3.axisLeft(yScale).ticks(6);

    const xAxisG = g
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis);

    const yAxisG = g.append("g").call(yAxis);

    // Remove axis lines and ticks for cleaner look
    xAxisG.selectAll(".domain").remove();
    xAxisG.selectAll(".tick line").remove();
    yAxisG.selectAll(".domain").remove();
    yAxisG.selectAll(".tick line").remove();

    // Labels
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 35)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px") // Decreased font size
      .attr("fill", theme.palette.text.primary)
      .text("Dimension 1");

    g.append("text")
      .attr("x", -innerHeight / 2)
      .attr("y", -35)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .attr("font-size", "10px") // Decreased font size
      .attr("fill", theme.palette.text.primary)
      .text("Dimension 2");

    // Color scale based on context
    const colorScale = d3
      .scaleOrdinal()
      .domain(["Warfare PTSD", "Non-Warfare PTSD"])
      .range([theme.palette.grey[600], theme.palette.primary.main]); // Colors remain unchanged

    // Draw points with keyword labels
    const points = g.selectAll("g.point-group")
      .data(mockData)
      .enter()
      .append("g")
      .attr("class", "point-group");

    points.append("circle")
      .attr("cx", (d) => xScale(d.embedding[0]))
      .attr("cy", (d) => yScale(d.embedding[1]))
      .attr("r", 3) // Circle size
      .attr("fill", (d) => colorScale(d.context))
      .style("cursor", "default");

    points.append("text")
      .attr("x", (d) => xScale(d.embedding[0]) + 4) // Slight offset
      .attr("y", (d) => yScale(d.embedding[1]) + 3) // Slight offset
      .text((d) => d.keyword) // Display only keyword
      .attr("font-size", "8px") // Decreased font size
      .attr("fill", theme.palette.text.primary);

    // Optional: Add tooltips with only keywords (if desired)
    // Uncomment the following lines if you want tooltips to show keywords
    /*
    points.append("title")
      .text((d) => d.keyword);
    */

    // If you prefer to remove tooltips entirely, simply do not include the above code.

    // Draw Origin
    g.append("circle")
      .attr("cx", xScale(0))
      .attr("cy", yScale(0))
      .attr("r", 4) // Slightly larger for visibility
      .attr("fill", theme.palette.text.primary);

    // Draw Legend
    const legendData = [
      { label: "Warfare PTSD", color: theme.palette.grey[600] },
      { label: "Non-Warfare PTSD", color: theme.palette.primary.main },
    ];

    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`);

    legendData.forEach((item, index) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${index * 15})`); // Reduced spacing

      legendRow
        .append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 4) // Legend circle size
        .attr("fill", item.color);

      legendRow
        .append("text")
        .attr("x", 10)
        .attr("y", 3) // Slight vertical alignment
        .text(item.label)
        .attr("font-size", "8px") // Decreased font size
        .attr("fill", theme.palette.text.primary);
    });

  }, [mockData, dimensions, theme]);

  return (
    <Card sx={{ backgroundColor: "transparent", width: "100%", mx: "auto" }}>
      <CardContent>
        <Box
          sx={{
            position: "relative",
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            border: "none", // Remove border
            boxShadow: "none", // Remove shadow
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {/* SVG Canvas */}
          <svg ref={svgRef} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default BertVisualization;
