import 'server-only';

/** No genuine identity-bound completion store is configured.
 * Never substitute session.schoolCompleted, owner role, browser progress or raw backend records.
 * Replacing this containment requires a separately reviewed identity/transactional-store patch.
 */
export async function readVerifiedCoreGraduation(): Promise<{ available: false; complete: false }> {
  return { available: false, complete: false };
}
