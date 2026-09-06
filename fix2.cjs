const fs = require('fs');
let c = fs.readFileSync('src/routes/SpacedReview.tsx', 'utf-8');
c = c.replace('import { calculateNextReview, type Rating, type Card }', 'import { calculateNextReview, type Rating }');
fs.writeFileSync('src/routes/SpacedReview.tsx', c);
