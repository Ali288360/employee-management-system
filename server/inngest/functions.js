const { inngest } = require('./client');
const { sendMailHelper } = require('./nodemailer');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const LeaveApplication = require('../models/LeaveApplication');

/**
 * Inngest Function: Automatic Checkout Logic
 * Runs daily at 10:00 PM (22:00) to auto-checkout employees who forgot.
 */
const autoCheckout = inngest.createFunction(
  { id: 'auto-checkout', name: 'Auto Checkout Forgotten Sessions' },
  { cron: '0 22 * * *' },
  async ({ step }) => {
    const todayStr = new Date().toLocaleDateString('en-CA');

    const result = await step.run('checkout-sessions', async () => {
      // Find open check-in sessions for today
      const openSessions = await Attendance.find({
        date: todayStr,
        checkOut: { $exists: false },
      }).populate('employee');

      let updatedCount = 0;
      for (const session of openSessions) {
        // Set checkout to 6:00 PM (18:00) on today's date
        const defaultCheckout = new Date();
        defaultCheckout.setHours(18, 0, 0, 0);

        session.checkOut = defaultCheckout;
        
        // Calculate status: if checkout - checkin is less than 4 hours, mark as Half-Day
        const diffHours = (defaultCheckout - session.checkIn) / (1000 * 60 * 60);
        if (diffHours < 4) {
          session.status = 'Half-Day';
        }

        await session.save();
        updatedCount++;
      }
      return { checkedOut: updatedCount };
    });

    return { message: `Successfully checked out ${result.checkedOut} sessions.` };
  }
);

/**
 * Inngest Function: Attendance Reminders
 * Runs daily at 9:00 AM to send alerts to employees who haven't checked in yet.
 */
const attendanceReminder = inngest.createFunction(
  { id: 'attendance-reminder', name: 'Daily Attendance Check-In Reminder' },
  { cron: '0 9 * * *' },
  async ({ step }) => {
    const todayStr = new Date().toLocaleDateString('en-CA');

    const result = await step.run('send-reminders', async () => {
      // Get all active employees
      const employees = await Employee.find({ status: 'active' }).populate('user', 'email');
      
      // Get checked-in employees for today
      const checkIns = await Attendance.find({ date: todayStr });
      const checkedInEmpIds = new Set(checkIns.map((c) => c.employee.toString()));

      let reminderCount = 0;
      for (const employee of employees) {
        if (!checkedInEmpIds.has(employee._id.toString())) {
          // Send notification email
          const email = employee.user?.email;
          if (email) {
            const subject = "Attendance Reminder — Please Mark Your Attendance";
            const textBody = `Hi ${employee.firstName}, 👋\n\nWe noticed you haven't marked your attendance yet today.\n\nThe deadline was 11:30 AM and your attendance is still missing.\n\nPlease check in as soon as possible or contact your admin if you're facing any issues.\n\nDepartment: ${employee.department || 'Staff'}\n\nBest Regards,\nQuickEMS`;
            const htmlBody = `
              <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; line-height: 1.6;">
                <p style="font-size: 16px; font-weight: bold; margin-bottom: 20px;">Hi ${employee.firstName}, 👋</p>
                <p>We noticed you haven't marked your attendance yet today.</p>
                <p>The deadline was <strong>11:30 AM</strong> and your attendance is still missing.</p>
                <p>Please check in as soon as possible or contact your admin if you're facing any issues.</p>
                <br />
                <p style="margin: 0; color: #64748b;">Department: ${employee.department || 'Staff'}</p>
                <br />
                <p style="margin: 0; font-weight: bold;">Best Regards,</p>
                <p style="margin: 0; font-weight: bold; color: #4f46e5;">QuickEMS</p>
              </div>
            `;

            await sendMailHelper(email, subject, textBody, htmlBody);
            reminderCount++;
          }
        }
      }
      return { remindersSent: reminderCount };
    });

    return { message: `Sent ${result.remindersSent} attendance reminders.` };
  }
);

/**
 * Inngest Function: Leave Status Alert
 * Triggers on leave.status.updated event to alert the employee about approval or rejection.
 */
const leaveStatusAlert = inngest.createFunction(
  { id: 'leave-status-alert', name: 'Leave Status Change Notification' },
  { event: 'ems/leave.status.updated' },
  async ({ event, step }) => {
    const { employeeEmail, employeeName, status, startDate, endDate, type, rejectionReason } = event.data;

    await step.run('send-status-email', async () => {
      const subject = `Leave Request - ${status}`;
      
      const formattedStartDate = new Date(startDate).toLocaleDateString();
      const formattedEndDate = new Date(endDate).toLocaleDateString();
      
      let text = `Hello ${employeeName},\n\nYour request for ${type} leave from ${formattedStartDate} to ${formattedEndDate} has been ${status}.`;
      let html = `<p>Hello <strong>${employeeName}</strong>,</p><p>Your request for <strong>${type}</strong> leave from <strong>${formattedStartDate}</strong> to <strong>${formattedEndDate}</strong> has been <strong>${status}</strong>.</p>`;

      if (status === 'Rejected' && rejectionReason) {
        text += `\n\nReason for rejection: ${rejectionReason}`;
        html += `<p><strong>Reason for rejection:</strong> ${rejectionReason}</p>`;
      }

      await sendMailHelper(employeeEmail, subject, text, html);
    });

    return { message: `Leave status email sent to ${employeeEmail}` };
  }
);

module.exports = {
  autoCheckout,
  attendanceReminder,
  leaveStatusAlert,
  functions: [autoCheckout, attendanceReminder, leaveStatusAlert],
};
