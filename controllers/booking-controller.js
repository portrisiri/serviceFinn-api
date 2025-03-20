const prisma = require('../models/index');
const createError = require('../utils/create-error');
const convertToDateTime = require('../utils/convert-to-date-time');

const { isAfter, isBefore, addHours, add, roundToNearestHours, format, getDay, addDays } = require('date-fns');
const { formatInTimeZone } = require('date-fns-tz');

// hourlyAvailability must be an array of objects, where index 0 = Sunday, has startTime and endTime keys
const hourlyAvailability = [
  { day: 'Sunday', startTime: '08:00', endTime: '18:00' },
  { day: 'Monday', startTime: '09:00', endTime: '18:00' },
  { day: 'Tuesday', startTime: '10:00', endTime: '18:00' },
  { day: 'Wednesday', startTime: '08:00', endTime: '18:00' },
  { day: 'Thursday', startTime: '08:00', endTime: '18:00' },
  { day: 'Friday', startTime: '08:00', endTime: '18:00' },
  { day: 'Saturday', startTime: '08:00', endTime: '18:00' },
];

// dailyAvailability must be an array of objects, where index 0 = Sunday, has workday key
const dailyAvailability = [
  { day: 'Sunday', workday: true },
  { day: 'Monday', workday: true },
  { day: 'Tuesday', workday: true },
  { day: 'Wednesday', workday: true },
  { day: 'Thursday', workday: true },
  { day: 'Friday', workday: false },
  { day: 'Saturday', workday: false },
];

// sectionAvailability must be an array of objects, where index 0 = Sunday, has a slots key which contains the slots
const sectionAvailability = [
  {
    day: 'Sunday',
    slots: [
      { start: '08:00', end: '12:00' },
      { start: '13:00', end: '17:00' },
    ],
  },
  {
    day: 'Monday',
    slots: [
      { start: '08:00', end: '12:00' },
      { start: '13:00', end: '17:00' },
    ],
  },
  {
    day: 'Tuesday',
    slots: [
      { start: '08:00', end: '12:00' },
      { start: '13:00', end: '17:00' },
    ],
  },
  {
    day: 'Wednesday',
    slots: [
      { start: '08:00', end: '12:00' },
      { start: '13:00', end: '17:00' },
    ],
  },
  {
    day: 'Thursday',
    slots: [
      { start: '08:00', end: '12:00' },
      { start: '13:00', end: '17:00' },
    ],
  },
  {
    day: 'Friday',
    slots: [{ start: '08:00', end: '12:00' }],
  },
  {
    day: 'Saturday',
    slots: [],
  },
];

const bookingController = {};

