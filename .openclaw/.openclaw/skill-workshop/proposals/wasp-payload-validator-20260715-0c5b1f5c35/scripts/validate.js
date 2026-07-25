function validatePayload(jsonString) {
  let data;
  try {
    data = JSON.parse(jsonString);
  } catch (e) {
    return { valid: false, errors: ['Invalid JSON: ' + e.message] };
  }

  const errors = [];

  // Required fields
  const required = [
    { name: 'symbol', type: 'string' },
    { name: 'action', type: 'string', allowed: ['BUY', 'SELL'] },
    { name: 'lotSize', type: 'number', min: 0.01 },
    { name: 'price', type: 'number', min: 0 }
  ];

  for (const field of required) {
    const value = data[field.name];
    if (value === undefined) {
      errors.push(`Missing required field: ${field.name}`);
      continue;
    }

    // Type check
    if (typeof value !== field.type) {
      errors.push(`Field ${field.name} must be of type ${field.type}`);
      continue;
    }

    // Allowed values
    if (field.allowed && !field.allowed.includes(value)) {
      errors.push(`Field ${field.name} must be one of ${field.allowed.join(', ')}`);
    }

    // Min value for numbers
    if (field.type === 'number' && field.min !== undefined && value < field.min) {
      errors.push(`Field ${field.name} must be at least ${field.min}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// If called directly from command line
if (require.main === module) {
  const input = require('fs').readFileSync(0, 'utf8').trim();
  const result = validatePayload(input);
  console.log(JSON.stringify(result));}

module.exports = { validatePayload };
