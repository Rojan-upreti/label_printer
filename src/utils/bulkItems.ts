export interface ProductRecord {
  'Item Code': string;
  'TJX Style #': string;
  UPC: string;
  'Case Pack': number;
  'Item Name': string;
}

export interface ParsedBulkLine {
  itemCode: string;
  quantity: number;
}

export interface BulkParseResult {
  parsed: ParsedBulkLine[];
  errors: string[];
}

/** Parse one line: "50001 72" or full shipment rows ending in qty, case pack, cases. */
export function parseBulkLine(line: string): ParsedBulkLine | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const simple = trimmed.match(/^(\d{5})\s+(\d+)\s*$/);
  if (simple) {
    return { itemCode: simple[1], quantity: parseInt(simple[2], 10) };
  }

  const comma = trimmed.match(/^(\d{5})\s*,\s*(\d+)\s*$/);
  if (comma) {
    return { itemCode: comma[1], quantity: parseInt(comma[2], 10) };
  }

  const parts = trimmed.split(/\s+/);
  const itemCode = parts[0];
  if (!/^\d{5}$/.test(itemCode)) return null;

  const nums = parts.filter((p) => /^\d+$/.test(p)).map((n) => parseInt(n, 10));
  if (nums.length >= 3) {
    const quantity = nums[nums.length - 3];
    return { itemCode, quantity };
  }
  if (nums.length >= 1) {
    return { itemCode, quantity: nums[nums.length - 1] };
  }

  return null;
}

export function parseBulkText(text: string): BulkParseResult {
  const lines = text.split(/\r?\n/);
  const parsed: ParsedBulkLine[] = [];
  const errors: string[] = [];

  lines.forEach((line, index) => {
    if (!line.trim()) return;

    const result = parseBulkLine(line);
    if (!result) {
      errors.push(`Line ${index + 1}: could not parse "${line.trim()}"`);
      return;
    }
    if (result.quantity <= 0) {
      errors.push(`Line ${index + 1}: quantity must be greater than 0`);
      return;
    }
    parsed.push(result);
  });

  return { parsed, errors };
}

export function validateBulkItem(
  itemCode: string,
  quantity: number,
  products: ProductRecord[]
): string | null {
  const product = products.find((p) => p['Item Code'] === itemCode);
  if (!product) {
    return `Item ${itemCode} not found in product list`;
  }
  if (!product['TJX Style #']) {
    return `Item ${itemCode} is missing TJX Style #`;
  }
  if (quantity < product['Case Pack']) {
    return `Item ${itemCode}: quantity must be at least case pack (${product['Case Pack']})`;
  }
  return null;
}
