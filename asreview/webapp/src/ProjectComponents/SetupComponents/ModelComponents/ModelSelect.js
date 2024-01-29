import React from "react";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { SelectItem } from "../../../ProjectComponents";
import { styled } from "@mui/material/styles";

const PREFIX = "ModelSelect";

const classes = {
  formItem: `${PREFIX}-form-item`,
};

const MenuItemStyled = styled(MenuItem)(({ theme }) => ({
  [`& .${classes.formItem}`]: {
    paddingTop: 16,
    backgroundColor: "#FF0000",
  },
}));

const ModelSelect = ({
  name,
  label,
  items,
  model,
  handleModel,
  disableItem,
  helperText,
}) => (
  <FormControl>
    <InputLabel id={`${name}-select-label`}>{label}</InputLabel>
    <Select
      id={`select-${name}`}
      name={name}
      label={label}
      value={model?.[name]}
      onChange={handleModel}
    >
      {items.map((value) => (
        <MenuItemStyled
          key={`result-item-${value.name}`}
          checked={model?.[name] === value.name}
          value={value.name}
          disabled={disableItem ? disableItem(value.name) : false}
        >
          <SelectItem primary={value.label} secondary={value.description} />
        </MenuItemStyled>
      ))}
    </Select>
    <FormHelperText>{helperText}</FormHelperText>
  </FormControl>
);

export default ModelSelect;
