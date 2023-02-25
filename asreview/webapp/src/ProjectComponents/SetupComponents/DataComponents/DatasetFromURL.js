import React from "react";
import { InputBase, Paper, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "react-query";


import LoadingButton from "@mui/lab/LoadingButton";
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { InlineErrorHandler } from "../../../Components";
import { ProjectAPI } from "../../../api/index.js";

const PREFIX = "DatasetFromURL";

const classes = {
  root: `${PREFIX}-root`,
  input: `${PREFIX}-input`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.root}`]: {
    alignItems: "center",
  },

  [`& .${classes.input}`]: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "4px 8px",
  },
}));

const DatasetFromURL = (props) => {

  const queryClient = useQueryClient()

  const { error, isError, isLoading, mutate, reset, data } = useMutation(
    ProjectAPI.mutateData,
    // {
    //   onSettled: () => {
    //     // props.setDisableFetchInfo(false);
    //     // queryClient.invalidateQueries("fetchInfo");
    //   },
    //   onSuccess: () => {

    //     console.log("succes")
    //     console.log(data);
    //     // setListFiles(data);

    //     // queryClient.invalidateQueries("fetchLabeledStats");
    //     // props.toggleAddDataset();
    //   },
    // }
  );

  console.log(data && data["files"])

  const handleURL = (event) => {
    console.log("hdgjkfd")

    // if (props.isAddDatasetError) {
    //   props.reset();
    // }
    props.setURL(event.target.value);
    // setFile(null);


  };

  const addURLOnEnter = (event) => {

    // if (file === null){
    //   if(event.keyCode === 13){
    //       // setListFiles([10, 20, 30])
    //       setFile(10)
    //   }
    // } else {
    //   props.handleSaveDataset();
    // }
  };

  const addURL = (event) => {

    // const query = useQuery("url", postValidateURL)

    console.log(props.url)
    console.log(file)
    console.log({project_id: props.project_id, url: props.url, validate: true})

    // try to validate the url first
    mutate({project_id: props.project_id, url: props.url, validate: true})

    console.log("end mutate")
    // if (file === null){

    //     mutate({project_id: props.project_id, url: props.url, validate: 1})

    //     setListFiles([10, 20, 30])
    //     setFile(10)

    // } else {
    //   props.handleSaveDataset();
    // }
  };

  // const [listFiles, setListFiles] = React.useState(null);
  const [file, setFile] = React.useState('');

  const handleChange = (event: SelectChangeEvent) => {
    setFile(event.target.value);
  };

  return (
    <Root>
      <Stack spacing={3}>
        <Paper
          className={classes.input}
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={(e) => e.preventDefault()}
          variant="outlined"
        >
          <InputBase
            autoFocus
            disabled={props.isAddingDataset}
            fullWidth
            id="url-dataset"
            placeholder="Dataset URL"
            value={props.url}
            onChange={handleURL}
            onKeyDown={addURLOnEnter}
            sx={{ ml: 1, flex: 1 }}
          />
        </Paper>

          {(data && data["files"]) && (
          <FormControl sx={{ m: 1, minWidth: 120 }} disabled={isLoading}>
            <InputLabel id="select-file-label">File</InputLabel>
            <Select
              labelId="select-file-label"
              id="select-file"
              value={file}
              label="File"
              onChange={handleChange}
            >
              {data["files"].map((val,id)=>{
                return <MenuItem key={val["name"]} value={val["link"]}>{val["name"]}</MenuItem>
              })}
            </Select>
            <FormHelperText>Select the file you want to use.</FormHelperText>
          </FormControl>
          )}

          <LoadingButton
            disabled={!props.url}
            loading={isLoading}
            onClick={addURL}
          >
            Add
          </LoadingButton>

        {props.isAddDatasetError && (
          <InlineErrorHandler
            message={props.addDatasetError?.message + " Please try again."}
          />
        )}
      </Stack>
    </Root>
  );
};

export default DatasetFromURL;
