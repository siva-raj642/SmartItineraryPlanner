import { db } from "../config/db";
import tnData from "../data/tn-itineraries.json";

const importData = async () => {
  try {
    for (const destination in tnData) {
      const plans = (tnData as any)[destination];

      for (const p of plans) {
        await db.execute(
          `INSERT INTO system_itineraries 
           (destination, plan_id, budget_tier, days, estimated_cost, title, itinerary)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            destination,
            p.id,
            p.budgetTier,
            p.days,
            p.estimatedCost,
            p.title || `${destination} ${p.days} Day Trip`,
            JSON.stringify(p.itinerary)
          ]
        );
      }
    }

    console.log("Imported Successfully ");
    process.exit(0);
  } catch (err) {
    console.error("Import Failed ", err);
    process.exit(1);
  }
};

importData();
