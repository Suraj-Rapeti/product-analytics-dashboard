import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import "dotenv/config";

const requiredEnvKeys = [
  "REACT_APP_FIREBASE_API_KEY",
  "REACT_APP_FIREBASE_AUTH_DOMAIN",
  "REACT_APP_FIREBASE_PROJECT_ID",
];

const missingEnvKeys = requiredEnvKeys.filter((key) => {
  const value = process.env[key];
  return !value || value.includes("YOUR_");
});

if (missingEnvKeys.length > 0) {
  throw new Error(
    `Missing Firebase env values: ${missingEnvKeys.join(", ")}. Update your .env file before running seed.`
  );
}

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const START_DATE = new Date(2025, 4, 1); // May 1, 2025
const END_DATE = new Date(2026, 0, 31); // Jan 31, 2026
const TOTAL_DAYS = Math.floor((END_DATE - START_DATE) / (1000 * 60 * 60 * 24)) + 1;

const SEGMENTS = {
  active: {
    dailyActivityRate: 0.42,
    viewsMin: 2,
    viewsMax: 6,
    addToCartChance: 0.38,
    checkoutChance: 0.55,
  },
  casual: {
    dailyActivityRate: 0.18,
    viewsMin: 1,
    viewsMax: 3,
    addToCartChance: 0.22,
    checkoutChance: 0.35,
  },
  inactive: {
    dailyActivityRate: 0.04,
    viewsMin: 1,
    viewsMax: 2,
    addToCartChance: 0.1,
    checkoutChance: 0.12,
  },
};

