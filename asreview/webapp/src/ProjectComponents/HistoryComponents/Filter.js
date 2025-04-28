import { FilterList } from "@mui/icons-material";
import { Autocomplete, Checkbox, IconButton, InputBase } from "@mui/material";
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
  alignItems: "center",
  padding: 0,
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
        sx={{ ml: 1, display: "flex", flexGrow: 1 }}
        blurOnSelect
        disableClearable
        filterSelectedOptions
        multiple
        openOnFocus
        options={historyFilterOptions}
        getOptionLabel={(option) => option.label}
        renderOption={(props, option, { selected }) => (
          <li {...props} key={option.value}>
            <Checkbox style={{ marginRight: 8 }} checked={selected} />
            {option.label}
          </li>
        )}
        renderInput={(params) => {
          const { InputLabelProps, InputProps, ...rest } = params;
          return (
            <InputBase
              {...params.InputProps}
              {...rest}
              sx={{ width: "100%" }}
              inputRef={filterInput}
              placeholder={!props.filterQuery.length ? "Filter" : ""}
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
