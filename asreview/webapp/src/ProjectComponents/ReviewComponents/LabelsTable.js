import React from "react";
import {Box, Typography, Checkbox, FormGroup, FormControlLabel, Card, CardContent} from "@mui/material";
import {styled} from "@mui/material/styles";
import "./ReviewPage.css";

const PREFIX = "LabelsTable";

const classes = {
    categoryCard: `${PREFIX}-categoryCard`,
    title: `${PREFIX}-title`,
};

const categories = [
    {
        name: "Biomes",
        labels: [
            "Boreal Forest",
            "Savanna",
            "Mangrove",
            "Tropical Forest",
            "Forest"
        ]
    },
    {
        name: "Restoration Approaches",
        labels: [
            "Direct seeding (i.e. spreading/planting seeds)",
            "Planting trees (i.e. planting trees as seedlings)",
            "Enrichment planting (i.e. planting trees under existing forest)",
            "Direct seeding (i.e. spreading/planting seeds)",
            "Assisted natural regeneration",
            "Farmer managed natural regeneration"
        ]
    },
    {
        name: "Recovery Data",
        labels: [
            "Measured carbon (or biomass)",
            "Diversity of plant species naturally recruiting",
            "Changes in vegetation structure (i.e. basal area, canopy cover)",
            "Recovery of animal/insect diversity",
            "Social benefits"
        ]
    }
]

const Root = styled("div")(({theme}) => ({
    display: "flex",
    flex: "1 0 auto",
    margin: "auto",
    maxWidth: 960,
    padding: "108px 0px 32px 0px",
    height: "100%",

    [`& .${classes.categoryCard}`]: {
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
                {/*<Typography*/}
                {/*    component="div"*/}
                {/*    className={classes.title}*/}
                {/*    variant={!props.mobileScreen ? "h5" : "h6"}*/}
                {/*    sx={{*/}
                {/*        fontWeight: (theme) => theme.typography.fontWeightRegular,*/}
                {/*    }}*/}
                {/*>*/}
                {/*    Select categories*/}
                {/*</Typography>*/}

                {categories.map((category) => (
                    <Card elevation={2} className={classes.categoryCard}>
                        <CardContent>
                            <Typography variant="h6">{category.name}</Typography>
                            <FormGroup row="false">
                                {category.labels.map((categoryLabel) => (
                                    <FormControlLabel control={<Checkbox/>} label={categoryLabel}/>
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
