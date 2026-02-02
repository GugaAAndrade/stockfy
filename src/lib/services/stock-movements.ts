import * as movementDb from "@/lib/db/stock-movements";
import type { MovementCreateInput } from "@/lib/validators/stock-movement";
import type { ServiceContext } from "@/lib/services/products";
import { withTenant } from "@/lib/db/tenant";

export async function listMovements(ctx: ServiceContext) {
  if (!ctx.tenantId) {
    return [];
  }
  return withTenant(ctx.tenantId, (tx) => movementDb.listMovements(tx, ctx.tenantId!));
}

export async function createMovement(ctx: ServiceContext, input: MovementCreateInput) {
  if (!ctx.tenantId) {
    return null;
  }

  return withTenant(ctx.tenantId, async (tx) => {
    const variant = await tx.productVariant.findFirst({
      where: { id: input.variantId, tenantId: ctx.tenantId! },
    });
    if (!variant) {
      return null;
    }

    const nextStock =
      input.type === "IN" ? variant.stock + input.quantity : variant.stock - input.quantity;

    if (nextStock < 0) {
      throw new Error("STOCK_NEGATIVE");
    }

    await tx.productVariant.update({ where: { id: variant.id }, data: { stock: nextStock } });

    return movementDb.createMovement(tx, {
      tenant: { connect: { id: ctx.tenantId! } },
      variant: { connect: { id: variant.id } },
      type: input.type,
      quantity: input.quantity,
      note: input.note,
    });
  });
}
