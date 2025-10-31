import { CardHeader, Skeleton } from "@mui/material";

export const LoadingCardHeader = ({
  isPending,
  title,
  subheader,
  ...props
}) => (
  <CardHeader
    {...props}
    title={isPending ? <Skeleton width={60} /> : title}
    subheader={isPending ? <Skeleton width="80%" /> : subheader}
  />
);
