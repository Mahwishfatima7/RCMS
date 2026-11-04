/**
 * SLA Scheduler - Background job to update breached tickets automatically
 * Runs every minute to check and update all ticket SLA statuses
 */

const slaService = require("./slaService");

let schedulerInterval = null;

/**
 * Start the SLA update scheduler
 * @param {number} intervalMs - Update interval in milliseconds (default: 60000 = 1 minute)
 */
const startScheduler = (intervalMs = 60000) => {
  if (schedulerInterval) {
    return;
  }

  // Run immediately on startup
  updateBreachedTickets();

  // Then run at regular intervals
  schedulerInterval = setInterval(updateBreachedTickets, intervalMs);
};

/**
 * Stop the SLA update scheduler
 */
const stopScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
      }
};

/**
 * Execute SLA status update for all tickets
 * Updates Within SLA, At Risk, and Breached statuses
 */
const updateAllSLAStatuses = async () => {
  try {
    await slaService.updateAllSLAStatuses();
  } catch (error) {
    console.error("Error updating SLA statuses:", error.message);
  }
};

/**
 * Execute SLA status update for all tickets
 */
const updateBreachedTickets = updateAllSLAStatuses; // Alias for backward compatibility

module.exports = {
  startScheduler,
  stopScheduler,
  updateBreachedTickets,
  updateAllSLAStatuses,
};



