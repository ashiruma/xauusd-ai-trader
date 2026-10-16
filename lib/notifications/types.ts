/**
 * lib/notifications/types.ts
 *
 * Types and interfaces for Velarion's transactional notification subsystem.
 *
 * ARCHITECTURAL BOUNDARY:
 * 1. Strictly transactional milestones and risk telemetry.
 * 2. High-frequency trade execution signals (BUY/SELL) are strictly forbidden
 *    from this subsystem to prevent execution slippage and regulatory non-compliance.
 * 3. All notifications require affirmative user consent and explicit opt-in.
 */

export type NotificationChannel = 'email' | 'sms' | 'whatsapp' | 'in_app';

export type NotificationDeliveryStatus =
  | 'delivered'
  | 'queued'
  | 'awaiting_report'
  | 'failed'
  | 'blocked_by_consent'
  | 'disabled';

export type NotificationEventType =
  | 'ACCOUNT_REGISTERED'
  | 'EMAIL_VERIFIED'
  | 'PARTNER_ATTRIBUTED'
  | 'DEPOSIT_CONFIRMED'
  | 'LESSON_COMPLETED'
  | 'CURRICULUM_COMPLETED'
  | 'ACCOUNT_LINKED'
  | 'RISK_CONFIRMATION_REQUIRED'
  | 'TRADING_ACTIVATED'
  | 'RISK_ALERT_DRAWDOWN'
  | 'DAILY_RISK_SUMMARY';

export interface NotificationPayload {
  recipient: {
    email?: string;
    phone?: string;
    accountId?: string;
  };
  eventType: NotificationEventType;
  title: string;
  message: string;
  channels: NotificationChannel[];
  userConsentGiven: boolean;
  metadata?: Record<string, unknown>;
}

export interface NotificationResult {
  success: boolean;
  messageId: string;
  channel: NotificationChannel;
  status: NotificationDeliveryStatus;
  timestamp: string;
  network?: string;
  error?: string;
}

export interface NotificationAdapter {
  name: string;
  supportsChannel(channel: NotificationChannel): boolean;
  send(payload: NotificationPayload): Promise<NotificationResult[]>;
}
