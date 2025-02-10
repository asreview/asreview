import { CardHeader, Skeleton } from "@mui/material";

export const LoadingCardHeader = ({
  isLoading,
  title,
  subheader,
  ...props
}) => (
  <CardHeader
    {...props}
    title={isLoading ? <Skeleton width={60} /> : title}
    subheader={isLoading ? <Skeleton width="80%" /> : subheader}
  />
);
