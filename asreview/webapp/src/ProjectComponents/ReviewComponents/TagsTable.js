import React from "react";
import {Box, Typography, Checkbox, FormGroup, FormControlLabel, Card, CardContent} from "@mui/material";
import {styled} from "@mui/material/styles";
import "./ReviewPage.css";

const PREFIX = "TagsTable";

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

const TagsTable = (props) => {
    return (
        <Root>
            <Box>
                {props.tags.map((group) => (
                    <Card elevation={2} className={classes.groupCard}>
                        <CardContent>
                            <Typography variant="h6">{group.name}</Typography>
                            <FormGroup row="false">
                                {group.values.map((tag) => (
                                    <FormControlLabel
                                        control={
                                            <Checkbox name={`${group.id}:${tag.id}`}/>
                                        }
                                        label={tag.name}
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

export default TagsTable;
