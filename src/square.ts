import { AllGeoJSON, area, bbox, bboxPolygon, convex, square, toMercator, toWgs84 } from "@turf/turf";
import * as d3 from "d3";
import { Country } from "./countries";

// Calculate how square a shape is:
// Area of convex hull / Area of bounding square
export function squareFactor(shape: AllGeoJSON): number {
  const { boundingBox, convexHull } = getGeoJSONFeatures(shape);
  if (convexHull === null) {
    return 0;
  }
  if (area(convexHull) === 0) {
    return 0;
  }
  return area(convexHull) / area(boundingBox);
}

export function getGeoJSONFeatures(shape: AllGeoJSON) {
  return {
    boundingBox: boundingSquare(shape),
    convexHull: convex(shape),
  };
}

export function getCountryFeatures(country: Country) {
  return getGeoJSONFeatures(country.data);
}

export function realBoundingBox(shape: AllGeoJSON) {
  const [[minX, minY], [maxX, maxY]] = d3.geoBounds(shape as any);
  return bboxPolygon(square([minX, minY, maxX, maxY]));
}

export function boundingSquare(shape: AllGeoJSON) {
  const [minX, minY, maxX, maxY] = bbox(toMercator(shape));
  const width = maxX - minX;
  const height = maxY - minY;
  const [centerX, centerY] = [minX + width / 2, minY + height / 2];

  const greater = Math.max(width, height);

  return toWgs84(
    bboxPolygon(square([centerX - greater / 2, centerY - greater / 2, centerX + greater / 2, centerY + greater / 2]))
  );
}
