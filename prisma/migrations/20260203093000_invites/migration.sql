-- AlterTable
ALTER TABLE "TenantUser" ADD COLUMN     "invitedAt" TIMESTAMP(3),
ADD COLUMN     "inviteExpiresAt" TIMESTAMP(3);