const PRODUCT_CATALOG = [
  { name: "Laptop", minPrice: 1100, maxPrice: 2400, weight: 0.1 },
  { name: "Phone", minPrice: 500, maxPrice: 1400, weight: 0.22 },
  { name: "Tablet", minPrice: 280, maxPrice: 900, weight: 0.16 },
  { name: "Headphones", minPrice: 60, maxPrice: 300, weight: 0.2 },
  { name: "Accessories", minPrice: 15, maxPrice: 120, weight: 0.32 },
];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const weightedPick = (items) => {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let cursor = Math.random() * totalWeight;
  for (const item of items) {
    cursor -= item.weight;
    if (cursor <= 0) return item;
  }
  return items[items.length - 1];
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const randomDateTimeForDay = (dayDate) => {
  const dt = new Date(dayDate);
  const eveningBias = Math.random() < 0.65;
  const hour = eveningBias ? randomInt(17, 23) : randomInt(9, 16);
  dt.setHours(hour, randomInt(0, 59), randomInt(0, 59), 0);
  return dt;
};

const monthlyDemandFactor = {
  0: 1.25, // Jan
  1: 0.95, // Feb
  2: 0.98, // Mar
  3: 1.02, // Apr
  4: 1.08, // May
  5: 1.0, // Jun
  6: 1.05, // Jul
  7: 1.12, // Aug
  8: 1.15, // Sep
  9: 1.28, // Oct
  10: 1.35, // Nov
  11: 1.45, // Dec
};

const generateUsers = async (count = 80) => {
  console.log("Creating users...");
  const users = [];

  for (let i = 0; i < count; i++) {
    // Bias signup distribution toward later dates for gradual growth.
    const growthOffset = Math.floor(TOTAL_DAYS * Math.pow(Math.random(), 0.72));
    const signupDate = new Date(START_DATE);
    signupDate.setDate(signupDate.getDate() + growthOffset);

    const segmentRoll = Math.random();
    const segment = segmentRoll < 0.24 ? "active" : segmentRoll < 0.8 ? "casual" : "inactive";
    const userId = `user_${String(i + 1).padStart(4, "0")}`;

    users.push({
      userId,
      name: `User ${i + 1}`,
      email: `user${i + 1}@test.com`,
      signupDate: signupDate.toISOString(),
      segment,
    });

    await addDoc(collection(db, "users"), {
      userId,
      name: `User ${i + 1}`,
      email: `user${i + 1}@test.com`,
      signupDate: signupDate.toISOString(),
      segment,
    });
  }

  return users;
};

const generateBehaviorData = async (users) => {
  console.log("Simulating user behavior, events, and orders...");

  const monthlyTotals = {};
  const segmentOrderCounts = { active: 0, casual: 0, inactive: 0 };
  const segmentEventCounts = { active: 0, casual: 0, inactive: 0 };

  let totalEvents = 0;
  let totalOrders = 0;

  for (const user of users) {
    const segmentCfg = SEGMENTS[user.segment] || SEGMENTS.casual;
    const userSignupDate = new Date(user.signupDate);

    for (let d = 0; d < TOTAL_DAYS; d++) {
      const currentDate = new Date(START_DATE);
      currentDate.setDate(START_DATE.getDate() + d);
      currentDate.setHours(0, 0, 0, 0);

      if (currentDate < userSignupDate) continue;

      const month = currentDate.getMonth();
      const demandFactor = monthlyDemandFactor[month] || 1;
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
      const dayNoise = 0.85 + Math.random() * 0.35;

      let activityChance = segmentCfg.dailyActivityRate * dayNoise * demandFactor;
      if (isWeekend) activityChance *= 1.18;

      // Keep inactive users mostly quiet to preserve zero-event / low-signal edge cases.
      activityChance = clamp(activityChance, 0.01, user.segment === "inactive" ? 0.12 : 0.8);

      if (Math.random() > activityChance) continue;

      const viewsToday = randomInt(segmentCfg.viewsMin, segmentCfg.viewsMax);
      let cartAddsToday = 0;
      let checkoutsToday = 0;

      for (let i = 0; i < viewsToday; i++) {
        await addDoc(collection(db, "events"), {
          type: "view_product",
          timestamp: randomDateTimeForDay(currentDate).toISOString(),
          userId: user.userId,
          page: "/product",
          segment: user.segment,
        });
        totalEvents += 1;
        segmentEventCounts[user.segment] += 1;

        if (Math.random() <= segmentCfg.addToCartChance) {
          cartAddsToday += 1;
          await addDoc(collection(db, "events"), {
            type: "add_to_cart",
            timestamp: randomDateTimeForDay(currentDate).toISOString(),
            userId: user.userId,
            page: "/product",
            segment: user.segment,
          });
          totalEvents += 1;
          segmentEventCounts[user.segment] += 1;

          if (Math.random() <= segmentCfg.checkoutChance) {
            checkoutsToday += 1;
            await addDoc(collection(db, "events"), {
              type: "checkout",
              timestamp: randomDateTimeForDay(currentDate).toISOString(),
              userId: user.userId,
              page: "/checkout",
              segment: user.segment,
            });
            totalEvents += 1;
            segmentEventCounts[user.segment] += 1;
          }
        }
      }

      // Some users never buy, some buy repeatedly.
      const purchaseIntensity = user.segment === "active" ? 1.15 : user.segment === "casual" ? 0.7 : 0.2;
      const expectedOrders = Math.round(checkoutsToday * purchaseIntensity * (0.9 + Math.random() * 0.4));

      for (let i = 0; i < expectedOrders; i++) {
        const product = weightedPick(PRODUCT_CATALOG);
        const qty = randomInt(1, user.segment === "active" ? 3 : 2);
        const perUnit = randomInt(product.minPrice, product.maxPrice);
        const noisyAmount = Math.round(perUnit * qty * (0.9 + Math.random() * 0.24));
        const status = Math.random() < 0.18 ? "cancelled" : "completed";

        await addDoc(collection(db, "orders"), {
          amount: noisyAmount,
          date: randomDateTimeForDay(currentDate).toISOString(),
          status,
          product: product.name,
          quantity: qty,
          userId: user.userId,
          segment: user.segment,
        });

        totalOrders += 1;
        segmentOrderCounts[user.segment] += 1;
      }

      const monthKey = currentDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + expectedOrders;
    }
  }

  console.log("Monthly order distribution:");
  Object.entries(monthlyTotals).forEach(([month, count]) => {
    console.log(`  ${month}: ${count} orders`);
  });

  console.log("Segment summary:");
  Object.keys(segmentOrderCounts).forEach((segment) => {
    console.log(
      `  ${segment}: ${segmentOrderCounts[segment]} orders, ${segmentEventCounts[segment]} events`
    );
  });

  console.log(`Generated ${totalOrders} orders and ${totalEvents} events.`);
};

// 🔥 RUN EVERYTHING
const seedDatabase = async () => {
  try {
    console.log("🚀 Seeding started...");

    const users = await generateUsers();
    await generateBehaviorData(users);

    console.log("✅ Seeding complete!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
};

seedDatabase();