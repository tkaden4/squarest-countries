import { featureCollection } from "@turf/helpers";
import { tuple } from "fp-ts/lib/function";
import { writeFileSync } from "fs";
import _ from "lodash";
import { Country, loadCountries, loadCountriesFrom, loadCountryMap } from "./countries";
import { getCountryFeatures, squareFactor } from "./square";

const countriesFile = "data/countries.geojson";

export async function getSquareFactors() {
  const countriesList = await loadCountriesFrom(countriesFile);
  return countriesList.map((country) => tuple(country, getCountrySquareFactor(country)));
}

export async function oneOff(countryName: string) {
  const countries = await loadCountryMap(countriesFile);
  const country = countries[countryName];
  if (country === undefined) {
    console.error(`Country ${countryName} does not exist in the dataset.`);
    return;
  }

  console.log(country.name);
  console.log("Square Factor: ", squareFactor(country.data));
}

export function getCountrySquareFactor(country: Country) {
  return squareFactor(country.data);
}

export async function runNSquareFactors(n: number) {
  const nEntries = n;
  const squareFactors = _.orderBy(await getSquareFactors(), ([, score]) => score, "desc");
  console.log(`${squareFactors.length} countries evaluated.`);
  console.log(`${nEntries} Squarest Countries`);

  const topN = _.take(squareFactors, nEntries);

  _.take(squareFactors, nEntries).forEach(([country, score], i) => {
    console.log(`${i}. ${_.padEnd(country.name, 40, " ")} ${score}`);
  });
  return topN;
}

export async function countryFeatures(...countryNames: string[]) {
  const countries = await loadCountries(countriesFile, ...countryNames);
  const features = countries.map((country) => tuple(country, getCountryFeatures(country)));
  writeFileSync(
    `data/${
      countries.length +
      countries
        .map((x) => x.name.substr(0, 3))
        .join("")
        .substr(0, 100)
    }_features.geojson`,
    JSON.stringify(
      featureCollection(
        features.map(([country, features]) => [country.data as any, features.boundingBox, features.convexHull!]).flat()
      ),
      null,
      2
    )
  );
}

(async () => {
  // const topTen = await runNSquareFactors(255);
  // await countryFeatures(...topTen.map(([{ name }]) => name));
  await countryFeatures("Equatorial Guinea");
})();
