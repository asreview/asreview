import { FilterList } from "@mui/icons-material";
import { Autocomplete, IconButton, InputBase } from "@mui/material";
import { styled } from "@mui/material/styles";
import * as React from "react";

const historyFilterOptions = [
  { value: "has_note", label: "Contains note" },
  { value: "is_prior", label: "Prior knowledge" },
];

const PREFIX = "Filter";

const classes = {
  icon: `${PREFIX}-icon`,
};

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  padding: "4px 16px",
  [`& .${classes.icon}`]: {
    color: theme.palette.text.secondary,
    [`:hover`]: {
      bgcolor: "transparent",
    },
  },
}));

export default function Filter(props) {
  const filterInput = React.useRef(null);

  const onClickFilter = () => {
    filterInput.current.focus();
  };

  return (
    <Root>
      <IconButton className={classes.icon} onClick={onClickFilter}>
        <FilterList />
      </IconButton>
      <Autocomplete
        id="filter labeled record"
        sx={{ ml: 1, flex: 1, display: "flex" }}
        blurOnSelect
        disableClearable
        freeSolo
        filterSelectedOptions
        multiple
        openOnFocus
        options={historyFilterOptions}
        getOptionLabel={(option) => option.label}
        renderInput={(params) => {
          const { InputLabelProps, InputProps, ...rest } = params;
          return (
            <InputBase
              {...params.InputProps}
              {...rest}
              inputRef={filterInput}
              placeholder={!props.filterQuery.length ? "Filter" : ""}
              readOnly
            />
          );
        }}
        onChange={(event, value) => {
          props.setFilterQuery(value);
        }}
        value={props.filterQuery}
      />
    </Root>
  );
}
