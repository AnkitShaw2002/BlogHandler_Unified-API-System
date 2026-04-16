
const crypto = require('crypto');

const getDynamicSecret = () => {
    // Generates a key based on the current 5-minute window
    const timeStep = Math.floor(Date.now() / (1000 * 60 * 5)); 
    return crypto.createHmac('sha256', process.env.SYSTEM_SALT)
                 .update(timeStep.toString())
                 .digest('hex');
};

module.exports = { getDynamicSecret };