import React from "react";
import {Box, Typography, Checkbox, FormGroup, FormControlLabel, Card, CardContent} from "@mui/material";
import {styled} from "@mui/material/styles";
import "./ReviewPage.css";

const PREFIX = "LabelsTable";

const classes = {
    groupCard: `${PREFIX}-groupCard`,
    title: `${PREFIX}-title`,
};

const Root = styled("div")(({theme}) => ({
    display: "flex",
    flex: "1 0 auto",
    margin: "auto",
    maxWidth: 960,
    padding: "108px 0px 32px 0px",
    height: "100%",

    [`& .${classes.groupCard}`]: {
        borderRadius: 16,
        marginBottom: "16px",
        display: "flex",
        flexDirection: "column",
        width: "100%"
    },

    [`& .${classes.title}`]: {
        lineHeight: 1.2,
    },
}));

const LabelsTable = (props) => {
    return (
        <Root>
            <Box>
                {props.labelGroups.map((group) => (
                    <Card elevation={2} className={classes.groupCard}>
                        <CardContent>
                            <Typography variant="h6">{group.name}</Typography>
                            <FormGroup row="false">
                                {group.labels.map((label) => (
                                    <FormControlLabel
                                        control={
                                            <Checkbox name={`${group.id}:${label.id}`}/>
                                        }
                                        label={label.name}
                                    />
                                ))}
                            </FormGroup>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Root>
    );
};

export default LabelsTable;
