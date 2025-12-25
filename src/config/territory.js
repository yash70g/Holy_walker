export const COLLEGE_TERRITORY = {
  type: "Feature",
  properties: {
    name: "College Campus",
    region: "India"
  },
  geometry: {
    type: "Polygon",
    coordinates: [[
      [78.01866723778505, 27.18583446630805],
      [78.01866723778505, 27.184595681635855],
      [78.02262444070442, 27.184595681635855],
      [78.02262444070442, 27.18583446630805],
      [78.01866723778505, 27.18583446630805]
    ]]
  }
};
export const TERRITORY_CENTER = {
  latitude: 27.1852150,
  longitude: 78.0206458
};
export const TERRITORY_BOUNDS = {
  minLat: 27.184595681635855,
  maxLat: 27.18583446630805,
  minLng: 78.01866723778505,
  maxLng: 78.02262444070442
};
export const TERRITORY_SIZE = {
  widthMeters: 440,   // East-West
  heightMeters: 137,  // North-South
  areaSquareKm: 0.06
};
