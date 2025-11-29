// Constants for MSA-SCOUT Deal Finder
// Only these 10 specific MSAs are allowed for property searching

export const ALLOWED_MSAS = [
  "Sandusky",
  "Auburn-Opelika", 
  "Reno",
  "Panama City-Panama City Beach",
  "Lubbock",
  "Waco",
  "Daphne-Fairhope-Foley",
  "Bozeman",
  "Austin-Round Rock-San Marcos",
  "Tuscaloosa"
];

// Map each MSA to its corresponding state
export const MSA_STATE_MAP: Record<string, string> = {
  "Sandusky": "Ohio",
  "Auburn-Opelika": "Alabama",
  "Reno": "Nevada",
  "Panama City-Panama City Beach": "Florida",
  "Lubbock": "Texas",
  "Waco": "Texas",
  "Daphne-Fairhope-Foley": "Alabama",
  "Bozeman": "Montana",
  "Austin-Round Rock-San Marcos": "Texas",
  "Tuscaloosa": "Alabama"
};