const { exec } = require('child_process');

function probeEmail(email) {
  return new Promise((resolve, reject) => {
    if (!email || !email.includes('@')) {
      return reject(new Error('INVALID_EMAIL_ADDRESS'));
    }
    exec(holehe "" --only-used, (error, stdout, stderr) => {
      if (error && !stdout) return reject(new Error(stderr || error.message));
      const activePlatforms = stdout.split('\n')
        .map(l => l.trim())
        .filter(l => l.startsWith('[+]'))
        .map(l => l.replace('[+]', '').trim());
      resolve({ email, activePlatforms, totalFound: activePlatforms.length });
    });
  });
}

module.exports = { probeEmail };