"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
// Use connection pooling URL for Supabase
const getDatabaseUrl = () => {
    const directUrl = process.env.DIRECT_URL;
    const url = process.env.DATABASE_URL;
    console.log('[Database] DATABASE_URL:', url ? 'SET' : 'NOT SET');
    console.log('[Database] DIRECT_URL:', directUrl ? 'SET' : 'NOT SET');
    if (!url && !directUrl) {
        console.log('[Database] No DATABASE_URL or DIRECT_URL found');
        return undefined;
    }
    // Prefer DATABASE_URL (pooler) for better connection stability with Supabase
    const connectionUrl = url || directUrl;
    console.log('[Database] Using pooled database connection');
    console.log('[Database] Connection URL:', connectionUrl?.substring(0, 50) + '...');
    return connectionUrl;
};
exports.prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: getDatabaseUrl(),
        },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});
// Test database connection on startup
exports.prisma.$connect()
    .then(() => {
    console.log('[Database] ✓ Connected successfully');
})
    .catch((error) => {
    console.error('[Database] ✗ Connection failed:', error.message);
    console.error('[Database] Please check your DATABASE_URL or DIRECT_URL in .env file');
    console.error('[Database] The database may be paused or credentials may be incorrect');
});
// Handle graceful shutdown
process.on('beforeExit', async () => {
    await exports.prisma.$disconnect();
});
__exportStar(require("@prisma/client"), exports);
