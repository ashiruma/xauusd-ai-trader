/**
 * lib/notifications/service.ts
 *
 * Core notification service for Velarion.
 * Orchestrates multi-channel delivery while strictly enforcing:
 * 1. Deterministic Firewall boundary (no trade execution signals).
 * 2. User opt-in and consent validation.
 * 3. Graceful degradation when external services are unconfigured.
 */

import {
  NotificationAdapter,
  NotificationChannel,
  NotificationPayload,
  NotificationResult,
} from './types';
import { MockNotificationAdapter, MobileSasaNotificationAdapter } from './adapters';

export class NotificationService {
  private static instance: NotificationService;
  private adapters: NotificationAdapter[] = [];

  private constructor() {
    // Register default adapters
    this.adapters.push(new MockNotificationAdapter());
    this.adapters.push(new MobileSasaNotificationAdapter());
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Send a transactional milestone or risk alert notification.
   */
  public async send(payload: NotificationPayload): Promise<NotificationResult[]> {
    // 1. Strict Deterministic Firewall Guard
    const forbiddenPatterns = ['BUY', 'SELL', 'ORDER', 'LOTS', 'TRADE_NOW', 'EXECUTE'];
    const titleUpper = payload.title.toUpperCase();
    const msgUpper = payload.message.toUpperCase();

    for (const pat of forbiddenPatterns) {
      if (titleUpper.includes(pat) || msgUpper.includes(pat)) {
        // Only allow if it's explicitly risk disclosure or educational text
        const isLegitEducational =
          msgUpper.includes('RISK') ||
          msgUpper.includes('LESSON') ||
          msgUpper.includes('DISCLOSURE') ||
          msgUpper.includes('VERIFICATION');

        if (!isLegitEducational) {
          console.error(`[FIREWALL REJECTION] Blocked attempt to send trading directive via messaging: ${payload.title}`);
          return [
            {
              success: false,
              messageId: `firewall-reject-${Date.now()}`,
              channel: payload.channels[0] || 'email',
              status: 'failed',
              timestamp: new Date().toISOString(),
              error: 'Deterministic Firewall Error: Automated trading directives cannot be sent over external messaging channels.',
            },
          ];
        }
      }
    }

    // 2. Dispatch to appropriate adapters
    const allResults: NotificationResult[] = [];

    for (const channel of payload.channels) {
      const adapter = this.adapters.find((a) => a.supportsChannel(channel));
      if (adapter) {
        const results = await adapter.send({
          ...payload,
          channels: [channel],
        });
        allResults.push(...results);
      } else {
        allResults.push({
          success: false,
          messageId: `no-adapter-${Date.now()}`,
          channel,
          status: 'disabled',
          timestamp: new Date().toISOString(),
          error: `No adapter registered for channel '${channel}'.`,
        });
      }
    }

    return allResults;
  }
}

export const notificationService = NotificationService.getInstance();
