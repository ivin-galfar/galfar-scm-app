/* eslint-disable react/prop-types */
import { forwardRef } from "react";

const Card = forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-lg border bg-card text-card-foreground ${className}`}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = ({ className = "", ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-5 ${className}`} {...props} />
);
const CardContent = ({ className = "", ...props }) => (
  <div className={`p-5 pt-0 ${className}`} {...props} />
);
const CardTitle = ({ className = "", ...props }) => (
  <h3
    className={`text-sm font-semibold tracking-tight ${className}`}
    {...props}
  />
);
const CardDescription = ({ className = "", ...props }) => (
  <p className={`text-xs text-muted-foreground ${className}`} {...props} />
);

const Button = ({ variant = "default", className = "", ...props }) => (
  <button
    className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${variant === "outline" ? "border bg-background hover:bg-muted" : "bg-primary text-primary-foreground hover:bg-primary/90"} ${className}`}
    {...props}
  />
);

const Badge = ({ className = "", ...props }) => (
  <span
    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium ${className}`}
    {...props}
  />
);

const Separator = ({ className = "", ...props }) => (
  <div
    role="separator"
    className={`h-px w-full bg-border ${className}`}
    {...props}
  />
);

const Skeleton = ({ className = "", ...props }) => (
  <div
    className={`animate-pulse rounded-md bg-muted ${className}`}
    {...props}
  />
);

export {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
};
