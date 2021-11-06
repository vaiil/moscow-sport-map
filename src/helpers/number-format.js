export default function format(value, precision = 5) {
  const str = parseFloat(parseFloat(value)
    .toPrecision(precision))
    .toString();
  const [real, frac] = str.split('.');
  const realStr = real.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
  if (frac) {
    return `${realStr}.${frac}`;
  }
  return realStr;
}
