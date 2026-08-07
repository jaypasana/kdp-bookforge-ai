-- AlterTable
ALTER TABLE "BookProject" ADD COLUMN     "backMatter" JSONB,
ADD COLUMN     "frontMatter" JSONB;

-- AlterTable
ALTER TABLE "KdpPackage" ADD COLUMN     "positioning" JSONB;
