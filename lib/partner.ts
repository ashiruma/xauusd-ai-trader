export interface PartnerConfig {
  primaryCode: string;
  primaryLink: string;
  primaryLimit: number;
  secondaryCode: string;
  secondaryLink: string;
  primaryCount: number;
  secondaryCount: number;
  isDripActive: boolean;
  activeCode: string;
  activeLink: string;
}

export const DEFAULT_PARTNER_CONFIG: PartnerConfig = {
  primaryCode: 'tohstb0d83',
  primaryLink: 'https://one.justmarkets.link/a/tohstb0d83',
  primaryLimit: 10,
  secondaryCode: 'p4cui0wkfz',
  secondaryLink: 'https://one.justmarkets.link/a/p4cui0wkfz',
  primaryCount: 0,
  secondaryCount: 0,
  isDripActive: false,
  activeCode: 'tohstb0d83',
  activeLink: 'https://one.justmarkets.link/a/tohstb0d83'
};

export function isValidPartnerCode(code?: string | null): boolean {
  if (!code) return false;
  const clean = code.trim().toLowerCase();
  return clean === 'tohstb0d83' || clean === 'p4cui0wkfz' || clean === 'admin';
}

export function getActivePartnerLink(primaryCount: number = 0, limit: number = 10): { code: string; link: string } {
  if (primaryCount >= limit) {
    return {
      code: DEFAULT_PARTNER_CONFIG.secondaryCode,
      link: DEFAULT_PARTNER_CONFIG.secondaryLink
    };
  }
  return {
    code: DEFAULT_PARTNER_CONFIG.primaryCode,
    link: DEFAULT_PARTNER_CONFIG.primaryLink
  };
}
