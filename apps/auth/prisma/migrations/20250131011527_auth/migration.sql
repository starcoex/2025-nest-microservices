/*
  Warnings:

  - Made the column `activation_token` on table `Activation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Activation" ALTER COLUMN "activation_token" SET NOT NULL;
