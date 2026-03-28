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
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.log('[Database] No DATABASE_URL found');
        return undefined;
    }
    // Temporarily disable connection pooling due to connectivity issues
    console.log('[Database] Using direct database connection (pooling disabled)');
    return url;
};
exports.prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: getDatabaseUrl(),
        },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    // Configure connection pool to prevent exhaustion
    // @ts-ignore - Prisma connection pool configuration
    __internal: {
        engine: {
            connection_limit: 10,
            pool_timeout: 10,
        },
    },
});
// Handle graceful shutdown
process.on('beforeExit', async () => {
    await exports.prisma.$disconnect();
});
__exportStar(require("@prisma/client"), exports);
