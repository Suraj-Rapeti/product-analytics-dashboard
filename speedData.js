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

const randomAmount = () => Math.floor(Math.random() * 1000) + 100;

const randomUserId = () => "user_" + Math.floor(Math.random() * 50);

const eventTypes = ["view_product", "add_to_cart", "checkout", "signup"];
const products = ["Laptop", "Phone", "Tablet", "Headphones"];

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


const generateUsers = async (count = 30) => {
  console.log("Creating users...");
  for (let i = 0; i < count; i++) {
    const signupDate = new Date(START_DATE);
    signupDate.setDate(signupDate.getDate() + Math.floor(Math.random() * 276));

    await addDoc(collection(db, "users"), {
      name: `User ${i}`,
      email: `user${i}@test.com`,
      signupDate: signupDate.toISOString(),
    });
  }
};

// 🔥 GENERATE ORDERS WITH REALISTIC PATTERN
const generateOrders = async () => {
  console.log("Creating orders...");

  const monthlyTotals = {};
  for (let d = 0; d < TOTAL_DAYS; d++) {
    const currentDate = new Date(START_DATE);
    currentDate.setDate(START_DATE.getDate() + d);

    const dayOfWeek = currentDate.getDay();
    const month = currentDate.getMonth();
    const factor = monthlyDemandFactor[month] || 1;

    // Base daily orders with month-level seasonality
    let ordersToday = Math.max(1, Math.round((Math.random() * 4 + 2) * factor));

    // Weekend boost
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      ordersToday += Math.floor(Math.random() * 3) + 1;
    }

    // Occasional campaign spikes
    if (Math.random() > 0.9) {
      ordersToday += Math.floor(Math.random() * 6) + 4;
    }

    const monthKey = currentDate.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + ordersToday;

    for (let i = 0; i < ordersToday; i++) {
      const dailyAmount = Math.round(randomAmount() * (0.85 + factor * 0.2));
      await addDoc(collection(db, "orders"), {
        amount: dailyAmount,
        date: currentDate.toISOString(),
        status: Math.random() > 0.2 ? "completed" : "cancelled",
        product: products[Math.floor(Math.random() * products.length)],
        quantity: Math.floor(Math.random() * 5) + 1,
        userId: randomUserId(),
      });
    }
  }

  console.log("Monthly order distribution:");
  Object.entries(monthlyTotals).forEach(([month, count]) => {
    console.log(`  ${month}: ${count} orders`);
  });
};

// 🔥 GENERATE EVENTS
const generateEvents = async (count = 200) => {
  console.log("Creating events...");

  for (let i = 0; i < count; i++) {
    const eventDate = new Date(START_DATE);
    eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * TOTAL_DAYS));

    await addDoc(collection(db, "events"), {
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      timestamp: eventDate.toISOString(),
      userId: randomUserId(),
      page: ["/home", "/product", "/checkout"][Math.floor(Math.random() * 3)],
    });
  }
};

// 🔥 RUN EVERYTHING
const seedDatabase = async () => {
  try {
    console.log("🚀 Seeding started...");

    await generateUsers();
    await generateOrders();
    await generateEvents();

    console.log("✅ Seeding complete!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
};

seedDatabase();