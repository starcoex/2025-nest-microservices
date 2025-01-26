/*
  Warnings:

  - You are about to drop the column `passwordHash` on the `PasswordHistory` table. All the data in the column will be lost.
  - Added the required column `password` to the `PasswordHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PasswordHistory" DROP COLUMN "passwordHash",
ADD COLUMN     "password" TEXT NOT NULL;
