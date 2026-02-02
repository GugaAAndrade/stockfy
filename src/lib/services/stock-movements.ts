import * as movementDb from "@/lib/db/stock-movements";
import type { MovementCreateInput } from "@/lib/validators/stock-movement";
import type { ServiceContext } from "@/lib/services/products";
import { prisma } from "@/lib/db/prisma";

export async function listMovements(ctx: ServiceContext) {
  void ctx;
  return movementDb.listMovements();
}

export async function createMovement(ctx: ServiceContext, input: MovementCreateInput) {
  void ctx;
  const variant = await prisma.productVariant.findUnique({ where: { id: input.variantId } });
  if (!variant) {
    return null;
  }

  const nextStock =
    input.type === "IN" ? variant.stock + input.quantity : variant.stock - input.quantity;

  if (nextStock < 0) {
    throw new Error("STOCK_NEGATIVE");
  }

  // TODO: Wrap in a transaction once movement/stock business rules are finalized.
  await prisma.productVariant.update({ where: { id: variant.id }, data: { stock: nextStock } });

  return movementDb.createMovement({
    variant: { connect: { id: variant.id } },
    type: input.type,
    quantity: input.quantity,
    note: input.note,
  });
}
