-- CreateTable
CREATE TABLE "VerifyToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ttl" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerifyToken_pkey" PRIMARY KEY ("id")
);
