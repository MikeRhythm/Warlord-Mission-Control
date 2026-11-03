// ============================================================================
// WARLORD COMPILER GATEKEEPER // ZERO-FLAT ENFORCER
// ============================================================================

function validateArtifactGraphics(htmlContent) {
    const errors = [];

    // Rule 1: Check for naked solid background fills on body
    const solidBodyRegex = /body\s*\{[^}]*background(-color)?:\s*#[0-9a-fA-F]{3,6};(?!\s*background-image)/i;
    if (solidBodyRegex.test(htmlContent)) {
        errors.push("VIOLATION: Naked solid background detected without weave/texture layer.");
    }

    // Rule 2: Check for presence of surface blueprint or woven texture
    const hasTexture = htmlContent.includes('surface_blueprint.css') || 
                       htmlContent.includes('data:image/svg+xml') || 
                       htmlContent.includes('background-image:');
    if (!hasTexture) {
        errors.push("VIOLATION: Missing tactile texture/weave layer.");
    }

    // Rule 3: Check for flat borders
    if (htmlContent.includes('border: 1px solid #333') || htmlContent.includes('border: 1px solid black')) {
        errors.push("VIOLATION: Generic border detected. Must use Warlord bevel rail tokens.");
    }

    return {
        compliant: errors.length === 0,
        errors: errors
    };
}

module.exports = { validateArtifactGraphics };