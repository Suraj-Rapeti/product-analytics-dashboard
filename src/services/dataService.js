import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export const getUsers = async () => {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map(doc => doc.data());
};

export const getOrders = async () => {
  const snapshot = await getDocs(collection(db, "orders"));
  return snapshot.docs.map(doc => doc.data());
};

export const getEvents = async () => {
  const snapshot = await getDocs(collection(db, "events"));
  return snapshot.docs.map(doc => doc.data());
};