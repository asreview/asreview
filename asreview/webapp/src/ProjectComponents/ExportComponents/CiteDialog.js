import React, { useState } from 'react';
import {
  Dialog, 
  DialogTitle, 
  DialogContent,
  Divider,
  List, 
  ListItem,
  Typography,
} from "@mui/material";
import { StyledTextButton } from '../../StyledComponents/StyledButton.js'; 
import { TypographyH5Medium } from '../../StyledComponents/StyledTypography.js'; 

const CiteDialog = ({ isOpen, onClose  }) => {
  const [selectedStyle, setSelectedStyle] = useState('APA');

  const handleClose = () => {
    onClose();
};

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
    'ER  - '
  ]
};

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <TypographyH5Medium>Citation Styles</TypographyH5Medium>
      </DialogTitle>
      <Divider />
      <DialogContent style={{ height: '400px', padding: '24px', display: 'flex', backgroundColor: 'white' }}>
        <div style={{ width: '150px', overflow: 'auto', marginRight: '10px', backgroundColor: 'white' }}>
          <List>
            {Object.keys(citationStyles).map(style => (
            <ListItem 
              key={style} 
              button 
              onClick={() => handleStyleClick(style)}
              style={{
                backgroundColor: style === selectedStyle ? '#f5f5f5' : 'transparent',
                borderRadius: '4px'
              }}
            >
              <StyledTextButton>
                {style}
              </StyledTextButton>
              </ListItem>
            ))}
      </List>
    </div>
    <Divider orientation="vertical" flexItem />
    <div style={{ flex: 1, overflow: 'auto', padding: '0 20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
      <div style={{ marginTop: '20px' }}> {/* Additional marginTop for the text container */}
        {citationStyles[selectedStyle].map((line, index) => (
          <div key={index}>
            <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
              {line}
            </Typography>
          </div>
        ))}
      </div>
    </div>
      </DialogContent>
    </Dialog>
  );
};

export default CiteDialog;