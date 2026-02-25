"use strict";
/**
 * Availability Service
 * Handles clinic hours, availability status, and next available slots
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.availabilityService = exports.AvailabilityService = void 0;
class AvailabilityService {
    /**
     * Get current clinic status
     */
    getClinicStatus(hours, exceptions, timezone = 'UTC') {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
        const currentDate = now.toISOString().slice(0, 10); // "YYYY-MM-DD"
        // Check for exceptions first
        const exception = exceptions.find(e => e.exception_date === currentDate);
        if (exception) {
            if (exception.is_closed) {
                return { isOpen: false, opensAt: null, closesAt: null };
            }
            return {
                isOpen: exception.open_time !== null && exception.close_time !== null &&
                    currentTime >= exception.open_time && currentTime < exception.close_time,
                opensAt: exception.open_time,
                closesAt: exception.close_time
            };
        }
        // Check regular hours
        const todayHours = hours.find(h => h.day_of_week === dayOfWeek);
        if (!todayHours || todayHours.is_closed) {
            // Find next opening day
            const nextOpen = this.findNextOpenDay(hours, dayOfWeek);
            return { isOpen: false, opensAt: nextOpen, closesAt: null };
        }
        const isOpen = currentTime >= todayHours.open_time && currentTime < todayHours.close_time;
        return {
            isOpen,
            opensAt: todayHours.open_time,
            closesAt: todayHours.close_time
        };
    }
    /**
     * Find next opening day
     */
    findNextOpenDay(hours, currentDay) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        for (let i = 1; i <= 7; i++) {
            const nextDay = (currentDay + i) % 7;
            const dayHours = hours.find(h => h.day_of_week === nextDay && !h.is_closed);
            if (dayHours) {
                const dayName = dayNames[nextDay];
                return `${dayName} at ${dayHours.open_time}`;
            }
        }
        return null;
    }
    /**
     * Calculate next available appointment slot
     */
    calculateNextAvailableSlot(hours, exceptions, bookedSlots = []) {
        const now = new Date();
        const maxDaysAhead = 30;
        for (let daysAhead = 0; daysAhead < maxDaysAhead; daysAhead++) {
            const checkDate = new Date(now);
            checkDate.setDate(now.getDate() + daysAhead);
            const dayOfWeek = checkDate.getDay();
            const dateStr = checkDate.toISOString().slice(0, 10);
            // Check for exceptions
            const exception = exceptions.find(e => e.exception_date === dateStr);
            if (exception && exception.is_closed) {
                continue;
            }
            // Check regular hours
            const dayHours = hours.find(h => h.day_of_week === dayOfWeek);
            if (!dayHours || dayHours.is_closed) {
                continue;
            }
            // Use exception hours if available, otherwise regular hours
            const openTime = exception?.open_time || dayHours.open_time;
            const closeTime = exception?.close_time || dayHours.close_time;
            if (!openTime || !closeTime)
                continue;
            // Create slot at opening time
            const [openHour, openMinute] = openTime.split(':').map(Number);
            const slotTime = new Date(checkDate);
            slotTime.setHours(openHour, openMinute, 0, 0);
            // If it's today, make sure slot is in the future
            if (daysAhead === 0 && slotTime <= now) {
                continue;
            }
            // Check if slot is not booked
            const isBooked = bookedSlots.some(booked => Math.abs(booked.getTime() - slotTime.getTime()) < 60000 // Within 1 minute
            );
            if (!isBooked) {
                return slotTime;
            }
        }
        return null;
    }
    /**
     * Format time for display
     */
    formatTime(time) {
        const [hour, minute] = time.split(':').map(Number);
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    }
    /**
     * Check if doctor is available for emergency
     */
    isEmergencyAvailable(availability) {
        return availability?.emergency_available === true;
    }
    /**
     * Check if doctor accepts specific insurance
     */
    acceptsInsurance(availability, insuranceProvider) {
        if (availability?.accepts_all_insurance) {
            return true;
        }
        if (!availability?.insurance_accepted || !Array.isArray(availability.insurance_accepted)) {
            return false;
        }
        return availability.insurance_accepted.some((provider) => provider.toLowerCase() === insuranceProvider.toLowerCase());
    }
}
exports.AvailabilityService = AvailabilityService;
exports.availabilityService = new AvailabilityService();
