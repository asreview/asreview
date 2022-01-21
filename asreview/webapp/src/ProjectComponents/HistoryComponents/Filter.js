import * as React from "react";
import { Autocomplete, IconButton, InputBase, Popper } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FilterList } from "@mui/icons-material";

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
      backgroundColor: "transparent",
    },
  },
}));

export default function Filter(props) {
  const [placeholder, setPlaceholder] = React.useState("Filter");
  const filterInput = React.useRef(null);

  const customPopper = (props) => {
    return (
      <Popper {...props} style={{ width: 140 }} placement="bottom-start" />
    );
  };

  const handleFilterQuery = (value) => {
    // hide place holder
    if (value.length) {
      setPlaceholder("");
    } else {
      setPlaceholder("Filter");
    }
    // pass filter query
    props.setFilterQuery(value);
  };

  const onClickFilter = () => {
    filterInput.current.focus();
  };

  return (
    <Root>
      <IconButton className={classes.icon} onClick={onClickFilter}>
        <FilterList fontSize={!props.mobileScreen ? "medium" : "small"} />
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
        options={props.filterOptions}
        getOptionLabel={(option) => option.label}
        PopperComponent={customPopper}
        renderInput={(params) => {
          const { InputLabelProps, InputProps, ...rest } = params;
          return (
            <InputBase
              {...params.InputProps}
              {...rest}
              inputRef={filterInput}
              placeholder={placeholder}
            />
          );
        }}
        onChange={(event, value) => {
          handleFilterQuery(value);
        }}
      />
      {/*
      <Tooltip title="Remove filter">
        <IconButton className={classes.icon}>
          <Close />
        </IconButton>
      </Tooltip>
    */}
    </Root>
  );
}
