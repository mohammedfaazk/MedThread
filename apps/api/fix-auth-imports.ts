import * as fs from 'fs';
import * as path from 'path';

const routesDir = path.join(__dirname, 'src', 'routes');

const filesToFix = [
  'backup.routes.ts',
  'content-moderation.routes.ts',
  'liability-protection.routes.ts',
  'performance-monitor.routes.ts',
  'search.routes.ts'
];

filesToFix.forEach(file => {
  const filePath = path.join(routesDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace authMiddleware with authenticate
    content = content.replace(/authMiddleware/g, 'authenticate');
    
    // Replace Request with AuthRequest in route handlers
    content = content.replace(/async \(req: Request, res: Response\)/g, 'async (req: AuthRequest, res: Response)');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${file}`);
  }
});

console.log('All files fixed!');
