  import React, { useState } from 'react';
  import {
    Dialog, 
    DialogTitle, 
    DialogContent,
    Divider,
    ListItem,
    Typography,
    useTheme
  } from "@mui/material";
  import { StyledTextButton } from '../StyledComponents/StyledButton.js'; 
  import { styled } from "@mui/material/styles";

const PREFIX = "CiteDialog";

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  backgroundColor: selected ? theme.palette.action.selected : 'transparent',
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  padding: theme.spacing(0.5),
}));

const CitationStylesRow = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  overflowX: 'auto',
  padding: theme.spacing(1),
  '& > *': {
    marginRight: theme.spacing(1),
  },
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'column',
  },
}));

  const CiteDialog = ({ isOpen, onClose, mobileScreen }) => {
    const theme = useTheme();
    const [selectedStyle, setSelectedStyle] = useState('APA');
    const handleStyleClick = (style) => setSelectedStyle(style);

    const citationStyles = {
    'APA': [
      'ASReview LAB developers. (2023). ASReview LAB: A tool for AI-assisted systematic reviews (Version [version number]) [Software]. Zenodo. https://doi.org/10.5281/zenodo.3345592',
    ],
    'MLA': [
      'ASReview LAB developers. "ASReview LAB: A Tool for AI-Assisted Systematic Reviews." Zenodo, 2023, https://doi.org/10.5281/zenodo.3345592.'
    ],
    'Chicago': [
    'ASReview LAB developers. 2023. "ASReview LAB: A Tool for AI-Assisted Systematic Reviews." Zenodo. https://doi.org/10.5281/zenodo.3345592.'
    ],
    'Vancouver': [
    'ASReview LAB developers. ASReview LAB: A Tool for AI-Assisted Systematic Reviews [Internet]. Zenodo; 2023 [cited year month day]. Available from: https://doi.org/10.5281/zenodo.3345592'
    ],
    'BibTex': [
      '@software{asreviewlab2023,',
      'title={{ASReview LAB: A Tool for AI-Assisted Systematic Reviews}},',
      'author={{ASReview LAB developers}},',
      'year={2023},',
      'url={https://doi.org/10.5281/zenodo.3345592},',
      'note={Software version: [version number]}'
    ],
    'RIS': [
      'TY  - COMP',
      'AU  - ASReview LAB developers',
      'PY  - 2023',
      'TI  - ASReview LAB: A Tool for AI-Assisted Systematic Reviews',
      'PB  - Zenodo',
      'UR  - https://doi.org/10.5281/zenodo.3345592',
      'DO  - 10.5281/ZENODO.10084260',
      'ER  - '
    ]
  };

return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth fullScreen={mobileScreen}>
      {!mobileScreen && (
        <DialogTitle>
          Citation Styles
        </DialogTitle>
      )}
      <Divider />
      <StyledDialogContent className={`${PREFIX}-content`}>
        <CitationStylesRow>
          {Object.keys(citationStyles).map(style => (
            <StyledListItem 
              key={style} 
              button 
              onClick={() => handleStyleClick(style)}
              selected={style === selectedStyle} >
              <StyledTextButton>{style}</StyledTextButton>
            </StyledListItem>
          ))}
        </CitationStylesRow>
        <Divider orientation={mobileScreen ? "horizontal" : "vertical"} flexItem />
        <div style={{ flex: 1, overflow: 'auto', padding: theme.spacing(2), backgroundColor: theme.palette.grey[200], borderRadius: theme.shape.borderRadius }}>
          {citationStyles[selectedStyle].map((line, index) => (
            <div key={index} style={{ margin: mobileScreen ? theme.spacing(1, 0) : theme.spacing(0) }}>
              <Typography 
                variant={mobileScreen ? "body2" : "subtitle1"} 
                sx={{ color: theme.palette.text.secondary }}>
                {line}
              </Typography>
            </div>
          ))}
        </div>
      </StyledDialogContent>
    </Dialog>
  );
};

export default CiteDialog;