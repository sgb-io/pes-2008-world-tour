import WorldTourRaw from "./world_tour.txt";

const blocks = WorldTourRaw.toString().split(
  "----------------------------------"
);

const nl = "(\r?\n|\r)";
const roundMatcher = new RegExp(
  `^(.+)${nl}(=+)${nl}$`,
  "gim"
);
const missionNameLine = "\\s{3}\\+\\+\\+(\\s)*(.+)";
const missionNameMatcher = new RegExp(
  `^(.+)${nl}${missionNameLine}${nl}$`,
  "gim"
);
const conditionLine = "\\s{3}\\d\\.(\\s*)(.+)";
const contentBlockMatcher = new RegExp(
  `^(.+)${nl}(${conditionLine}${nl})+${nl}`,
  "gim"
);

const oppositionNameMatcher = new RegExp(
  "^My score:\\s(.+)\\s-\\s",
  "gim"
);

let missions = [];
let round = undefined;

// eslint-ignore no-extend-native
String.prototype.removeNewlines = function() {
  return this.replace(/\r/g, "").replace(/\n/g, "");
};

for (let i = 0; i < blocks.length; i += 1) {
  // Skip edge cases of content we don't
  // care about: First item, midway message
  if (
    blocks[i].trim() === "" ||
    blocks[i].includes("Here ends the 1st half")
  ) {
    continue;
  }

  const roundName = blocks[i].match(roundMatcher);
  const missionName = blocks[i].match(missionNameMatcher);
  const contentBlocks = blocks[i].match(
    contentBlockMatcher
  );
  const oppositionName = blocks[i].match(
    oppositionNameMatcher
  );

  if (!roundName && !round) {
    throw new Error("Round not found - unable to continue");
  }

  // New round
  if (roundName) {
    round = roundName[0]
      .removeNewlines()
      .trim()
      .replace(/=/g, "");
  }

  const cleanMissionName = missionName[0]
    .removeNewlines()
    .trim()
    .replace(/^Mission\s\d(\d*)\s\s\s/g, "")
    .replace(/\+\+\+/g, "")
    .trim();

  const cleanOppositionName = oppositionName[0]
    .removeNewlines()
    .trim()
    .replace("My score: ", "")
    .replace(/\s-(.+)$/g, "")
    .trim();

  const getCleanConditions = contentBlock => {
    return contentBlock
      .replace(/^Start status/gi, "")
      .replace(/^Clear conditions/gi, "")
      .trim()
      .split(/\d\.(.+)/)
      .reduce((finalRequirements, piece) => {
        if (piece.trim().removeNewlines() === "") {
          return finalRequirements;
        }
        return finalRequirements.concat(piece.trim());
      }, []);
  };

  const startingRequirements = getCleanConditions(
    contentBlocks[0]
  );

  const clearConditions = getCleanConditions(
    contentBlocks[1]
  );

  missions.push({
    roundName: round,
    missionName: cleanMissionName,
    startingRequirements,
    clearConditions,
    oppositionName: cleanOppositionName
  });
}

const toTitleCase = s =>
  s.replace(/\b[a-zA-Z]/g, match => match.toUpperCase());

// Print csv
const csvHeader =
  "Round,Mission Name,Opposition,Starting Requirements,Clear Conditions";
const csvBody = missions.reduce((csvString, mission) => {
  const {
    roundName,
    missionName,
    startingRequirements,
    clearConditions,
    oppositionName
  } = mission;
  csvString +=
    "\n" +
    roundName +
    "," +
    toTitleCase(missionName) +
    "," +
    oppositionName +
    "," +
    `"${startingRequirements.join(", ")}"` +
    "," +
    `"${clearConditions.join(", ")}"`;
  return csvString;
}, "");

const csv = csvHeader + csvBody;
document.write("<pre>" + csv + "</pre>");
