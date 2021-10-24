export default function isMarkerInsidePolygon(point, polyPoints) {
  const x = point.lat; const
    y = point.lng;

  let inside = false;
  // eslint-disable-next-line no-plusplus
  for (let i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
    const xi = polyPoints[i].lat; const
      yi = polyPoints[i].lng;
    const xj = polyPoints[j].lat; const
      yj = polyPoints[j].lng;

    const intersect = ((yi > y) !== (yj > y))
      && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}
