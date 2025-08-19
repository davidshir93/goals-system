import {
  collection,
  getDocs,
  query,
  orderBy,
  type DocumentData,
  addDoc,
  getDoc,
} from "firebase/firestore";
import { paths } from "../lib/paths";
import { db } from "@/firebase";
import type {
  Category,
  ID,
  Identity,
  Period,
  QuarterGoal,
  WeekGoal,
  YearGoal,
} from "@/types/GoalTypes";

function mapDoc<T extends { id: string }>(d: DocumentData): T {
  return { id: d.id, ...d.data() } as T;
}

export const CategoriesRepo = {
  async listAll(uid: ID): Promise<Category[]> {
    const q = query(
      collection(db, paths.categories(uid)),
      orderBy("name", "asc")
    );
    const snap = await getDocs(q);
    console.log("found categories!");
    console.log(snap.docs.map(mapDoc<Category>));
    return snap.docs.map(mapDoc<Category>);
  },
};

export const IdentitiesRepo = {
  async listAll(uid: ID): Promise<Identity[]> {
    const q = query(
      collection(db, paths.identities(uid)),
      orderBy("name", "asc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(mapDoc<Identity>);
  },
};

export const YearsRepo = {
  async listAll(uid: ID): Promise<Period[]> {
    const q = query(collection(db, paths.years(uid)));
    const snap = await getDocs(q);

    console.log("found years!");
    console.log(snap.docs.map(mapDoc<Period>));
    return snap.docs.map(mapDoc<Period>);
  },
};

export const YearlyGoals = {
  async listAll(uid: ID, yearId: ID): Promise<YearGoal[]> {
    const q = query(collection(db, paths.yearlyGoals(uid, yearId)));
    const snap = await getDocs(q);

    console.log("found yearly goals!");
    console.log(snap.docs.map(mapDoc<YearGoal>));
    return snap.docs.map(mapDoc<YearGoal>);
  },
  async addYearlyGoal(
    uid: ID,
    yearId: ID,
    yearlyGoalData: YearGoal
  ): Promise<YearGoal> {
    const docRef = await addDoc(
      collection(db, paths.yearlyGoals(uid, yearId)),
      yearlyGoalData
    );

    const docSnap = await getDoc(docRef);
    console.log("Created new yearly goal");
    console.log(mapDoc<YearGoal>(docSnap));
    return mapDoc<YearGoal>(docSnap);
  },
};

export const QuartersRepo = {
  async listAll(uid: ID, yearId: ID): Promise<Period[]> {
    console.log("got to quarters repo");
    console.log(uid, yearId);
    const q = query(collection(db, paths.quarters(uid, yearId)));
    const snap = await getDocs(q);

    console.log("found quarters!");
    console.log(snap.docs.map(mapDoc<Period>));
    return snap.docs.map(mapDoc<Period>);
  },
};

export const QuarterlyGoals = {
  async listAll(uid: ID, yearId: ID, quarterId: ID): Promise<QuarterGoal[]> {
    const q = query(
      collection(db, paths.quarterlyGoals(uid, yearId, quarterId))
    );
    const snap = await getDocs(q);

    console.log("found quarterly goals!");
    console.log(snap.docs.map(mapDoc<QuarterGoal>));
    return snap.docs.map(mapDoc<QuarterGoal>);
  },
  async addQuarterlyGoal(
    uid: ID,
    yearId: ID,
    quarterId: ID,
    quarterlyGoalData: QuarterGoal
  ): Promise<QuarterGoal> {
    const docRef = await addDoc(
      collection(db, paths.quarterlyGoals(uid, yearId, quarterId)),
      quarterlyGoalData
    );

    const docSnap = await getDoc(docRef);
    console.log("Created new quarterly goal");
    console.log(mapDoc<QuarterGoal>(docSnap));
    return mapDoc<QuarterGoal>(docSnap);
  },
};

export const WeeksRepo = {
  async listAll(uid: ID, yearId: ID, quarterId: ID): Promise<Period[]> {
    console.log("got to weeks repo");
    console.log(uid, yearId, quarterId);
    const q = query(collection(db, paths.weeks(uid, yearId, quarterId)));
    const snap = await getDocs(q);

    console.log("found weeks!");
    console.log(snap.docs.map(mapDoc<Period>));
    return snap.docs.map(mapDoc<Period>);
  },
};

export const WeeklyGoals = {
  async listAll(
    uid: ID,
    yearId: ID,
    quarterId: ID,
    weekId: ID
  ): Promise<WeekGoal[]> {
    const q = query(
      collection(db, paths.weeklyGoals(uid, yearId, quarterId, weekId))
    );
    const snap = await getDocs(q);

    console.log("found weekly goals!");
    console.log(snap.docs.map(mapDoc<WeekGoal>));
    return snap.docs.map(mapDoc<WeekGoal>);
  },
  async addWeeklyGoal(
    uid: ID,
    yearId: ID,
    quarterId: ID,
    weekId: ID,
    weeklyGoalData: WeekGoal
  ): Promise<WeekGoal> {
    const docRef = await addDoc(
      collection(db, paths.weeklyGoals(uid, yearId, quarterId, weekId)),
      weeklyGoalData
    );

    const docSnap = await getDoc(docRef);
    console.log("Created new weekly goal");
    console.log(mapDoc<WeekGoal>(docSnap));
    return mapDoc<WeekGoal>(docSnap);
  },
};
