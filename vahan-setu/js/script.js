/**
 * VAHAN SETU - Production JavaScript Framework
 * Handles Theme, Mobile Drawer, Fare Calculation, Booking Engine,
 * Interactive Map Corridors, Live GPS Simulation, and Form Validations.
 */

// ==========================================================================
// 1. Theme Toggle & Persistence
// ==========================================================================
function initTheme() {
  const savedTheme = localStorage.getItem('vahan_setu_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
  updateLogoSources(savedTheme);

  const themeBtns = document.querySelectorAll('.js-theme-toggle');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('vahan_setu_theme', nextTheme);
      updateThemeIcon(nextTheme);
      updateLogoSources(nextTheme);
      showToast(`Switched to ${nextTheme} theme`);
    });
  });
}

function updateLogoSources(theme) {
  const logos = document.querySelectorAll('.vs-brand-logo-img:not(.vs-logo-filtered)');
  logos.forEach(logo => {
    logo.src = theme === 'dark' ? 'images/logo/vahan-setu-logo-dark.svg' : 'images/logo/vahan-setu-logo.svg';
  });
}

function updateThemeIcon(theme) {
  const icons = document.querySelectorAll('.js-theme-icon');
  icons.forEach(icon => {
    if (theme === 'dark') {
      icon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    } else {
      icon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    }
  });
}

