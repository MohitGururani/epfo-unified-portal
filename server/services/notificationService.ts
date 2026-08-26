import { db } from '../db.js';
import { AppNotification } from '../types.js';

export const notificationService = {
  getNotifications(userId?: string) {
    let list = db.notifications;
    if (userId) {
      list = list.filter((n) => n.userId === userId || n.userId === 'usr_emp_01');
    }
    return {
      notifications: list,
      unreadCount: list.filter((n) => !n.read).length,
    };
  },

  markAsRead(id?: string) {
    if (id) {
      const notif = db.notifications.find((n) => n.id === id);
      if (notif) notif.read = true;
    } else {
      db.notifications.forEach((n) => (n.read = true));
    }
    return { success: true };
  },

  dispatchSimulatedSMS(phone: string, text: string) {
    console.log(`[SMS-Gateway] Simulated SMS sent to ${phone}: ${text}`);
    return { sent: true, provider: 'CDAC-EPFO-SMS', timestamp: new Date().toISOString() };
  },

  dispatchSimulatedEmail(email: string, subject: string, body: string) {
    console.log(`[Email-Gateway] Simulated Email sent to ${email} [${subject}]`);
    return { sent: true, provider: 'NIC-Gov-Mail', timestamp: new Date().toISOString() };
  }
};
