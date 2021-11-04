export default function uniqueItems(items) {
  return Array.from((new Set(items)).values());
}
