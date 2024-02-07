---
myst:
  html_meta:
    "description lang=en": |
      Top-level documentation for pydata-sphinx theme, with links to the rest
      of the site..
html_theme.sidebar_secondary.remove: true
---

# The ASReview LAB documentation: Active learning for Systematic Reviews

Welcome to the ASReview LAB Documentation!

```{gallery-grid}
:grid-columns: 1 2 2 3

- header: "{fas}`bolt;pst-color-primary` Fast screening"
  content: "Powerful and customizable AI to screen large volumes of text. Time saving up to 95%."
- header: "{fas}`arrows-rotate;pst-color-primary` Systematic and interactive"
  content: "Screen systematically and interactively with the AI to find all relevant texts."
- header: "{fas}`circle-half-stroke;pst-color-primary` Customizable interface"
  content: "Users can screen with light and dark themes and change text size."
- header: "{fas}`lightbulb;pst-color-primary` Simulate and validate"
  content: "Rich options to simulate performance or validate another reviewer or AI/LLM."
  link: "lab/simulation_overview.html"
- header: "{fas}`microchip;pst-color-primary` CLI and API"
  content: "Extensive command line interface and application programming interface."
  link: "technical/index.html"
- header: "{fas}`users;pst-color-primary` Community"
  content: "In the active comunity, ASReview users and developers can share ideas and ask question."
  link: "https://github.com/asreview/asreview/discussions"
```

## ASReview LAB user guide

Get started with ASReview

```{toctree}
:maxdepth: 2

lab/index
```

## ASReview LAB Server

All documentation for the ASReview Server config

```{toctree}
:maxdepth: 2

server/index
```

## Technical guide

All resources for them who develop ASReview and the API

```{toctree}
:maxdepth: 2

technical/index
```
