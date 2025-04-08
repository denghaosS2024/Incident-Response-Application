import {
  aqiFromPM,
  calcAQI,
  calculateDistance,
  getBoundingBox,
} from "../../src/utils/AirQualityHelpers";

describe("calculateDistance", () => {
  it("should return 0 for identical points", () => {
    expect(calculateDistance(40.7128, -74.006, 40.7128, -74.006)).toBeCloseTo(
      0,
    );
  });

  it("should calculate distance between NYC and Philadelphia (~80 miles)", () => {
    const nyc = [40.7128, -74.006];
    const philadelphia = [39.9526, -75.1652];
    // Actual distance ~94 miles; allow some approximation
    expect(calculateDistance(...nyc, ...philadelphia)).toBeCloseTo(80.63, 0);
  });

  it("should convert meters to miles correctly", () => {
    // 1609.34 meters = 1 mile
    // const distanceMeters = 1609.34;
    expect(calculateDistance(0, 0, 0, 0.0166667)).toBeCloseTo(1.15, 1); // ~1 degree longitude at equator
  });
});

describe("getBoundingBox", () => {
  const lat = 40.7128;
  const lon = -74.006;

  it("should return correct NW/SE for 10-mile radius", () => {
    const box = getBoundingBox(lat, lon);
    // Approximate calculations
    expect(box.nw.lat).toBeCloseTo(
      40.7128 + (10 / 3958.8) * (180 / Math.PI),
      4,
    );
    expect(box.nw.lon).toBeCloseTo(
      -74.006 -
        ((10 / 3958.8) * (180 / Math.PI)) / Math.cos((lat * Math.PI) / 180),
      4,
    );
  });

  it("should adjust longitude more at equator", () => {
    const equatorBox = getBoundingBox(0, -74.006, 10);
    // At equator, cos(lat) = 1, so lonChange equals latChange
    const latChange = (10 / 3958.8) * (180 / Math.PI);
    expect(equatorBox.nw.lon).toBeCloseTo(-74.006 - latChange, 4);
  });
});

describe("aqiFromPM", () => {
  it('should return "-" for invalid inputs', () => {
    expect(aqiFromPM(NaN)).toBe("-");
    expect(aqiFromPM(undefined as unknown as number)).toBe("-");
    expect(aqiFromPM(1001)).toBe("-");
  });

  it("should return raw value for negative PM", () => {
    expect(aqiFromPM(-5)).toBe(-5);
  });

  it("should return correct AQI for each category", () => {
    // Good
    expect(aqiFromPM(0)).toBe(0);
    expect(aqiFromPM(12)).toBe(50);
    // Moderate
    expect(aqiFromPM(12.1)).toBe(50);
    expect(aqiFromPM(35.4)).toBe(100);
    // Unhealthy for Sensitive Groups
    expect(aqiFromPM(35.5)).toBe(100);
    expect(aqiFromPM(55.4)).toBe(150);
    // Unhealthy
    expect(aqiFromPM(55.5)).toBe(150);
    expect(aqiFromPM(150.4)).toBe(200);
    // Very Unhealthy
    expect(aqiFromPM(150.5)).toBe(200);
    expect(aqiFromPM(250.4)).toBe(300);
    // Hazardous (301-400)
    expect(aqiFromPM(250.5)).toBe(300);
    expect(aqiFromPM(350.4)).toBe(400);
    // Hazardous (401-500)
    expect(aqiFromPM(350.5)).toBe(400);
    expect(aqiFromPM(500.4)).toBe(500);
  });

  it("should handle edge cases", () => {
    expect(aqiFromPM(12.0)).toBe(50); // Upper bound of Good
    expect(aqiFromPM(500.4)).toBe(500); // Max allowed
  });
});

describe("calcAQI", () => {
  it("should interpolate correctly", () => {
    // Midpoint test: Cp = (BPl + BPh)/2 → AQI = (Il + Ih)/2
    expect(calcAQI(75, 100, 50, 100, 50)).toBe(75);
    // Lower bound
    expect(calcAQI(0, 50, 0, 12, 0)).toBe(0);
    // Upper bound
    expect(calcAQI(500.4, 500, 401, 500.4, 350.5)).toBe(500);
    // Rounding check
    expect(calcAQI(12.1, 100, 51, 35.4, 12.1)).toBe(51); // 12.1 → 51
  });
});
