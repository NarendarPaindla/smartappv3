const fs = require('fs');
const path = require('path');

const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

fs.writeFileSync(path.join(__dirname, 'test_receipt.png'), buffer);
console.log('Dummy PNG created');
