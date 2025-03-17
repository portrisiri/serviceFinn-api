module.exports = (dateString, timeString) => {
  // dateString can be in any form that can be parse via new Date() constructor
  // timeString must be "HH:MM"

  const ymd = new Date(dateString);
  const year = ymd.getFullYear();
  const month = ymd.getMonth();
  const date = ymd.getDate();
  const [hour, minute] = timeString.split(':');
  const newDateTime = new Date(year, month, date, hour, minute);
  // console.log(newDateTime.toString());

  // this function returns a Date object
  return newDateTime;
};
