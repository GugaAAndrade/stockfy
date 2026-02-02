function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function abbreviate(value: string, max = 4) {
  const cleaned = slugify(value).replace(/-/g, "");
  return cleaned.slice(0, max).toUpperCase();
}

export function buildSkuBase({
  prefix,
  productName,
  attributes,
}: {
  prefix: string;
  productName: string;
  attributes: Array<{ name: string; value: string }>;
}) {
  const productPart = abbreviate(productName, 6) || "PROD";
  const attrParts = attributes
    .filter((attr) => attr.value)
    .map((attr) => abbreviate(attr.value, 4))
    .filter(Boolean);

  const parts = [prefix.toUpperCase(), productPart, ...attrParts].filter(Boolean);
  return parts.join("-");
}

export function limitSku(value: string, maxLength = 32) {
  if (value.length <= maxLength) {
    return value;
  }
  return value.slice(0, maxLength);
}
