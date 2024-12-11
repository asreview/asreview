import {
    Card,
    CardContent,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableRow,
    useTheme,
  } from "@mui/material";
  
  const ConfusionMatrixRapidElas = () => {
    const theme = useTheme();
  
    const mockData = {
      truePositive: 512,
      falsePositive: 56,
      trueNegative: 5205,
      falseNegative: 479,
    };
  
    // Define styles for different cells
    const cellStyles = {
      truePositive: {
        bgcolor: "grey.600",
        color: "white",
        borderRadius: "8px",
        px: 1.5,
        py: 0.5,
        display: "inline-block",
      },
      falsePositive: {
        bgcolor: "primary.light",
        color: theme.palette.primary.contrastText,
        borderRadius: "8px",
        px: 1.5,
        py: 0.5,
        display: "inline-block",
      },
      trueNegative: {
        bgcolor: "primary.light",
        color: theme.palette.primary.contrastText,
        borderRadius: "8px",
        px: 1.5,
        py: 0.5,
        display: "inline-block",
      },
      falseNegative: {
        bgcolor: "grey.400",
        color: theme.palette.text.primary,
        borderRadius: "8px",
        px: 1.5,
        py: 0.5,
        display: "inline-block",
      },
    };
  
    return (
      <Card sx={{ backgroundColor: "transparent", maxWidth: 500, mx: "auto" }}>
        <CardContent>
          <Box sx={{ overflowX: "auto" }}>
            <Table
              sx={{
                minWidth: 300,
                "& .MuiTableCell-root": {
                  border: "none",
                  textAlign: "center",
                  verticalAlign: "middle",
                  padding: "8px",
                },
              }}
            >
              <TableBody>
                {/* Header Row */}
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell
                    align="center"
                    colSpan={2}
                    sx={{ borderBottom: `2px solid ${theme.palette.divider}` }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      Predicted
                    </Typography>
                  </TableCell>
                </TableRow>
                {/* Sub Header Row */}
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell
                    align="center"
                    sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
                  >
                    <Typography variant="subtitle2">Relevant</Typography>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
                  >
                    <Typography variant="subtitle2">Irrelevant</Typography>
                  </TableCell>
                </TableRow>
                {/* True Positive & False Negative */}
                <TableRow>
                  <TableCell
                    rowSpan={2}
                    sx={{
                      borderRight: `2px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      Actual
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={cellStyles.truePositive}>
                      <Typography variant="body1" fontWeight="bold">
                        {mockData.truePositive}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={cellStyles.falseNegative}>
                      <Typography variant="body1" fontWeight="bold">
                        {mockData.falseNegative}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
                {/* False Positive & True Negative */}
                <TableRow>
                  <TableCell align="center">
                    <Box sx={cellStyles.falsePositive}>
                      <Typography variant="body1" fontWeight="bold">
                        {mockData.falsePositive}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={cellStyles.trueNegative}>
                      <Typography variant="body1" fontWeight="bold">
                        {mockData.trueNegative}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
          {/* Legend */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "center",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  bgcolor: cellStyles.truePositive.bgcolor,
                  borderRadius: 50,
                }}
              ></Box>
              <Typography variant="body2">True Positive</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  bgcolor: cellStyles.falsePositive.bgcolor,
                  borderRadius: 50,
                }}
              ></Box>
              <Typography variant="body2">False Positive</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  bgcolor: cellStyles.trueNegative.bgcolor,
                  borderRadius: 50,
                }}
              ></Box>
              <Typography variant="body2">True Negative</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  bgcolor: cellStyles.falseNegative.bgcolor,
                  borderRadius: 50,
                }}
              ></Box>
              <Typography variant="body2">False Negative</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };
  
  export default ConfusionMatrixRapidElas;
  