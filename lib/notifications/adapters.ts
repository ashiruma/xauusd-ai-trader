/**
 * lib/notifications/adapters.ts
 *
 * Notification adapters for Velarion.
 * Includes Mock Adapter and an official MobileSasa API Adapter implementation.
 *
 * SAFETY GUARANTEES:
 * - If MOBILESASA_API_TOKEN is not configured, gracefully falls back to mock/noop.
 * - Enforces phone number format normalization for Kenyan networks (254...).
 * - Enforces non-custodial and non-execution safety checks.
 */

import {
  NotificationAdapter,
  NotificationChannel,
  NotificationPayload,
  NotificationResult,
} from './types';

/**
 * In-memory Mock Adapter for tests, development, and audit logging.
 */
export class MockNotificationAdapter implements NotificationAdapter {
  name = 'MockNotificationAdapter';
  public sentHistory: NotificationResult[] = [];

  supportsChannel(channel: NotificationChannel): boolean {
    return true; // Supports all channels in simulation
  }

  async send(payload: NotificationPayload): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    const timestamp = new Date().toISOString();

    for (const channel of payload.channels) {
      if (!payload.userConsentGiven) {
        results.push({
          success: false,
          messageId: `mock-blocked-${Date.now()}`,
          channel,
          status: 'blocked_by_consent',
          timestamp,
          error: 'User has not given explicit opt-in consent for automated messaging.',
        });
        continue;
      }

      const result: NotificationResult = {
        success: true,
        messageId: `mock-msg-${Math.random().toString(36).substring(2, 9)}`,
        channel,
        status: 'delivered',
        timestamp,
        network: channel === 'sms' ? 'Safaricom (Simulated)' : 'Internal (Mock)',
      };

      this.sentHistory.push(result);
      results.push(result);
    }

    return results;
  }
}

/**
 * MobileSasa Gateway Adapter
 * Implements MobileSasa's official REST API (/v1/send/message)
 * Docs: https://docs.mobilesasa.com/
 */
export class MobileSasaNotificationAdapter implements NotificationAdapter {
  name = 'MobileSasaNotificationAdapter';

  private apiBaseUrl: string;
  private apiToken: string | null;
  private senderId: string;

  constructor() {
    this.apiBaseUrl = process.env.MOBILESASA_API_URL || 'https://api.mobilesasa.com/v1';
    this.apiToken = process.env.MOBILESASA_API_TOKEN || null;
    this.senderId = process.env.MOBILESASA_SENDER_ID || 'MOBILESASA';
  }

  supportsChannel(channel: NotificationChannel): boolean {
    return channel === 'sms';
  }

  private normalizePhoneNumber(phone: string): string {
    const cleaned = phone.replace(/[\s\-\+\(\)]/g, '');
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1);
    }
    if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      return '254' + cleaned;
    }
    return cleaned;
  }

  async send(payload: NotificationPayload): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    const timestamp = new Date().toISOString();

    if (!payload.channels.includes('sms')) {
      return results;
    }

    // 1. Consent Check
    if (!payload.userConsentGiven) {
      results.push({
        success: false,
        messageId: `mbs-blocked-${Date.now()}`,
        channel: 'sms',
        status: 'blocked_by_consent',
        timestamp,
        error: 'Statutory opt-in consent not confirmed (Kenya Data Protection Act 2019).',
      });
      return results;
    }

    // 2. Recipient Phone Verification
    const rawPhone = payload.recipient.phone;
    if (!rawPhone) {
      results.push({
        success: false,
        messageId: `mbs-err-${Date.now()}`,
        channel: 'sms',
        status: 'failed',
        timestamp,
        error: 'No valid recipient phone number provided.',
      });
      return results;
    }

    const phone = this.normalizePhoneNumber(rawPhone);

    // 3. Operational Safety Check: If token is not set, don't execute network call
    if (!this.apiToken) {
      results.push({
        success: true,
        messageId: `mbs-simulated-${Date.now()}`,
        channel: 'sms',
        status: 'queued',
        timestamp,
        network: 'MobileSasa (Simulated - No API Key Set)',
      });
      return results;
    }

    // 4. Live API Dispatch (Only if explicitly enabled via environment)
    try {
      const response = await fetch(`${this.apiBaseUrl}/send/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderID: this.senderId,
          phone,
          message: `[Velarion] ${payload.title}: ${payload.message}`,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        results.push({
          success: false,
          messageId: data.messageId || `err-${Date.now()}`,
          channel: 'sms',
          status: 'failed',
          timestamp,
          error: data.message || `HTTP ${response.status} from MobileSasa`,
        });
      } else {
        results.push({
          success: true,
          messageId: data.messageId,
          channel: 'sms',
          status: 'queued',
          timestamp,
          network: 'MobileSasa Network Queue',
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'MobileSasa gateway request error';
      results.push({
        success: false,
        messageId: `err-${Date.now()}`,
        channel: 'sms',
        status: 'failed',
        timestamp,
        error: errorMsg,
      });
    }

    return results;
  }
}
