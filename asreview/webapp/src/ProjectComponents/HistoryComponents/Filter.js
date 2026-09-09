import { FilterList } from "@mui/icons-material";
import {
  Badge,
  Chip,
  CircularProgress,
  IconButton,
  InputBase,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { api_url } from "globals.js";
import axios from "axios";
import * as React from "react";

const STATIC_FILTER_DEFS = [
  {
    key: "has_note",
    label: "Contains note",
    options: [
      { value: "has_note", label: "True", symbol: "✓" },
      { value: "has_note=false", label: "False", symbol: "\u20E0" },
    ],
  },
  {
    key: "is_prior",
    label: "Prior knowledge",
    options: [
      { value: "is_prior", label: "True", symbol: "✓" },
      { value: "is_prior=false", label: "False", symbol: "\u20E0" },
    ],
  },
];

/**
 * Build tag filter definitions from the project's tag configuration.
 * Each tag group becomes a filter row, and each tag value within it
 * becomes a True/False toggle.
 */
function buildTagFilterDefs(tagsConfig) {
  if (!tagsConfig || !Array.isArray(tagsConfig)) return [];
  return tagsConfig.flatMap((group) =>
    (group.values || []).map((tag) => ({
      key: `tag_${group.export}_${tag.export}`,
      label: `tag: ${tag.label}`,
      options: [
        {
          value: `tag_${group.export}_${tag.export}`,
          label: "True",
          symbol: "✓",
        },
        {
          value: `tag_${group.export}_${tag.export}=false`,
          label: "False",
          symbol: "\u20E0",
        },
      ],
    })),
  );
}

const PREFIX = "Filter";

const classes = {
  icon: `${PREFIX}-icon`,
  popover: `${PREFIX}-popover`,
  filterRow: `${PREFIX}-filterRow`,
  searchInput: `${PREFIX}-searchInput`,
};

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(3),
  flexWrap: "wrap",
  gap: theme.spacing(0.5),
  [`& .${classes.icon}`]: {
    color: theme.palette.text.secondary,
    [`:hover`]: {
      bgcolor: "transparent",
    },
  },
  [`& .${classes.popover}`]: {
    minWidth: 260,
    maxHeight: 400,
    overflow: "auto",
  },
  [`& .${classes.filterRow}`]: {
    padding: theme.spacing(1, 0),
    "& + &": {
      borderTop: `1px solid ${theme.palette.divider}`,
    },
  },
  [`& .${classes.searchInput}`]: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingBottom: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
  },
}));

export default function Filter(props) {
  const anchorRef = React.useRef(null);
  const searchRef = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [tagDefs, setTagDefs] = React.useState([]);
  const [tagsLoading, setTagsLoading] = React.useState(false);

  const activeFilters = props.filterQuery || [];

  // Fetch tag configuration when the popover opens
  const fetchTags = React.useCallback(() => {
    if (!props.project_id) return;
    setTagsLoading(true);
    axios
      .get(api_url + `projects/${props.project_id}/tags`, {
        withCredentials: true,
      })
      .then((res) => {
        setTagDefs(buildTagFilterDefs(res.data));
      })
      .catch(() => {
        setTagDefs([]);
      })
      .finally(() => {
        setTagsLoading(false);
      });
  }, [props.project_id]);

  const allFilterDefs = [...STATIC_FILTER_DEFS, ...tagDefs];

  const activeKeys = new Set(
    activeFilters.map((f) => (f.value || "").split("=")[0]).filter(Boolean),
  );

  const getFilterState = (key) => {
    const entry = activeFilters.find((f) => f.value && f.value.startsWith(key));
    if (!entry) return null;
    return entry.value;
  };

  const setFilterState = (key, value) => {
    const others = activeFilters.filter(
      (f) => !f.value || !f.value.startsWith(key),
    );
    const def = allFilterDefs.find((d) => d.key === key);
    const opt = def?.options.find((o) => o.value === value);
    props.setFilterQuery([
      ...others,
      { value, label: `${def.label} ${opt.symbol}` },
    ]);
  };

  const removeFilter = (value) => {
    props.setFilterQuery(activeFilters.filter((f) => f.value !== value));
  };

  const searchLower = search.toLowerCase();
  const availableFilters = allFilterDefs.filter(
    (def) =>
      !activeKeys.has(def.key) && def.label.toLowerCase().includes(searchLower),
  );

  // Truncate label text to maxLen characters
  const truncateLabel = (label, maxLen = 50) => {
    if (label.length <= maxLen) return label;
    return label.slice(0, maxLen) + "...";
  };

  // Render a chip label with the trailing symbol bolded and text truncated
  const renderChipLabel = (label, maxLen = 30) => {
    const match = label.match(/^(.+)\s+([\u2713\u20E0]+)$/);
    if (match) {
      let text = match[1];
      if (text.length > maxLen) {
        text = text.slice(0, maxLen) + "...";
      }
      return (
        <span>
          {text} <span style={{ fontWeight: 700 }}>{match[2]}</span>
        </span>
      );
    }
    return label;
  };

  const handleOpen = () => {
    setSearch("");
    if (tagDefs.length === 0 && !tagsLoading) {
      fetchTags();
    }
    setOpen(true);
  };

  const hasVisibleFilters =
    allFilterDefs.some((d) => !activeKeys.has(d.key)) ||
    activeFilters.length > 0;

  if (!hasVisibleFilters) {
    return null;
  }

  return (
    <Root>
      <IconButton ref={anchorRef} className={classes.icon} onClick={handleOpen}>
        <Badge
          badgeContent={activeFilters.length}
          color="primary"
          invisible={activeFilters.length === 0}
          sx={{
            "& .MuiBadge-badge": {
              fontSize: 9,
              height: 16,
              minWidth: 16,
            },
          }}
        >
          <FilterList />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <Stack className={classes.popover} spacing={1} sx={{ p: "10px" }}>
          <InputBase
            className={classes.searchInput}
            inputRef={searchRef}
            placeholder="Search filters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {tagsLoading ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                Loading tag filters...
              </Typography>
            </Stack>
          ) : availableFilters.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {search ? "No matching filters" : "All filters active"}
            </Typography>
          ) : (
            availableFilters.map((def) => {
              const currentValue = getFilterState(def.key);
              return (
                <div key={def.key} className={classes.filterRow}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {def.options.map((opt) => {
                      const isSelected = opt.value === currentValue;
                      return (
                        <Chip
                          key={opt.label}
                          label={opt.label}
                          size="small"
                          variant={isSelected ? "filled" : "outlined"}
                          color="primary"
                          onClick={() => setFilterState(def.key, opt.value)}
                        />
                      );
                    })}
                    <Typography variant="body2" noWrap title={def.label}>
                      {truncateLabel(def.label)}
                    </Typography>
                  </Stack>
                </div>
              );
            })
          )}
        </Stack>
      </Popover>

      {activeFilters.map((f) => (
        <Chip
          key={f.value}
          label={renderChipLabel(f.label)}
          title={f.label}
          size="small"
          variant="filled"
          color={f.value.endsWith("=false") ? "error" : "primary"}
          onDelete={() => removeFilter(f.value)}
        />
      ))}
    </Root>
  );
}
