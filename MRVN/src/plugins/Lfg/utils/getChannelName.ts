let counter = 1;

export function getRandomChannelName(): string {
  const pick = Math.floor(Math.random() * pool.length);
  counter++;
  if (counter > 100) counter = 2;
  return `${pool[pick]} | ${counter - 1}`;
}

// Arrays populated from https://github.com/StryderDev/Apex-Stats-Bot/tree/main/data

const legends = [
  "Bloodhound",
  "Gibraltar",
  "Lifeline",
  "Pathfinder",
  "Wraith",
  "Bangalore",
  "Caustic",
  "Mirage",
  "Octane",
  "Wattson",
  "Crypto",
  "Revenant",
  "Loba",
  "Rampart",
  "Horizon",
  "Fuse",
  "Valkyrie",
  "Seer",
  "Ash",
  "Mad Maggie",
  "Newcastle",
];

const guns = [
  "Alternator",
  "Devotion",
  "EVA-8",
  "Flatline",
  "G7 Scout",
  "Hemlok",
  "Kraber",
  "Longbow",
  "Mastiff",
  "Mozambique",
  "P2020",
  "Peacekeeper",
  "Prowler",
  "R-99",
  "R-301",
  "RE-45",
  "Spitfire",
  "Triple Take",
  "Wingman",
  "HAVOC",
  "L-STAR",
  "Charge Rifle",
  "Sentinel",
  "Volt",
  "30-30 Repeater",
  "Bocek Compound Bow",
  "Rampage",
  "C.A.R. SMG",
];

const dropsKC = [
  "Gauntlet (Octane Town Takeover)",
  "Airbase",
  "Runoff",
  "The Pit",
  "Spotted Lake",
  "Containment",
  "Crash Site",
  "Artillery",
  "Broken Relay",
  "The Rig",
  "Capacitor",
  "Labs (Wraith Town Takeover)",
  "The Cage",
  "Bunker",
  "Salvage",
  "Market",
  "Caustic Treatment (Caustic Town Takeover)",
  "Repulsor",
  "Hydro Dam",
  "Swamps",
  "Map Room (Crypto Town Takeover)",
];

const dropsOL = [
  "Docks",
  "Carrier",
  "Oasis",
  "Fight Night (Pathfinder Town Takeover)",
  "Estates",
  "Elysium",
  "Hydroponics",
  "Turbine",
  "Power Grid",
  "Energy Depot",
  "Rift",
  "Gardens",
  "Grow Tower",
  "Hammond Labs",
  "Terminal",
  "Phase Driver",
  "Bonsai Plaza",
  "Solar Array",
  "Icarus",
  "Orbital Cannon",
];

const dropsSP = [
  "North Pad",
  "Checkpoint",
  "Downed Beast",
  "The Mill",
  "Cenote Cave",
  "Barometer",
  "Ship Fall",
  "Gale Station",
  "Antenna",
  "Fish Farms",
  "Launch Pad",
  "Storm Catcher",
  "Cascade Falls",
  "Command Center",
  "The Wall",
  "Highpoint",
  "Lightning Rod",
  "Thunder Watch",
];

const dropsWE = [
  "Trials (Bloodhound Town Takeover)",
  "Skyhook",
  "Countdown",
  "Lava Fissure",
  "Landslide",
  "Staging",
  "Harvester",
  "Thermal Station",
  "The Tree",
  "Lava Siphon",
  "Launch Site",
  "The Dome",
  "Lava City",
  "Big Maude (Rampart Town Takeover)",
  "The Geyser",
  "Fragment East",
  "Fragment West",
  "Overlook",
  "The Epicenter",
  "Survey Camp",
  "Climatizer",
];

const special = [
  "Nessie",
]

const pool = [...legends, ...guns, ...dropsKC, ...dropsOL, ...dropsSP, ...dropsWE, ...special];
