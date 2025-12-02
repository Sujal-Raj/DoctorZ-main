export const generateTimeSlots = (start: string, end: string, interval: number = 15) => {

 if (!start || !end) {
    console.warn("⚠️ Invalid start/end time:", start, end);
    return [];
  }


  const slots: { time: string; isActive: boolean }[] = [];
  let current = new Date(`1970-01-01T${start}:00`);
  const endTime = new Date(`1970-01-01T${end}:00`);

  if (isNaN(current.getTime()) || isNaN(endTime.getTime())) {
    console.warn("⚠️ Invalid date format for slot generation");
    return [];
  }


  while (current < endTime) {
    const timeString = current.toTimeString().slice(0, 5); // "HH:MM"
    slots.push({ time: timeString, isActive: true });
    current.setMinutes(current.getMinutes() + interval);
  }

  return slots;
}; 