bookingController.getHourlySlots = async (req, res, next) => {
  try {
    function isBooked(timeSlot) {
      return bookedSlots.some((bookedSlot) => new Date(bookedSlot.startTime).getTime() === timeSlot.getTime());
    }

    // ProviderId = Clerk userId from ClerkMiddleware
    const providerId = 'P12345BKK';
    // Use the providerId to fetch the availability
    // const availability = []
    // Use the providerId to fetch any existing bookings
    // Prisma ORM does not support Date, only DateTime
    const bookedDateStart = convertToDateTime(new Date(), '00:00');
    const bookedDateEnd = addDays(bookedDateStart, 2);
    const bookedSlots = await prisma.booking.findMany({
      where: {
        providerId,
        startDate: {
          gte: bookedDateStart,
          lte: bookedDateEnd,
        },
      },
      select: {
        startTime: true,
      },
    });

    // Get the current, and round to the next hour
    const startTime = roundToNearestHours(new Date(), { roundingMethod: 'ceil' });
    // Generate slots starting from startTime
    let currentTime = startTime;
    // Get the day of the current date
    let currentDay = currentTime.getDay();

    // Create an empty array to hold the timeslots
    const providerSlots = [];

    
    // Begin looping
    // i is the number of days to generate slots for, eg 3 = today, tomorrow, day after tomorrow
    for (let i = 0; i < 3; i++) {
      let availabilityDay = hourlyAvailability[currentDay];
      let availabilityStartTime = convertToDateTime(currentTime, availabilityDay.startTime);
      let availabilityEndTime = convertToDateTime(currentTime, availabilityDay.endTime);
      const day = {
        date: formatInTimeZone(currentTime, 'Asia/Bangkok', 'yyyy-MM-dd'),
        providerStartTime: formatInTimeZone(availabilityStartTime, 'Asia/Bangkok', "yyyy-MM-dd'T'HH:mmXXX"),
        providerEndTime: formatInTimeZone(availabilityEndTime, 'Asia/Bangkok', "yyyy-MM-dd'T'HH:mmXXX"),
        slots: [],
      };
      while (currentTime < availabilityEndTime) {
        if (isBooked(currentTime)) {
          // Create a slot for the currentTime
          const slot = {
            startTime: formatInTimeZone(currentTime, 'Asia/Bangkok', "yyyy-MM-dd'T'HH:mmXXX"),
            isAvailable: false,
          };
          day.slots.push(slot);
        } else {
          // Create a slot for the currentTime
          const slot = {
            startTime: formatInTimeZone(currentTime, 'Asia/Bangkok', "yyyy-MM-dd'T'HH:mmXXX"),
            isAvailable: true,
          };
          day.slots.push(slot);
        }
        // Push into the slots array

        // Add 1 hour to the current time
        currentTime = addHours(currentTime, 1);
      }
      providerSlots.push(day);
      // Once finished looping through the current day, move to the next day
      // Move the day of the week forward, eg Monday to Tuesday
      currentDay = currentDay + 1 < 7 ? currentDay + 1 : 0;
      // Move the date forward, eg 24th to 25th
      currentTime = addDays(currentTime, 1);
      // Set the currentTime to tomorrow at the startTime
      currentTime = convertToDateTime(currentTime, hourlyAvailability[currentDay].startTime);
    }

    res.json({ bookedSlots, providerSlots });
  } catch (error) {
    next(error);
  }
};

bookingController.getDailySlots = async (req, res, next) => {
  try {
    function isBooked(timeSlot) {
      return bookedSlots.some((bookedSlot) => new Date(bookedSlot.startTime).getDate() === timeSlot.getDate());
    }

    // ProviderId = Clerk userId from ClerkMiddleware
    const providerId = 'P12345BKK';
    // Use the providerId to fetch the availability
    // const availability = []
    // Use the providerId to fetch any existing bookings
    // Prisma ORM does not support Date, only DateTime
    let bookedDateStart = convertToDateTime(new Date(), '00:00');
    // User cannot book daily slot for the same day, start from tomorrow
    bookedDateStart = addDays(bookedDateStart, 1);
    const bookedDateEnd = addDays(bookedDateStart, 7);

    const bookedSlots = await prisma.booking.findMany({
      where: {
        providerId,
        startDate: {
          gte: bookedDateStart,
          lte: bookedDateEnd,
        },
      },
      select: {
        startTime: true,
      },
    });

    // Start generating slots from tomorrow
    const startDate = bookedDateStart;
    let currentDate = startDate;
    // Get the day of the current date
    let currentDay = currentDate.getDay();

    // Create an empty array to hold the timeslots
    const providerSlots = [];

    // Begin looping
    // i is the number of days to generate slots for, eg 3 = today, tomorrow, day after tomorrow
    for (let i = 0; i < 7; i++) {
      let availabilityDay = dailyAvailability[currentDay];
      console.log(availabilityDay);
      if (availabilityDay.workday == false) {
        const slot = {
          date: formatInTimeZone(currentDate, 'Asia/Bangkok', 'yyyy-MM-dd'),
          isAvailable: false,
        };
        providerSlots.push(slot);
        currentDay = currentDay + 1 < 7 ? currentDay + 1 : 0;
        currentDate = addDays(currentDate, 1);
        continue;
      }
      if (isBooked(currentDate)) {
        // Create a slot for the currentTime
        const slot = {
          date: formatInTimeZone(currentDate, 'Asia/Bangkok', 'yyyy-MM-dd'),
          isAvailable: false,
        };
        providerSlots.push(slot);
      } else {
        // Create a slot for the currentTime
        const slot = {
          date: formatInTimeZone(currentDate, 'Asia/Bangkok', 'yyyy-MM-dd'),
          isAvailable: true,
        };
        providerSlots.push(slot);
      }

      // Once finished looping through the current day, move to the next day
      // Move the day of the week forward, eg Monday to Tuesday
      currentDay = currentDay + 1 < 7 ? currentDay + 1 : 0;
      // Move the date forward, eg 24th to 25th
      currentDate = addDays(currentDate, 1);
    }

    res.json({ bookedSlots, providerSlots });
  } catch (error) {
    next(error);
  }
};

