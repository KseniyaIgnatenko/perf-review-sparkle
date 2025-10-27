export const getProgressColor = (progress: number): string => {
  if (progress < 30) {
    return "text-destructive";
  } else if (progress < 70) {
    return "text-warning";
  } else {
    return "text-success";
  }
};

export const getProgressBarColor = (progress: number): string => {
  if (progress < 30) {
    return "bg-destructive";
  } else if (progress < 70) {
    return "bg-warning";
  } else {
    return "bg-gradient-success";
  }
};

export const getProgressBgColor = (progress: number): string => {
  if (progress < 30) {
    return "bg-destructive/10";
  } else if (progress < 70) {
    return "bg-warning-light";
  } else {
    return "bg-success-light";
  }
};
