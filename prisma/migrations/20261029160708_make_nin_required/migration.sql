/*
  Warnings:

  - You are about to alter the column `embedding` on the `DocumentChunk` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Unsupported("vector")`.
  - Made the column `nin` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "DocumentChunk" ALTER COLUMN "embedding" SET DATA TYPE vector;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "nin" SET NOT NULL;
