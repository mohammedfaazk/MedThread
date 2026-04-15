-- CreateTable
CREATE TABLE "DiseaseTrendsCache" (
    "id" TEXT NOT NULL,
    "disease" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "searchQuery" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "sources" JSONB,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiseaseTrendsCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiseaseTrendsCache_disease_location_year_idx" ON "DiseaseTrendsCache"("disease", "location", "year");

-- CreateIndex
CREATE INDEX "DiseaseTrendsCache_expiresAt_idx" ON "DiseaseTrendsCache"("expiresAt");
