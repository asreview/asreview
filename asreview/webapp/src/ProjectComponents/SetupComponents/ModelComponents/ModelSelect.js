import React from "react";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { SelectItem } from "ProjectComponents";

const ModelSelect = ({
  name,
  label,
  items,
  model,
  handleModel,
  disableItem,
  helperText,
  editable = true,
}) => (
  <FormControl>
    <InputLabel id={`${name}-select-label`}>{label}</InputLabel>
    <Select
      id={`select-${name}`}
      name={name}
      label={label}
      value={model?.[name]}
      onChange={handleModel}
      disabled={!editable}
    >
      {items.map((value) => (
        <MenuItem
          key={`result-item-${value.name}`}
          checked={model?.[name] === value.name}
          value={value.name}
          disabled={disableItem ? disableItem(value.name) : false}
        >
          <SelectItem primary={value.label} secondary={value.description} />
        </MenuItem>
      ))}
    </Select>
    <FormHelperText>{helperText}</FormHelperText>
  </FormControl>
);

export default ModelSelect;
