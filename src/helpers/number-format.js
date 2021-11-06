export default function format(value, precision = 5) {
  return parseFloat(parseFloat(value).toPrecision(precision));
}
