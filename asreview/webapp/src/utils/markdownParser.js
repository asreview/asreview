import React from "react";

// Simple and safe markdown renderer
export const renderMarkdown = (text) => {
  const lines = text.split("\n");
  const elements = [];

  lines.forEach((line, index) => {
    // Handle line breaks for empty lines
    if (line.trim() === "") {
      elements.push(<br key={`br-${index}`} />);
      return;
    }

    // Process inline markdown sequentially
    const parts = [];
    let keyCounter = 0;

    // Create a working copy to process
    const workingLine = line;
    const tokens = [];

    // Find all markdown tokens in order
    // Bold **text** (process first to avoid conflicts with italic)
    const boldRegex = /\*\*(.*?)\*\*/g;
    let boldMatch;
    while ((boldMatch = boldRegex.exec(workingLine)) !== null) {
      tokens.push({
        type: "bold",
        start: boldMatch.index,
        end: boldMatch.index + boldMatch[0].length,
        content: boldMatch[1],
        match: boldMatch[0],
      });
    }

    // Italic *text* (but not part of bold)
    const italicRegex = /(?<!\*)\*([^*\s](?:[^*]*[^*\s])?)\*(?!\*)/g;
    let italicMatch;
    while ((italicMatch = italicRegex.exec(workingLine)) !== null) {
      // Extract match data to avoid closure issues
      const matchStart = italicMatch.index;
      const matchEnd = italicMatch.index + italicMatch[0].length;
      const matchContent = italicMatch[1];
      const matchText = italicMatch[0];

      // Check if this is inside a bold token
      const insideBold = tokens.some(
        (token) =>
          token.type === "bold" &&
          matchStart >= token.start &&
          matchEnd <= token.end,
      );

      if (!insideBold) {
        tokens.push({
          type: "italic",
          start: matchStart,
          end: matchEnd,
          content: matchContent,
          match: matchText,
        });
      }
    }

    // Underline _text_ (but not part of other formatting)
    const underlineRegex = /_([^_\s](?:[^_]*[^_\s])?)_/g;
    let underlineMatch;
    while ((underlineMatch = underlineRegex.exec(workingLine)) !== null) {
      // Extract match data to avoid closure issues
      const matchStart = underlineMatch.index;
      const matchEnd = underlineMatch.index + underlineMatch[0].length;
      const matchContent = underlineMatch[1];
      const matchText = underlineMatch[0];

      // Check if this is inside a bold or italic token
      const insideOtherToken = tokens.some(
        (token) =>
          (token.type === "bold" || token.type === "italic") &&
          matchStart >= token.start &&
          matchEnd <= token.end,
      );

      if (!insideOtherToken) {
        tokens.push({
          type: "underline",
          start: matchStart,
          end: matchEnd,
          content: matchContent,
          match: matchText,
        });
      }
    }

    // Links [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(workingLine)) !== null) {
      tokens.push({
        type: "link",
        start: linkMatch.index,
        end: linkMatch.index + linkMatch[0].length,
        content: linkMatch[1],
        url: linkMatch[2],
        match: linkMatch[0],
      });
    }

    // Sort tokens by position
    tokens.sort((a, b) => a.start - b.start);

    // Process tokens in order
    let lastIndex = 0;
    tokens.forEach((token) => {
      // Add text before token
      if (token.start > lastIndex) {
        const textBefore = workingLine.substring(lastIndex, token.start);
        if (textBefore) {
          parts.push(textBefore);
        }
      }

      // Add token element
      switch (token.type) {
        case "bold":
          parts.push(
            <strong key={`bold-${index}-${keyCounter++}`}>
              {token.content}
            </strong>,
          );
          break;
        case "italic":
          parts.push(
            <em key={`italic-${index}-${keyCounter++}`}>{token.content}</em>,
          );
          break;
        case "underline":
          parts.push(
            <u key={`underline-${index}-${keyCounter++}`}>{token.content}</u>,
          );
          break;
        case "link":
          parts.push(
            <a
              key={`link-${index}-${keyCounter++}`}
              href={token.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "inherit", textDecoration: "underline" }}
            >
              {token.content}
            </a>,
          );
          break;
        default:
          break;
      }

      lastIndex = token.end;
    });

    // Add remaining text
    if (lastIndex < workingLine.length) {
      const remainingText = workingLine.substring(lastIndex);
      if (remainingText) {
        parts.push(remainingText);
      }
    }

    // If no markdown was processed, just add the original line
    if (parts.length === 0) {
      parts.push(line);
    }

    elements.push(<span key={`line-${index}`}>{parts}</span>);

    // Add line break after each line except the last
    if (index < lines.length - 1) {
      elements.push(<br key={`line-br-${index}`} />);
    }
  });

  return elements;
};
