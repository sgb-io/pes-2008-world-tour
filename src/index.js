import WorldTourRaw from "./world_tour.txt";

const blocks = WorldTourRaw.toString().split(
  "----------------------------------"
);

const nl = "(\r?\n|\r)";
const roundMatcher = new RegExp(
  `^(.+)${nl}(=+)${nl}$`,
  "gim"
);
const missionNameLine = "\\s{3}\\+\\+\\+\\s(.+)";
const missionNameMatcher = new RegExp(
  `^(.+)${nl}${missionNameLine}${nl}$`,
  "gim"
);
const conditionLine = "\\s{3}\\d.\\s(.+)";
const contentBlockMatcher = new RegExp(
  `^(.+)${nl}(${conditionLine})+${nl}${nl}$`,
  "gim"
);
const oppositionNameMatcher = new RegExp(
  "^My score:\\s(.+)\\s-\\s",
  "gim"
);

let missions = [];
let round = undefined;

const removeNewlines = string =>
  string.replace("\r", "").replace("\n", "");

for (let i = 0; i < blocks.length; i += 1) {
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
    round = removeNewlines(roundName[0])
      .trim()
      .replace(/=/g, "");
  }

  const cleanMissionName =
    missionName &&
    removeNewlines(missionName[0])
      .trim()
      .replace(/^Mission\s\d(\d*)\s\s\s/g, "")
      .replace(/\+\+\+/g, "")
      .trim();

  const cleanOppositionName =
    oppositionName &&
    removeNewlines(oppositionName[0])
      .trim()
      .replace("My score: ", "")
      .replace(/\s-(.+)$/g, "")
      .trim();
  // console.log(cleanOppositionName);

  missions.push({
    roundName: round,
    missionName: cleanMissionName,
    contentBlocks,
    oppositionName: cleanOppositionName
  });
}

console.log(missions);
document.write("<pre>" + WorldTourRaw + "</pre>");