// ==========================================================================
// 2. Sticky Navbar & Mobile Drawer
// ==========================================================================
function initNavbar() {
  const navbar = document.querySelector('.vs-navbar');
  const mobileToggle = document.querySelector('.vs-mobile-toggle');
  const mobileDrawer = document.querySelector('.vs-mobile-drawer');

  // Sticky shadow effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar?.classList.add('is-scrolled');
    } else {
      navbar?.classList.remove('is-scrolled');
    }

    // Back to top button
    const backToTop = document.querySelector('.vs-back-to-top');
    if (backToTop) {
      if (window.scrollY > 350) {
        backToTop.classList.add('is-visible');
      } else {
        backToTop.classList.remove('is-visible');
      }
    }
  });

  // Mobile drawer toggle
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('is-open');
      mobileToggle.classList.toggle('is-open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close drawer when clicking any link
    const drawerLinks = mobileDrawer.querySelectorAll('a');
    drawerLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('is-open');
        mobileToggle.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  // Active page indicator
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.vs-nav-link, .vs-mobile-menu a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('is-active');
    }
  });

  // Back to top click
  const backToTopBtn = document.querySelector('.vs-back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// ==========================================================================
// 3. Indian City Distance Matrix & Fare Estimation Engine
// ==========================================================================
const VEHICLE_PRICING = {
  bike: { name: 'Bike Taxi', base: 25, perKm: 9, speed: 30, icon: 'images/bikes/bike.svg', seats: '1 Rider' },
  auto: { name: 'Auto Rickshaw', base: 35, perKm: 12, speed: 28, icon: 'images/autos/auto.svg', seats: '3 Passengers' },
  mini: { name: 'Mini Hatchback', base: 60, perKm: 15, speed: 40, icon: 'images/cars/mini.svg', seats: '4 Passengers' },
  sedan: { name: 'Prime Sedan', base: 85, perKm: 18, speed: 45, icon: 'images/cars/sedan.svg', seats: '4 Passengers' },
  suv: { name: 'Prime SUV', base: 120, perKm: 24, speed: 45, icon: 'images/cars/suv.svg', seats: '6 Passengers' },
  luxury: { name: 'Executive Luxury', base: 180, perKm: 32, speed: 50, icon: 'images/cars/luxury.svg', seats: '4 Passengers' },
  tempo: { name: 'Tempo Traveller', base: 300, perKm: 42, speed: 40, icon: 'images/cars/tempo.svg', seats: '12-16 Passengers' },
  pickup: { name: 'Logistics Pickup', base: 250, perKm: 28, speed: 35, icon: 'images/trucks/pickup.svg', seats: '1.2 Ton Payload' },
  truck: { name: 'Medium Truck', base: 550, perKm: 48, speed: 35, icon: 'images/trucks/truck.svg', seats: '5 Ton Payload' },
  container: { name: 'Heavy Container', base: 1400, perKm: 85, speed: 35, icon: 'images/trucks/container.svg', seats: '20 Ton Payload' }
};

const INDIAN_CITY_DISTANCES = {
  'delhi-gurgaon': 32,
  'delhi-noida': 28,
  'delhi-agra': 230,
  'delhi-jaipur': 275,
  'delhi-chandigarh': 250,
  'mumbai-pune': 150,
  'mumbai-nashik': 165,
  'mumbai-ahmedabad': 525,
  'bengaluru-mysuru': 145,
  'bengaluru-chennai': 345,
  'bengaluru-hyderabad': 570,
  'hyderabad-vijayawada': 275,
  'chennai-puducherry': 150,
  'kolkata-durgapur': 170,
  'ahmedabad-surat': 265,
  'jaipur-ajmer': 135
};

function calculateEstimatedDistance(pickup, drop) {
  if (!pickup || !drop) return 14.5;
  const p = pickup.trim().toLowerCase();
  const d = drop.trim().toLowerCase();

  // Check known route pairs
  for (const [pair, dist] of Object.entries(INDIAN_CITY_DISTANCES)) {
    const [c1, c2] = pair.split('-');
    if ((p.includes(c1) && d.includes(c2)) || (p.includes(c2) && d.includes(c1))) {
      return dist;
    }
  }

  // Realistic city transit simulation fallback based on character variation
  let hash = 0;
  for (let i = 0; i < p.length; i++) hash += p.charCodeAt(i);
  for (let i = 0; i < d.length; i++) hash += d.charCodeAt(i);
  const simDistance = 8 + (hash % 26) + ((hash % 10) * 0.1);
  return Math.round(simDistance * 10) / 10;
}

function calculateFare(vehicleType, distanceKm) {
  const vehicle = VEHICLE_PRICING[vehicleType] || VEHICLE_PRICING.sedan;
  const rawFare = vehicle.base + (distanceKm * vehicle.perKm);
  const roundedFare = Math.round(rawFare);
  const durationMins = Math.round((distanceKm / vehicle.speed) * 60) + 5;
  return {
    fare: roundedFare,
    distance: distanceKm,
    duration: durationMins,
    vehicle: vehicle.name
  };
}

// ==========================================================================
// 4. Hero Ride Booking Card Logic
// ==========================================================================
function initHeroBookingCard() {
  const bookingCard = document.querySelector('.js-hero-booking');
  if (!bookingCard) return;

  const pickupInput = bookingCard.querySelector('.js-pickup-input');
  const dropInput = bookingCard.querySelector('.js-drop-input');
  const dateInput = bookingCard.querySelector('.js-date-input');
  const timeInput = bookingCard.querySelector('.js-time-input');
  const vehicleChips = bookingCard.querySelectorAll('.vs-vehicle-chip');
  const distanceValueEl = bookingCard.querySelector('.js-distance-val');
  const fareValueEl = bookingCard.querySelector('.js-fare-val');
  const timeValueEl = bookingCard.querySelector('.js-time-val');
  const estimateBtn = bookingCard.querySelector('.js-estimate-btn');
  const bookNowBtn = bookingCard.querySelector('.js-book-now-btn');

  // Pre-fill today's date & time if empty
  if (dateInput && !dateInput.value) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.min = today;
  }
  if (timeInput && !timeInput.value) {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    timeInput.value = now.toTimeString().substring(0, 5);
  }

  let selectedVehicle = 'sedan';

  // Vehicle selection chip
  vehicleChips.forEach(chip => {
    chip.addEventListener('click', () => {
      vehicleChips.forEach(c => c.classList.remove('is-selected'));
      chip.classList.add('is-selected');
      selectedVehicle = chip.getAttribute('data-vehicle') || 'sedan';
      updateCalculation();
    });
  });

  function updateCalculation() {
    const pickup = pickupInput?.value || 'Connaught Place, New Delhi';
    const drop = dropInput?.value || 'Indira Gandhi International Airport, Terminal 3';
    const dist = calculateEstimatedDistance(pickup, drop);
    const estimate = calculateFare(selectedVehicle, dist);

    if (distanceValueEl) distanceValueEl.textContent = `${estimate.distance} km`;
    if (fareValueEl) fareValueEl.textContent = `₹${estimate.fare}`;
    if (timeValueEl) timeValueEl.textContent = `${estimate.duration} mins`;
    return estimate;
  }

  // Update on input
  pickupInput?.addEventListener('input', updateCalculation);
  dropInput?.addEventListener('input', updateCalculation);

  estimateBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    const p = pickupInput?.value.trim();
    const d = dropInput?.value.trim();
    if (!p || !d) {
      showToast('Please enter both pickup and drop locations to get an accurate estimate', 'error');
      pickupInput?.focus();
      return;
    }
    const estimate = updateCalculation();
    showToast(`Estimated fare for ${VEHICLE_PRICING[selectedVehicle]?.name}: ₹${estimate.fare} (${estimate.distance} km)`, 'success');
  });

  bookNowBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    const p = pickupInput?.value.trim() || 'Connaught Place, New Delhi';
    const d = dropInput?.value.trim() || 'Indira Gandhi International Airport (T3)';
    const dt = dateInput?.value || new Date().toISOString().split('T')[0];
    const tm = timeInput?.value || '10:00';

    // Save booking intent to localStorage
    const bookingIntent = {
      pickup: p,
      drop: d,
      date: dt,
      time: tm,
      vehicle: selectedVehicle
    };
    localStorage.setItem('vahan_setu_booking_intent', JSON.stringify(bookingIntent));

    // Redirect to complete booking flow
    window.location.href = `booking.html?pickup=${encodeURIComponent(p)}&drop=${encodeURIComponent(d)}&vehicle=${selectedVehicle}`;
  });

  // Run initial calculation
  updateCalculation();
}

