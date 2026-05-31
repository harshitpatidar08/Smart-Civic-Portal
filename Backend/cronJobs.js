const cron = require('node-cron');
const supabase = require('./config/supabaseClient');
const { sendNotification } = require('./services/notificationService');

// Schedule tasks to be run on the server.
// Runs every hour: '0 * * * *'
// Testing value runs every minute: '* * * * *'
cron.schedule('0 * * * *', async () => {
  console.log('Running SLA Escalation Check...');

  // Get date 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  try {
    // 1. Fetch unresolved complaints older than 7 days
    const { data: overdueComplaints, error: fetchError } = await supabase
      .from('complaints')
      .select('id, user_id, title, users(email)')
      .lt('created_at', sevenDaysAgo.toISOString())
      .in('status', ['pending', 'in_progress']);

    if (fetchError) {
      console.error('Error fetching overdue complaints:', fetchError);
      return;
    }

    if (!overdueComplaints || overdueComplaints.length === 0) {
      console.log('No overdue complaints found.');
      return;
    }

    // 2. Escalate each complaint
    for (const complaint of overdueComplaints) {
      // Update status
      await supabase
        .from('complaints')
        .update({ status: 'escalated' })
        .eq('id', complaint.id);

      // Log into escalation table
      await supabase
        .from('escalation_log')
        .insert({
          complaint_id: complaint.id,
          reason: 'SLA Breach (> 7 days unresolved)',
        });

      // Notify
      sendNotification('SLA_ESCALATED', {
        complaintId: complaint.id,
        title: complaint.title,
        userEmail: complaint.users?.email || 'Unknown User'
      });
      
      console.log(`Successfully escalated complaint ${complaint.id}`);
    }
  } catch (error) {
    console.error('Cron Job Execution Error:', error);
  }
});

module.exports = cron;
