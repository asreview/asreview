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
    const removeProperty = (propKey, { [propKey]: propValue, ...rest }) => rest;

    const getTagCompositeId = (groupId, tagId) => `${groupId}:${tagId}`;

    const handleTagValueChange = (isChecked, groupId, tagId) => {
        let tagValues;

        if (isChecked) {
            tagValues = {...props.tagValues, [getTagCompositeId(groupId, tagId)]: true};
        } else {
            tagValues = removeProperty(getTagCompositeId(groupId, tagId), props.tagValues);
        }

        console.log(tagValues);

        props.setTagValues(tagValues);
    };

    const isChecked = (groupId, tagId) => {
        return props.tagValues.hasOwnProperty(getTagCompositeId(groupId, tagId));
    };

    return (
        <Root>
            <Box>
                {props.tags.map((group) => (
                    <Card elevation={2} className={classes.groupCard} key={group.id}>
                        <CardContent>
                            <Typography variant="h6">{group.name}</Typography>
                            <FormGroup row={true}>
                                {group.values.map((tag) => (
                                    <FormControlLabel
                                        key={getTagCompositeId(group.id, tag.id)}
                                        control={
                                            <Checkbox
                                                checked={isChecked(group.id, tag.id)}
                                                onChange={e => {
                                                    handleTagValueChange(e.target.checked, group.id, tag.id);
                                                }}
                                            />
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