// ==========================================================================
// 5. Complete Booking Page Controller (booking.html)
// ==========================================================================
function initBookingPage() {
  const bookingPage = document.querySelector('.js-booking-page');
  if (!bookingPage) return;

  const urlParams = new URLSearchParams(window.location.search);
  const initialPickup = urlParams.get('pickup') || '';
  const initialDrop = urlParams.get('drop') || '';
  const initialVehicle = urlParams.get('vehicle') || 'sedan';

  const pickupInput = document.getElementById('bk-pickup');
  const dropInput = document.getElementById('bk-drop');
  const dateInput = document.getElementById('bk-date');
  const timeInput = document.getElementById('bk-time');
  const passengersSelect = document.getElementById('bk-passengers');
  const vehicleCards = document.querySelectorAll('.js-booking-vehicle');
  const confirmBtn = document.getElementById('bk-confirm-btn');

  // Summary elements
  const summaryPickup = document.getElementById('sum-pickup');
  const summaryDrop = document.getElementById('sum-drop');
  const summaryVehicle = document.getElementById('sum-vehicle');
  const summaryDist = document.getElementById('sum-dist');
  const summaryTime = document.getElementById('sum-time');
  const summaryFare = document.getElementById('sum-fare');
  const summaryBaseFare = document.getElementById('sum-base-fare');
  const summaryGst = document.getElementById('sum-gst');
  const summaryTotal = document.getElementById('sum-total');

  let selectedVehicle = initialVehicle;

  if (pickupInput && initialPickup) pickupInput.value = initialPickup;
  if (dropInput && initialDrop) dropInput.value = initialDrop;

  // Set today's date
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.min = today;
  }
  if (timeInput) {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 20);
    timeInput.value = now.toTimeString().substring(0, 5);
  }

  // Pre-select vehicle
  vehicleCards.forEach(card => {
    const vType = card.getAttribute('data-vehicle');
    if (vType === selectedVehicle) {
      card.classList.add('is-selected');
    } else {
      card.classList.remove('is-selected');
    }

    card.addEventListener('click', () => {
      vehicleCards.forEach(c => c.classList.remove('is-selected'));
      card.classList.add('is-selected');
      selectedVehicle = vType;
      recalculateBooking();
    });
  });

  function recalculateBooking() {
    const p = pickupInput?.value.trim() || 'Connaught Place, New Delhi';
    const d = dropInput?.value.trim() || 'Indira Gandhi International Airport';
    const dist = calculateEstimatedDistance(p, d);
    const est = calculateFare(selectedVehicle, dist);
    const gst = Math.round(est.fare * 0.05);
    const total = est.fare + gst;

    if (summaryPickup) summaryPickup.textContent = p;
    if (summaryDrop) summaryDrop.textContent = d;
    if (summaryVehicle) summaryVehicle.textContent = VEHICLE_PRICING[selectedVehicle]?.name || selectedVehicle;
    if (summaryDist) summaryDist.textContent = `${dist} km`;
    if (summaryTime) summaryTime.textContent = `${est.duration} mins`;
    if (summaryFare) summaryFare.textContent = `₹${est.fare}`;
    if (summaryBaseFare) summaryBaseFare.textContent = `₹${VEHICLE_PRICING[selectedVehicle]?.base}`;
    if (summaryGst) summaryGst.textContent = `₹${gst}`;
    if (summaryTotal) summaryTotal.textContent = `₹${total}`;

    // Update prices on all vehicle cards dynamically
    vehicleCards.forEach(card => {
      const v = card.getAttribute('data-vehicle');
      const vEst = calculateFare(v, dist);
      const priceSpan = card.querySelector('.js-card-price');
      if (priceSpan) priceSpan.textContent = `₹${vEst.fare}`;
    });

    return { pickup: p, drop: d, dist, fare: total, vehicle: selectedVehicle };
  }

  pickupInput?.addEventListener('input', recalculateBooking);
  dropInput?.addEventListener('input', recalculateBooking);
  dateInput?.addEventListener('change', recalculateBooking);
  timeInput?.addEventListener('change', recalculateBooking);

  recalculateBooking();

  // Confirm Booking Action
  confirmBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    const p = pickupInput?.value.trim();
    const d = dropInput?.value.trim();

    if (!p || !d) {
      showToast('Please provide both Pickup and Destination addresses.', 'error');
      return;
    }

    const bookingData = recalculateBooking();
    const bookingId = `VS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const fullBookingRecord = {
      bookingId,
      pickup: bookingData.pickup,
      drop: bookingData.drop,
      vehicle: VEHICLE_PRICING[bookingData.vehicle]?.name,
      vehicleCode: bookingData.vehicle,
      fare: bookingData.fare,
      distance: bookingData.dist,
      date: dateInput?.value,
      time: timeInput?.value,
      passengers: passengersSelect?.value || '1',
      status: 'Confirmed',
      driverName: 'Vikram Singh',
      driverPhone: '9461695205',
      vehicleNumber: 'DL 01 AA 4029',
      otp: Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString()
    };

    // Save in localStorage
    const savedBookings = JSON.parse(localStorage.getItem('vahan_setu_bookings') || '[]');
    savedBookings.unshift(fullBookingRecord);
    localStorage.setItem('vahan_setu_bookings', JSON.stringify(savedBookings));
    localStorage.setItem('vahan_setu_latest_booking', JSON.stringify(fullBookingRecord));

    // Show Success Modal
    showBookingSuccessModal(fullBookingRecord);
  });
}

function showBookingSuccessModal(booking) {
  const modal = document.getElementById('booking-success-modal');
  if (!modal) return;

  const idEl = modal.querySelector('.js-modal-booking-id');
  const detailsEl = modal.querySelector('.js-modal-details');
  const trackBtn = modal.querySelector('.js-modal-track-btn');

  if (idEl) idEl.textContent = booking.bookingId;
  if (detailsEl) {
    detailsEl.innerHTML = `
      <div style="background: var(--vs-surface-alt); padding: 16px; border-radius: 12px; margin: 16px 0; font-size: 0.9rem; line-height: 1.8;">
        <div><strong>Vehicle:</strong> ${booking.vehicle} (${booking.vehicleNumber})</div>
        <div><strong>Driver:</strong> ${booking.driverName} (★ 4.9) · <strong>OTP:</strong> <span style="background: var(--vs-primary-light); color: var(--vs-primary); padding: 2px 8px; border-radius: 6px; font-weight: 800;">${booking.otp}</span></div>
        <div><strong>Route:</strong> ${booking.pickup} ➔ ${booking.drop}</div>
        <div><strong>Total Fare:</strong> <span style="font-weight: 800; color: var(--vs-primary);">₹${booking.fare}</span> (${booking.distance} km)</div>
      </div>
    `;
  }

  if (trackBtn) {
    trackBtn.onclick = () => {
      window.location.href = `tracking.html?id=${booking.bookingId}`;
    };
  }

  modal.classList.add('is-open');
}

// ==========================================================================
// 6. Live Vehicle Tracking Simulation (tracking.html)
// ==========================================================================
function initTrackingDashboard() {
  const trackingContainer = document.querySelector('.js-tracking-page');
  if (!trackingContainer) return;

  const startBtn = document.getElementById('track-start-btn');
  const stopBtn = document.getElementById('track-stop-btn');
  const resetBtn = document.getElementById('track-reset-btn');
  const speedEl = document.getElementById('track-speed');
  const etaEl = document.getElementById('track-eta');
  const distRemainingEl = document.getElementById('track-dist-remaining');
  const statusBadge = document.getElementById('track-status');
  const vehicleMarker = document.getElementById('track-marker');
  const trackLine = document.getElementById('track-path');
  const logSteps = document.querySelectorAll('.js-timeline-step');

  let isTracking = true;
  let progress = 0; // 0 to 100%
  let trackingInterval = null;
  let remainingKm = 14.2;
  let etaMins = 24;

  function updateMarkerPosition() {
    if (!vehicleMarker) return;
    // Follow smooth path coordinates
    const startX = 60;
    const startY = 380;
    const endX = 480;
    const endY = 120;

    const currentX = startX + (endX - startX) * (progress / 100);
    const currentY = startY + (endY - startY) * (progress / 100) - Math.sin((progress / 100) * Math.PI) * 45;

    vehicleMarker.setAttribute('transform', `translate(${currentX}, ${currentY})`);

    // Update odometer & ETA
    const currentSpeed = isTracking ? Math.floor(38 + Math.sin(progress) * 12) : 0;
    if (speedEl) speedEl.textContent = `${currentSpeed} km/h`;

    const remDist = Math.max(0, (remainingKm * (1 - progress / 100))).toFixed(1);
    if (distRemainingEl) distRemainingEl.textContent = `${remDist} km`;

    const remEta = Math.max(1, Math.round(etaMins * (1 - progress / 100)));
    if (etaEl) etaEl.textContent = `${remEta} mins`;

    // Update timeline steps
    if (progress > 10 && logSteps[0]) logSteps[0].classList.add('is-complete');
    if (progress > 30 && logSteps[1]) logSteps[1].classList.add('is-complete');
    if (progress > 60 && logSteps[2]) logSteps[2].classList.add('is-complete');
    if (progress >= 98 && logSteps[3]) {
      logSteps[3].classList.add('is-complete');
      if (statusBadge) {
        statusBadge.innerHTML = `<span class="vs-status-pulse" style="background:#00D2A0;"></span> Trip Completed`;
      }
    }
  }

  function startTracking() {
    if (trackingInterval) clearInterval(trackingInterval);
    isTracking = true;
    if (statusBadge) {
      statusBadge.innerHTML = `<span class="vs-status-pulse"></span> Live En Route (GPS Active)`;
    }
    trackingInterval = setInterval(() => {
      if (progress < 100) {
        progress += 0.8;
        updateMarkerPosition();
      } else {
        clearInterval(trackingInterval);
        showToast('Your driver has safely arrived at the destination!', 'success');
      }
    }, 400);
  }

  function stopTracking() {
    isTracking = false;
    if (trackingInterval) clearInterval(trackingInterval);
    if (speedEl) speedEl.textContent = '0 km/h';
    if (statusBadge) {
      statusBadge.innerHTML = `<span class="vs-status-pulse" style="background:#E2E8F0;"></span> Tracking Paused`;
    }
    showToast('Vehicle tracking paused');
  }

  function resetTracking() {
    if (trackingInterval) clearInterval(trackingInterval);
    progress = 0;
    updateMarkerPosition();
    logSteps.forEach(step => step.classList.remove('is-complete'));
    startTracking();
    showToast('Route and GPS simulation reset');
  }

  startBtn?.addEventListener('click', startTracking);
  stopBtn?.addEventListener('click', stopTracking);
  resetBtn?.addEventListener('click', resetTracking);

  // Auto-start simulation
  startTracking();
}

// ==========================================================================
// 7. Driver Registration Form (driver.html)
// ==========================================================================
function initDriverRegistration() {
  const form = document.getElementById('driver-reg-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('[name="driver_name"]')?.value.trim();
    const phone = form.querySelector('[name="driver_phone"]')?.value.trim();
    const email = form.querySelector('[name="driver_email"]')?.value.trim();
    const dlNumber = form.querySelector('[name="driver_dl"]')?.value.trim();
    const vehicleNumber = form.querySelector('[name="vehicle_number"]')?.value.trim();
    const vehicleType = form.querySelector('[name="vehicle_type"]')?.value;
    const terms = form.querySelector('[name="driver_terms"]')?.checked;

    // Validate phone: 10 digit Indian number
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      showToast('Please enter a valid 10-digit Indian mobile number', 'error');
      return;
    }

    if (!terms) {
      showToast('You must agree to the Vahan Setu driver terms and conditions', 'error');
      return;
    }

    // Success response
    const driverId = `VSD-${Math.floor(10000 + Math.random() * 90000)}`;
    const driverData = {
      driverId,
      name,
      phone,
      email,
      dlNumber,
      vehicleNumber,
      vehicleType,
      registeredAt: new Date().toISOString()
    };

    localStorage.setItem('vahan_setu_driver_profile', JSON.stringify(driverData));

    // Show modal
    const modal = document.getElementById('driver-success-modal');
    if (modal) {
      const idSpan = modal.querySelector('.js-driver-id');
      if (idSpan) idSpan.textContent = driverId;
      modal.classList.add('is-open');
    } else {
      showToast(`Registration Successful! Your Partner ID is ${driverId}`, 'success');
      form.reset();
    }
  });
}

// ==========================================================================
// 8. Logistics & Goods Transport Form (logistics.html)
// ==========================================================================
function initLogisticsForm() {
  const form = document.getElementById('logistics-form');
  if (!form) return;

  const vehicleSelect = form.querySelector('[name="logistics_vehicle"]');
  const weightInput = form.querySelector('[name="goods_weight"]');
  const fareDisplay = document.getElementById('logistics-est-fare');

  function updateFreightQuote() {
    const vType = vehicleSelect?.value || 'pickup';
    const weight = parseFloat(weightInput?.value) || 500;
    const baseRate = VEHICLE_PRICING[vType]?.base || 300;
    const weightFactor = weight > 1000 ? (weight / 1000) * 180 : 50;
    const estimatedCost = Math.round(baseRate + weightFactor + 250);

    if (fareDisplay) {
      fareDisplay.textContent = `₹${estimatedCost}`;
    }
  }

  vehicleSelect?.addEventListener('change', updateFreightQuote);
  weightInput?.addEventListener('input', updateFreightQuote);
  updateFreightQuote();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const pickup = form.querySelector('[name="pickup_address"]')?.value.trim();
    const drop = form.querySelector('[name="delivery_address"]')?.value.trim();
    const phone = form.querySelector('[name="customer_phone"]')?.value.trim();

    if (!pickup || !drop || !phone) {
      showToast('Please fill in pickup, delivery address, and contact number', 'error');
      return;
    }

    const consignmentId = `VSL-${Math.floor(100000 + Math.random() * 900000)}`;
    showToast(`Transport Request Submitted! Consignment ID: ${consignmentId}. Our logistics manager will call you within 15 mins.`, 'success');
    form.reset();
    updateFreightQuote();
  });
}

// ==========================================================================
// 9. Location & India Route Explorer (location.html)
// ==========================================================================
function initLocationExplorer() {
  const locationPage = document.querySelector('.js-location-page');
  if (!locationPage) return;

  const citySearch = document.getElementById('city-search-input');
  const cityChips = document.querySelectorAll('.js-city-filter');
  const routeSelectFrom = document.getElementById('loc-from-city');
  const routeSelectTo = document.getElementById('loc-to-city');
  const routeSummaryBox = document.getElementById('loc-route-summary');
  const mapNodes = document.querySelectorAll('.map-node');

  function calculateCityPair() {
    const from = routeSelectFrom?.value || 'Delhi';
    const to = routeSelectTo?.value || 'Mumbai';
    const dist = calculateEstimatedDistance(from, to);
    const estSedan = calculateFare('sedan', dist);
    const estTruck = calculateFare('truck', dist);

    if (routeSummaryBox) {
      routeSummaryBox.innerHTML = `
        <div style="background: var(--vs-surface-alt); padding: 18px; border-radius: 12px; margin-top: 16px;">
          <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--vs-text); margin-bottom: 8px;">
            ${from} ➔ ${to} Corridor
          </h4>
          <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 12px; font-size: 0.9rem; color: var(--vs-text-muted);">
            <div><strong>Total Distance:</strong> ${dist} km</div>
            <div><strong>Driving Duration:</strong> approx ${Math.round(dist / 55)} hrs</div>
            <div><strong>Express Highway:</strong> NH / Expressway Active</div>
          </div>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <a href="booking.html?pickup=${encodeURIComponent(from)}&drop=${encodeURIComponent(to)}&vehicle=sedan" class="vs-btn vs-btn-primary" style="padding: 8px 14px; font-size: 0.85rem;">Book Cab (₹${estSedan.fare})</a>
            <a href="logistics.html" class="vs-btn vs-btn-secondary" style="padding: 8px 14px; font-size: 0.85rem;">Cargo Freight (₹${estTruck.fare})</a>
          </div>
        </div>
      `;
    }
  }

  routeSelectFrom?.addEventListener('change', calculateCityPair);
  routeSelectTo?.addEventListener('change', calculateCityPair);
  calculateCityPair();

  // Search filter
  citySearch?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    mapNodes.forEach(node => {
      const city = (node.getAttribute('data-city') || '').toLowerCase();
      if (city.includes(query)) {
        node.style.opacity = '1';
        node.style.transform = 'scale(1.15)';
      } else {
        node.style.opacity = query ? '0.2' : '1';
        node.style.transform = 'scale(1)';
      }
    });
  });

  cityChips.forEach(chip => {
    chip.addEventListener('click', () => {
      cityChips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      const selectedCity = chip.getAttribute('data-city');
      if (routeSelectFrom) routeSelectFrom.value = selectedCity;
      calculateCityPair();
    });
  });
}

// ==========================================================================
// 10. Login & Signup Controller (login.html)
// ==========================================================================
function initAuthPage() {
  const authCard = document.querySelector('.js-auth-card');
  if (!authCard) return;

  const loginTab = document.getElementById('tab-login');
  const signupTab = document.getElementById('tab-signup');
  const loginForm = document.getElementById('form-login');
  const signupForm = document.getElementById('form-signup');
  const sendOtpBtn = document.getElementById('js-send-otp-btn');
  const otpGroup = document.getElementById('js-otp-group');
  const otpTimer = document.getElementById('js-otp-timer');

  loginTab?.addEventListener('click', () => {
    loginTab.classList.add('is-active');
    signupTab?.classList.remove('is-active');
    loginForm?.classList.remove('vs-hidden');
    signupForm?.classList.add('vs-hidden');
  });

  signupTab?.addEventListener('click', () => {
    signupTab.classList.add('is-active');
    loginTab?.classList.remove('is-active');
    signupForm?.classList.remove('vs-hidden');
    loginForm?.classList.add('vs-hidden');
  });

  // Simulated OTP sender
  sendOtpBtn?.addEventListener('click', () => {
    const phoneInput = document.getElementById('login-mobile');
    const phone = phoneInput?.value.trim();
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      showToast('Please enter a valid 10-digit Indian phone number', 'error');
      return;
    }

    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = 'OTP Sent';
    if (otpGroup) otpGroup.style.display = 'block';

    const generatedOtp = '4029';
    showToast(`Demo OTP sent to ${phone}: ${generatedOtp}`, 'success');

    // Countdown
    let timeLeft = 30;
    const interval = setInterval(() => {
      timeLeft--;
      if (otpTimer) otpTimer.textContent = `Resend OTP in ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(interval);
        sendOtpBtn.disabled = false;
        sendOtpBtn.textContent = 'Resend OTP';
        if (otpTimer) otpTimer.textContent = '';
      }
    }, 1000);
  });

  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = document.getElementById('login-mobile')?.value.trim();
    const otp = document.getElementById('login-otp')?.value.trim();

    if (!otp) {
      showToast('Please enter the 4-digit OTP sent to your phone', 'error');
      return;
    }

    const userData = {
      phone,
      name: 'Vikas Yogi',
      role: 'Passenger',
      token: 'vs_demo_session_token_' + Date.now()
    };
    localStorage.setItem('vahan_setu_user', JSON.stringify(userData));
    showToast('Logged in successfully! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1200);
  });

  signupForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name')?.value.trim();
    const phone = document.getElementById('signup-phone')?.value.trim();
    const email = document.getElementById('signup-email')?.value.trim();

    if (!name || !phone || !email) {
      showToast('Please fill all fields', 'error');
      return;
    }

    const userData = {
      name,
      phone,
      email,
      role: 'Passenger',
      token: 'vs_demo_session_token_' + Date.now()
    };
    localStorage.setItem('vahan_setu_user', JSON.stringify(userData));
    showToast('Account created successfully! Welcome to Vahan Setu.', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1200);
  });
}