bookingController.getSectionSlots = async (req, res, next) => {
  try {
    function isBooked(timeSlot) {
      return bookedSlots.some((bookedSlot) => new Date(bookedSlot.startTime).getTime() === timeSlot.getTime());
    }

    // ProviderId = Clerk userId from ClerkMiddleware
    const providerId = 'P12345BKK';
    // Use the providerId to fetch the availability
    // const availability = []
    // Use the providerId to fetch any existing bookings
    // Prisma ORM does not support Date, only DateTime
    const bookedDateStart = convertToDateTime(new Date(), '00:00');
    const bookedDateEnd = addDays(bookedDateStart, 7);
    const bookedSlots = await prisma.booking.findMany({
      where: {
        providerId,
        startDate: {
          gte: bookedDateStart,
          lte: bookedDateEnd,
        },
      },
      select: {
        startTime: true,
      },
    });

    // Get the current, and round to the next hour
    const startTime = new Date();
    // Generate slots starting from startTime
    let currentTime = startTime;
    // Get the day of the current date
    let currentDay = currentTime.getDay();

    // Create an empty array to hold the timeslots
    const providerSlots = [];

    // Begin looping
    // i is the number of days to generate slots for, eg 3 = today, tomorrow, day after tomorrow
    for (let i = 0; i < 7; i++) {
      let availabilityDay = sectionAvailability[currentDay];
      const slots = {
        date: formatInTimeZone(convertToDateTime(currentTime, '00:00'), 'Asia/Bangkok', 'yyyy-MM-dd'),
        slots: [],
      };

      // For the first loop, check against current time
      if (i == 0) {
        slots.slots = availabilityDay.slots.map((slot) => {
          if (currentTime > slot.start) {
            return;
          }

          const section = {
            start: formatInTimeZone(
              convertToDateTime(currentTime, slot.start),
              'Asia/Bangkok',
              "yyyy-MM-dd'T'HH:mmXXX"
            ),
            end: formatInTimeZone(convertToDateTime(currentTime, slot.end), 'Asia/Bangkok', "yyyy-MM-dd'T'HH:mmXXX"),
          };

          if (isBooked(new Date(section.start))) {
            section.isAvailable = false;
          } else {
            section.isAvailable = true;
          }

          return section;
        });
        // Move to next day
        currentDay = currentDay + 1 < 7 ? currentDay + 1 : 0;
        currentTime = addDays(currentTime, 1);
        continue;
      }

      slots.slots = availabilityDay.slots.map((slot) => {
        const section = {
          start: formatInTimeZone(convertToDateTime(currentTime, slot.start), 'Asia/Bangkok', "yyyy-MM-dd'T'HH:mmXXX"),
          end: formatInTimeZone(convertToDateTime(currentTime, slot.end), 'Asia/Bangkok', "yyyy-MM-dd'T'HH:mmXXX"),
          display: 'test',
        };

        if (isBooked(new Date(section.start))) {
          section.isAvailable = false;
        } else {
          section.isAvailable = true;
        }
        return section;
      });

      providerSlots.push(slots);
      // Once finished looping through the current day, move to the next day
      // Move the day of the week forward, eg Monday to Tuesday
      currentDay = currentDay + 1 < 7 ? currentDay + 1 : 0;
      // Move the date forward, eg 24th to 25th
      currentTime = addDays(currentTime, 1);
    }

    res.json({ bookedSlots, providerSlots });
  } catch (error) {
    next(error);
  }
};

