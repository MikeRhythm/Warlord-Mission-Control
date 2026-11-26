function isBountyExpiredOrDry(b) {
    // LOCKED CAMPAIGN GUARD: Explicit check for manually locked status before pool/runway evaluation
    if (b && b.poolStatus) {
        const statusUpper = String(b.poolStatus).toUpperCase();
        if (statusUpper.includes('LOCKED') || statusUpper.includes('PAUSED') || statusUpper.includes('MANUAL_HOLD')) {
            return true;
        }
    }
    
    if (!b) return true;
    const status = String(b.poolStatus || '').toUpperCase();
    if (status.includes('DRY') || status.includes('EXPIRED') || status.includes('PURGE')) return true;
    const pctMatch = status.match(/(\d+(?:\.\d+)?)%/);
    if (pctMatch && parseFloat(pctMatch[1]) <= 0) return true;
    if (b.runwayDays !== undefined && Number(b.runwayDays) <= 0) return true;
    return false;
}