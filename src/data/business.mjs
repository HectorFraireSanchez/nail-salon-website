export const business = {
  name: "Utopian Nails",
  legalDisplayName: "Utopian Nails",
  siteUrl: "https://utopiannailsstudio.com",
  locationName: "Phenix Salon Suites of Camp Bowie",
  address: {
    street: "6201 Sunset Dr Suite 650 Studio 104",
    city: "Fort Worth",
    state: "TX",
    postalCode: "76116",
    country: "US",
    formatted: "6201 Sunset Dr Suite 650 Studio 104, Fort Worth, TX 76116",
    directionsDestination: "Utopian Nails, 6201 Sunset Dr Suite 650 Studio 104, Fort Worth, TX 76116",
  },
  phone: {
    display: "+1 (682) 559-4401",
    uri: "+16825594401",
  },
  email: "utopiannailsdfw@gmail.com",
  timeZone: "America/Chicago",
  walkInsMessage: "Walk-ins welcome",
  social: {
    facebook: "https://www.facebook.com/utopiannailsspa",
    instagram: "https://instagram.com/utopiannailsstudio",
  },
  hours: [
    { day: "Monday", short: "Mon", display: "Closed", closed: true },
    { day: "Tuesday", short: "Tue", display: "10 AM – 7 PM", opens: "10:00", closes: "19:00" },
    { day: "Wednesday", short: "Wed", display: "10 AM – 7 PM", opens: "10:00", closes: "19:00" },
    { day: "Thursday", short: "Thu", display: "10 AM – 7 PM", opens: "10:00", closes: "19:00" },
    { day: "Friday", short: "Fri", display: "10 AM – 7 PM", opens: "10:00", closes: "19:00" },
    { day: "Saturday", short: "Sat", display: "9:30 AM – 6 PM", opens: "09:30", closes: "18:00" },
    { day: "Sunday", short: "Sun", display: "11 AM – 5 PM", opens: "11:00", closes: "17:00" },
  ],
};

export const links = {
  booking: "https://app.squareup.com/appointments/book/v6oi03rl6v98ky/LASGHRSKE2Y0Q/start",
  text: `sms:${business.phone.uri}?body=${encodeURIComponent("Hi! I'd like to book a nail appointment.")}`,
  call: `tel:${business.phone.uri}`,
  email: `mailto:${business.email}`,
  directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(business.address.directionsDestination)}`,
};
