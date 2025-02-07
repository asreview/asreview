import { Stack, Typography } from "@mui/material";
import { useMutation } from "react-query";

import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import { ProjectAPI } from "api";
import { InlineErrorHandler } from "Components";
import { StyledInputSearch } from "StyledComponents/StyledInputSearch";

const DatasetFromSearch = ({ mode, setDataset }) => {
  // const [localURI, setURI] = React.useState("");

  const { error, isError } = useMutation(ProjectAPI.createProject, {
    mutationKey: ["createProject"],
    onSuccess: (data) => {
      setDataset(data);
    },
  });

  return (
    <>
      <Stack spacing={3}>
        <StyledInputSearch
          autoFocus
          endIcon={<ArrowForwardOutlinedIcon />}
          disabled={true}
          onClick={(e) => e.preventDefault()}
          placeholder="Search in OpenAlex"
          value={""}
          onChange={(e) => e.preventDefault()}
        />

        <Typography
          color="error"
          textAlign={"center"}
          variant={"h6"}
          fontFamily={"Roboto Serif"}
        >
          Coming soon!
        </Typography>

        {isError && (
          <InlineErrorHandler message={error?.message + " Please try again."} />
        )}
      </Stack>
    </>
  );
};

export default DatasetFromSearch;
