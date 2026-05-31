/**
 * Notification System (Free Tier)
 * Simulates emails or push alerts by logging them formally, could easily hook into Nodemailer or Twilio.
 */

const sendNotification = (type, payload) => {
  const timestamp = new Date().toISOString();
  console.log(`\n================= NOTIFICATION TRIGGERED =================`);
  console.log(`[${timestamp}] TYPE: ${type}`);
  
  switch (type) {
    case 'COMPLAINT_CREATED':
      console.log(`To User: ${payload.userEmail}`);
      console.log(`Message: Thank you for reporting! Your complaint "${payload.title}" has been registered (Priority: ${payload.priority}).`);
      break;
      
    case 'STATUS_UPDATED':
      console.log(`To User: ${payload.userEmail}`);
      console.log(`Message: Your complaint "${payload.title}" is now marked as: ${payload.status.toUpperCase()}.`);
      break;
      
    case 'SLA_ESCALATED':
      console.log(`To Admin: state_admin@gov.in (Escalation Protocol)`);
      console.log(`Message: SLA BREACH DETECTED - Complaint ID ${payload.complaintId} by user ${payload.userEmail} has remained unresolved for > 7 days.`);
      break;

    default:
      console.log(`Generic Info:`, payload);
  }
  console.log(`==========================================================\n`);
};

module.exports = {
  sendNotification
};
