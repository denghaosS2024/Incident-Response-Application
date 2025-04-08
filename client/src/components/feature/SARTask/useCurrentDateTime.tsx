export const formatDateTime = (date: Date = new Date()): string => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  let hours = date.getHours();
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${month}.${day}.${year} ${hours}:${minutes}${ampm}`;
};

export default formatDateTime;
