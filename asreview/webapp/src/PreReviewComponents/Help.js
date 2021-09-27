import React from "react";
import { Dialog, DialogContent } from "@mui/material";

import { DialogTitleWithClose } from "../Components";

/* Hook for the Help button

*/
export const useHelp = () => {
  const [help, setHelp] = React.useState(false);

  const openHelp = () => {
    setHelp(true);
  };

  const closeHelp = () => {
    setHelp(false);
  };

  return [help, openHelp, closeHelp];
};

const Help = (props) => {
  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitleWithClose
        title={"Help: " + props.title}
        onClose={props.onClose}
      />
      <DialogContent dividers={true}>{props.message}</DialogContent>
    </Dialog>
  );
};

export default Help;
