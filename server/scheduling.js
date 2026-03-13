const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

function timeToMinutes(value) {
  if (!value || !TIME_PATTERN.test(String(value))) return null;
  const [h, m] = String(value).split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

function minutesToTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const m = (totalMinutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function getDayOfWeek(date) {
  const safeDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(safeDate.getTime())) return null;
  return safeDate.getDay();
}

function getTodayIso() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getNowMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function ceilToInterval(value, interval) {
  if (interval <= 0) return value;
  return Math.ceil(value / interval) * interval;
}

function getInterval(db) {
  const value = db.prepare("SELECT value FROM settings WHERE key = 'appointment_interval'").get()?.value;
  const parsed = Number(value || 30);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 30;
}

function getServiceDuration(db, serviceId) {
  if (!serviceId) return null;
  const service = db.prepare('SELECT duration FROM services WHERE id = ?').get(serviceId);
  const duration = Number(service?.duration);
  return Number.isFinite(duration) && duration > 0 ? duration : null;
}

function getBusinessRange(db, dayOfWeek) {
  const business = db.prepare('SELECT * FROM business_hours WHERE day_of_week = ?').get(dayOfWeek);
  if (!business || business.is_closed) {
    return { ok: false, message: 'Negócio fechado neste dia' };
  }
  const openMinutes = timeToMinutes(business.open_time);
  const closeMinutes = timeToMinutes(business.close_time);
  if (openMinutes === null || closeMinutes === null || closeMinutes <= openMinutes) {
    return { ok: false, message: 'Horário geral inválido' };
  }
  return { ok: true, openMinutes, closeMinutes };
}

function getBarberRange(db, barberId, dayOfWeek) {
  const barber = db.prepare('SELECT id, active FROM barbers WHERE id = ?').get(barberId);
  if (!barber || barber.active === 0) {
    return { ok: false, message: 'Profissional indisponível' };
  }
  const schedule = db.prepare('SELECT * FROM barber_schedules WHERE barber_id = ? AND day_of_week = ?').get(barberId, dayOfWeek);
  if (!schedule || schedule.active === 0) {
    return { ok: false, message: 'Profissional não atende neste dia' };
  }
  const openMinutes = timeToMinutes(schedule.start_time);
  const closeMinutes = timeToMinutes(schedule.end_time);
  if (openMinutes === null || closeMinutes === null || closeMinutes <= openMinutes) {
    return { ok: false, message: 'Horário do profissional inválido' };
  }
  return { ok: true, openMinutes, closeMinutes };
}

function getBookedRanges(db, barberId, date, excludeAppointmentId = null) {
  let query = `
    SELECT a.id, a.time, s.duration as service_duration
    FROM appointments a
    JOIN services s ON s.id = a.service_id
    WHERE a.barber_id = ? AND a.date = ? AND a.status NOT IN ('cancelled')
  `;
  const params = [barberId, date];
  if (excludeAppointmentId) {
    query += ' AND a.id != ?';
    params.push(excludeAppointmentId);
  }
  return db.prepare(query).all(...params).map((appt) => {
    const start = timeToMinutes(appt.time);
    const duration = Number(appt.service_duration) || 0;
    return { start, end: start !== null ? start + duration : null };
  }).filter((range) => range.start !== null && range.end !== null);
}

function hasOverlap(targetStart, targetEnd, bookedRanges) {
  return bookedRanges.some((range) => targetStart < range.end && targetEnd > range.start);
}

function validateAppointmentSlot(db, { barberId, serviceId, date, time, excludeAppointmentId = null }) {
  if (!DATE_PATTERN.test(String(date || ''))) {
    return { ok: false, message: 'Data inválida' };
  }
  if (!TIME_PATTERN.test(String(time || ''))) {
    return { ok: false, message: 'Horário inválido' };
  }
  const dayOfWeek = getDayOfWeek(date);
  if (dayOfWeek === null) {
    return { ok: false, message: 'Data inválida' };
  }
  const today = getTodayIso();
  if (date < today) {
    return { ok: false, message: 'Não é possível agendar no passado' };
  }
  const blockout = db.prepare('SELECT id FROM blockouts WHERE ? BETWEEN start_date AND end_date').get(date);
  if (blockout) {
    return { ok: false, message: 'Data bloqueada para agendamentos' };
  }
  const businessRange = getBusinessRange(db, dayOfWeek);
  if (!businessRange.ok) return businessRange;
  const barberRange = getBarberRange(db, barberId, dayOfWeek);
  if (!barberRange.ok) return barberRange;
  const interval = getInterval(db);
  const duration = getServiceDuration(db, serviceId) || interval;
  const requestedStart = timeToMinutes(time);
  const requestedEnd = requestedStart !== null ? requestedStart + duration : null;
  if (requestedStart === null || requestedEnd === null) {
    return { ok: false, message: 'Horário inválido' };
  }
  const globalOpen = businessRange.openMinutes;
  const globalClose = businessRange.closeMinutes;
  const barberOpen = barberRange.openMinutes;
  const barberClose = barberRange.closeMinutes;
  if (requestedStart < globalOpen || requestedEnd > globalClose) {
    return { ok: false, message: 'Horário fora do funcionamento geral' };
  }
  if (date === today) {
    const nowMinutes = getNowMinutes();
    if (requestedStart <= nowMinutes) {
      return { ok: false, message: 'Horário já passou para hoje' };
    }
  }
  if (requestedStart < barberOpen || requestedEnd > barberClose) {
    return { ok: false, message: 'Horário fora da agenda do profissional' };
  }
  const bookedRanges = getBookedRanges(db, barberId, date, excludeAppointmentId);
  if (hasOverlap(requestedStart, requestedEnd, bookedRanges)) {
    return { ok: false, message: 'Horário já reservado' };
  }
  return { ok: true, duration };
}

function getAvailableSlotsForBarber(db, { barberId, date, serviceId }) {
  if (!DATE_PATTERN.test(String(date || ''))) return [];
  const today = getTodayIso();
  if (date < today) return [];
  const dayOfWeek = getDayOfWeek(date);
  if (dayOfWeek === null) return [];
  const blockout = db.prepare('SELECT id FROM blockouts WHERE ? BETWEEN start_date AND end_date').get(date);
  if (blockout) return [];
  const businessRange = getBusinessRange(db, dayOfWeek);
  if (!businessRange.ok) return [];
  const barberRange = getBarberRange(db, barberId, dayOfWeek);
  if (!barberRange.ok) return [];
  const interval = getInterval(db);
  const duration = getServiceDuration(db, serviceId) || interval;
  const nowMinutes = date === today ? getNowMinutes() : null;
  const startRaw = Math.max(businessRange.openMinutes, barberRange.openMinutes);
  const start = nowMinutes !== null ? Math.max(startRaw, ceilToInterval(nowMinutes + 1, interval)) : startRaw;
  const end = Math.min(businessRange.closeMinutes, barberRange.closeMinutes);
  if (end <= start) return [];
  const bookedRanges = getBookedRanges(db, barberId, date);
  const slots = [];
  let current = start;
  while (current + duration <= end) {
    const currentEnd = current + duration;
    if (!hasOverlap(current, currentEnd, bookedRanges)) {
      slots.push(minutesToTime(current));
    }
    current += interval;
  }
  return slots;
}

module.exports = {
  validateAppointmentSlot,
  getAvailableSlotsForBarber,
};
