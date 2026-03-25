import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const servicesDir = './src/services';

console.log('🔧 Fixing all Prisma imports to use shared instance...');

const serviceFiles = readdirSync(servicesDir).filter(f => f.endsWith('.ts'));

for (const file of serviceFiles) {
  const filePath = join(servicesDir, file);
  let content = readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Pattern 1: import { PrismaClient } from '@prisma/client'; const prisma = new PrismaClient();
  if (content.includes("import { PrismaClient } from '@prisma/client';") && content.includes("const prisma = new PrismaClient();")) {
    content = content.replace(
      /import { PrismaClient } from '@prisma\/client';\s*\n\s*const prisma = new PrismaClient\(\);/g,
      "import { prisma } from '@medthread/database';"
    );
    changed = true;
  }
  
  // Pattern 2: Just the import line
  if (content.includes("import { PrismaClient } from '@prisma/client';") && !content.includes("import { prisma } from '@medthread/database';")) {
    content = content.replace(
      "import { PrismaClient } from '@prisma/client';",
      "import { prisma } from '@medthread/database';"
    );
    changed = true;
  }
  
  // Pattern 3: Just the const line
  if (content.includes("const prisma = new PrismaClient();")) {
    content = content.replace(
      /\s*const prisma = new PrismaClient\(\);\s*/g,
      ""
    );
    changed = true;
  }
  
  if (changed) {
    writeFileSync(filePath, content);
    console.log(`✅ Fixed Prisma import in ${file}`);
  }
}

console.log('🎉 All Prisma imports fixed!');