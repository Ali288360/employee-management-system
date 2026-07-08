const { Inngest } = require('inngest');

// Initialize Inngest client
const inngest = new Inngest({ id: 'ems-application' });

module.exports = { inngest };