// ==========================================================================
// 11. Contact Form Controller (contact.html)
// ==========================================================================
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('[name="name"]')?.value.trim();
    const phone = form.querySelector('[name="phone"]')?.value.trim();
    const msg = form.querySelector('[name="message"]')?.value.trim();

    if (!name || !phone || !msg) {
      showToast('Please enter your Name, Phone and Message.', 'error');
      return;
    }

    showToast(`Thank you, ${name}! Your inquiry has been dispatched to Vikas Yogi. We will contact you at ${phone} promptly.`, 'success');
    form.reset();
  });
}

// ==========================================================================
// 12. Modal Helpers & Toast Notification System
// ==========================================================================
function initModals() {
  const closeBtns = document.querySelectorAll('.js-modal-close');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.vs-modal-backdrop');
      if (modal) modal.classList.remove('is-open');
    });
  });

  // Close when clicking backdrop
  const backdrops = document.querySelectorAll('.vs-modal-backdrop');
  backdrops.forEach(bd => {
    bd.addEventListener('click', (e) => {
      if (e.target === bd) bd.classList.remove('is-open');
    });
  });
}

function showToast(message, type = 'info') {
  let container = document.querySelector('.vs-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'vs-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `vs-toast ${type === 'success' ? 'success' : ''}`;
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      ${type === 'success' ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>' : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'}
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Global exposure for inline calls
window.showToast = showToast;

// ==========================================================================
// 13. Intersection Observer for Scroll Reveal
// ==========================================================================
function initScrollReveal() {
  const reveals = document.querySelectorAll('.vs-reveal');
  if (!('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach(el => observer.observe(el));
}

// ==========================================================================
// 14. User Session Status in Navbar
// ==========================================================================
function updateNavbarUser() {
  const user = JSON.parse(localStorage.getItem('vahan_setu_user') || 'null');
  const authNavContainer = document.querySelector('.js-nav-auth');
  if (user && authNavContainer) {
    authNavContainer.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:0.85rem; font-weight:700; color:var(--vs-primary);">Hi, ${user.name.split(' ')[0]}</span>
        <button id="js-nav-logout" class="vs-btn vs-btn-secondary" style="padding:6px 12px; font-size:0.75rem;">Logout</button>
      </div>
    `;
    document.getElementById('js-nav-logout')?.addEventListener('click', () => {
      localStorage.removeItem('vahan_setu_user');
      showToast('Logged out successfully');
      setTimeout(() => window.location.reload(), 600);
    });
  }
}

// ==========================================================================
// DOM Ready Orchestration
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  initHeroBookingCard();
  initBookingPage();
  initTrackingDashboard();
  initDriverRegistration();
  initLogisticsForm();
  initLocationExplorer();
  initAuthPage();
  initContactForm();
  initModals();
  initScrollReveal();
  updateNavbarUser();
});
