import { readRoute, writeRoute } from "@/features/kyc/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = readRoute;
export const POST = writeRoute;
