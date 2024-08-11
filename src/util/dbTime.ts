export const formatDbDate = (time: Date, usingUtc: boolean) => {
  const date = new Date(time);

  if (usingUtc) {
    const hoursUTC = date.getUTCHours().toString().padStart(2, '0');
    const minutesUTC = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hoursUTC}:${minutesUTC}`;
  } else {
    const hoursUTC = date.getHours().toString().padStart(2, '0');
    const minutesUTC = date.getMinutes().toString().padStart(2, '0');
    return `${hoursUTC}:${minutesUTC}`;
  }
};
