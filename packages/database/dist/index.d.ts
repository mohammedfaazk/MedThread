import { PrismaClient } from '@prisma/client';
export declare const prisma: PrismaClient<{
    datasources: {
        db: {
            url: string | undefined;
        };
    };
    log: ("warn" | "error")[];
    __internal: {
        engine: {
            connection_limit: number;
            pool_timeout: number;
        };
    };
}, never, import("@prisma/client/runtime/library").DefaultArgs>;
export * from '@prisma/client';
