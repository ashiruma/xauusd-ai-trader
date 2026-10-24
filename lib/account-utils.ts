/**
 * Account ID and MT5 display sanitization utilities.
 * Enforces zero leakage of internal database UUIDs into user-facing interfaces.
 */

export function isUuid(val?: string | null): boolean {
  if (!val) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());
}

export function isValidMt5AccountId(val?: string | null): boolean {
  if (!val) return false;
  const clean = val.trim();
  if (isUuid(clean)) return false;
  return /^\d{5,12}$/.test(clean);
}

export interface Mt5DisplayResult {
  display: string;
  accountNumber: string;
  isLinked: boolean;
}

export function resolveMt5AccountDisplay(params: {
  mt5Account?: string | null;
  accountId?: string | null;
  isAdmin?: boolean;
}): Mt5DisplayResult {
  const cleanMt5 = params.mt5Account?.trim() || '';
  if (cleanMt5 && !isUuid(cleanMt5) && cleanMt5 !== 'UNLINKED') {
    const numOnly = cleanMt5.replace(/^[#]/, '');
    return {
      display: `#${numOnly}`,
      accountNumber: numOnly,
      isLinked: true,
    };
  }

  const cleanAccount = params.accountId?.trim() || '';
  if (cleanAccount && !isUuid(cleanAccount) && cleanAccount !== 'UNLINKED') {
    const numOnly = cleanAccount.replace(/^[#]/, '');
    return {
      display: `#${numOnly}`,
      accountNumber: numOnly,
      isLinked: true,
    };
  }

  if (params.isAdmin) {
    return {
      display: '#1200533810 (ADMIN)',
      accountNumber: '1200533810',
      isLinked: true,
    };
  }

  return {
    display: 'UNLINKED',
    accountNumber: '',
    isLinked: false,
  };
}
