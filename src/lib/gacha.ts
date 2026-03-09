
export type GoalType = 'character' | 'weapon';

export interface Goal {
  id: string;
  type: GoalType;
  label: string; // e.g., "C0", "R1"
}

export interface SimulationConfig {
  initialWishes: number;
  initialCharPity: number;
  initialWeaponPity: number;
  isCharGuaranteed: boolean;
  crCounter: number;
  sequence: Goal[];
}

export interface SimulationResult {
  successRate: number[]; // Percentage of iterations that completed step i
  averageWishesUsed: number[]; // Average wishes used to complete step i (cumulative)
}

// Soft pity probability tables (approximate based on community data)
// Character: Base 0.6%, Soft 74
const getCharProb = (pity: number): number => {
  if (pity < 74) return 0.006;
  if (pity >= 90) return 1.0;
  return 0.006 + (pity - 73) * 0.06; // Linear ramp approx 6% per pull
};

// Weapon: Base 0.7%, Soft 63
const getWeaponProb = (pity: number): number => {
  if (pity < 63) return 0.007;
  if (pity >= 80) return 1.0;
  return 0.007 + (pity - 62) * 0.07; // Linear ramp approx 7% per pull
};

export const runSimulationBatch = (
  config: SimulationConfig,
  iterations: number
): { stepCounts: number[]; totalWishesUsed: number[] } => {
  const stepCounts = new Array(config.sequence.length).fill(0);
  const totalWishesUsed = new Array(config.sequence.length).fill(0);

  for (let i = 0; i < iterations; i++) {
    let wishes = config.initialWishes;
    let charPity = config.initialCharPity;
    let weaponPity = config.initialWeaponPity;
    let isCharGuaranteed = config.isCharGuaranteed;
    let crCounter = config.crCounter;
    let fatePoints = 0; 

    let wishesSpent = 0;

    for (let stepIndex = 0; stepIndex < config.sequence.length; stepIndex++) {
      const goal = config.sequence[stepIndex];
      let goalMet = false;

      while (wishes > 0 && !goalMet) {
        wishes--;
        wishesSpent++;

        if (goal.type === 'character') {
          charPity++;
          const prob = getCharProb(charPity);
          if (Math.random() < prob) {
            // 5* obtained
            charPity = 0;
            if (isCharGuaranteed) {
              goalMet = true;
              isCharGuaranteed = false;
              // crCounter NE CHANGE PAS
            } else {
              // 50/50 logic (Capturing Radiance)
              let winProb = 0.5;
              if (crCounter === 0 || crCounter === 1) winProb = 0.50;
              else if (crCounter === 2) winProb = 0.75;
              else if (crCounter >= 3) winProb = 1.00;

              if (Math.random() < winProb) {
                // Won 50/50
                goalMet = true;
                isCharGuaranteed = false;
                crCounter = 0;
              } else {
                // Lost 50/50
                goalMet = false;
                isCharGuaranteed = true;
                crCounter++;
              }
            }
          }
        } else {
          // Weapon banner
          weaponPity++;
          const prob = getWeaponProb(weaponPity);
          if (Math.random() < prob) {
            // 5* obtained
            weaponPity = 0;
            if (fatePoints === 1) {
              goalMet = true;
              fatePoints = 0;
            } else {
              // Fate points == 0
              // 75% to be featured
              if (Math.random() < 0.75) {
                // 50% to be target
                if (Math.random() < 0.5) {
                  goalMet = true;
                  fatePoints = 0;
                } else {
                  // Got the other featured weapon
                  goalMet = false;
                  fatePoints = 1;
                }
              } else {
                // Got standard weapon
                goalMet = false;
                fatePoints = 1;
              }
            }
          }
        }
      }

      if (goalMet) {
        stepCounts[stepIndex]++;
        totalWishesUsed[stepIndex] += wishesSpent;
      } else {
        // If goal not met (ran out of wishes), stop this iteration
        break;
      }
    }
  }

  return { stepCounts, totalWishesUsed };
};
