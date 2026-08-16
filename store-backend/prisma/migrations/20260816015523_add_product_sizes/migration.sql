-- AlterTable
ALTER TABLE "OrderProduct" ADD COLUMN     "size" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "availableSizes" TEXT[] DEFAULT ARRAY[]::TEXT[];