bookingController.getCurrentBookings = async (req, res, next) => {
  try {
    const { role, id } = req.params;

    // Check when Clerk is utilized
    // const userId = req.auth.userId;
    // if (userId != id) {
    //   return createError(400, 'Unauthorized');
    // }

    let userId, providerId;

    if (role.toUpperCase() == 'USER') {
      userId = id;
      providerId = undefined;
    } else if (role.toUpperCase() == 'PROVIDER') {
      providerId = id;
      userId = undefined;
    } else {
      return createError(400, 'Incorrect Role');
    }

    const todayDate = new Date();

    const results = await prisma.booking.findMany({
      where: {
        userId,
        providerId,
        endDate: {
          gte: todayDate,
        },
      },
    });

    res.status(200).json({ results });
  } catch (error) {
    next(error);
  }
};

bookingController.getPastBookings = async (req, res, next) => {
  try {
    const { role, id } = req.params;

    // Check when Clerk is utilized
    // const userId = req.auth.userId;
    // if (userId != id) {
    //   return createError(400, 'Unauthorized');
    // }

    let userId, providerId;

    if (role.toUpperCase() == 'USER') {
      userId = id;
      providerId = undefined;
    } else if (role.toUpperCase() == 'PROVIDER') {
      providerId = id;
      userId = undefined;
    } else {
      return createError(400, 'Incorrect Role');
    }

    const todayDate = new Date();

    const results = await prisma.booking.findMany({
      where: {
        userId,
        providerId,
        endDate: {
          lte: todayDate,
        },
      },
    });

    res.status(200).json({ results });
  } catch (error) {
    next(error);
  }
};

bookingController.createBooking = async (req, res, next) => {
  try {
    const {
      userId,
      providerId,
      serviceId,
      startDate: startDateLocal,
      endDate: endDateLocal,
      startTime,
      endTime,
      latitude,
      longitude,
      jobScope,
    } = req.body;

    

    // Frontend will send all data in the local timezone
    // Backend will have to format into UTC
    const startDate = new Date(startDateLocal);
    const endDate = new Date(endDateLocal);

    // Check if endDate is after startDate
    if (isBefore(endDate, startDate)) {
      return createError(400, 'Start date cannot be after end date');
    }

    const ifOverlap = await prisma.booking.findFirst({
      where: {
        providerId,
        OR: [
          {
            startDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            endDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            startDate: {
              lte: startDate,
            },
            endDate: {
              gte: endDate,
            },
          },
        ],
      },
    });

    if (ifOverlap) {
      return createError(400, 'This provider is unavailable at the selected timeslot, please select another timeslot');
    }

    const result = await prisma.booking.create({
      data: {
        userId,
        providerId,
        serviceId,
        startDate,
        endDate,
        startTime: startDate,
        endTime: endDate,
        latitude,
        longitude,
        jobScope,
      },
    });
    res.json({ result });
  } catch (error) {
    next(error);
  }
};

bookingController.updateBookingDetail = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { details } = req.body;
    const userId = req.auth.userId;
    const booking = await prisma.booking.findFirstOrThrow({
      where: {
        bookingId: Number(bookingId),
      },
    });
    
    if (booking.status != 'PENDING') {
      return createError(400, 'Once confirmed, booking details cannot be updated');
    }
    if (booking.userId != userId) {
      return createError(400, 'This is not your booking!');
    }
    const updatedBooking = await prisma.booking.update({
      where: {
        bookingId: Number(bookingId),
      },
      data: { details },
    });
    res.json({ updatedBooking });
  } catch (error) {
    next(error);
  }
};

bookingController.updateBookingStatus = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { userId, providerId, status } = req.body;
    const clerkId = req.auth.userId;
    const booking = await prisma.booking.findFirstOrThrow({
      where: {
        bookingId: Number(bookingId),
      },
    });

    // If userId exists, let identity = userId, if not then identity = providerId
    const identity = userId ? userId : providerId;
    // Check identity against clerkId from ClerkMiddleware
    if (clerkId != identity) {
      return createError(400, 'Not your booking!');
    }

    const updatedBooking = await prisma.booking.update({
      where: {
        bookingId: Number(bookingId),
      },
      data: {
        status,
      },
    });
    res.json({ updatedBooking });
  } catch (error) {
    next(error);
  }
};

module.exports = bookingController;
