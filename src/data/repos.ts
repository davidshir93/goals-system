import {
  collection,
  getDocs,
  query,
  orderBy,
  type DocumentData,
  addDoc,
  getDoc,
  doc,
  setDoc,
  writeBatch,
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
    return snap.docs.map(mapDoc<Category>);
  },

  async addCategory(uid: ID, newCategoryData: Category): Promise<Category> {
    const docRef = await addDoc(
      collection(db, paths.categories(uid)),
      newCategoryData
    );

    const docSnap = await getDoc(docRef);
    return mapDoc<Category>(docSnap);
  },

  async addCategories(uid: ID, items: Category[]): Promise<ID> {
    try {
      const batch = writeBatch(db);

      const colRef = collection(db, paths.categories(uid));

      // 1. Fetch existing docs
      const snapshot = await getDocs(colRef);
      const existingIds = snapshot.docs.map((doc) => doc.id);

      // 2. Build new set of IDs from form
      const newIds = items.map((item) => item.id);

      // 3. Queue deletes for docs that are no longer in the form
      existingIds.forEach((id) => {
        if (!newIds.includes(id)) {
          batch.delete(doc(colRef, id));
        }
      });

      // 4. Queue set for current items
      items.forEach((item) => {
        const ref = doc(colRef, item.id);

        batch.set(ref, {
          id: item.id,
          name: item.name.trim(),
          color: item.color,
        });
      });

      // 5. Commit all changes atomically
      await batch.commit();
    } catch (error) {
      console.error("Error saving items:", error);
    }
    return uid;
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

  async addIdentity(uid: ID, newIdentityData: Identity): Promise<Identity> {
    const docRef = await addDoc(
      collection(db, paths.identities(uid)),
      newIdentityData
    );

    const docSnap = await getDoc(docRef);
    return mapDoc<Identity>(docSnap);
  },

  async addIdentities(uid: ID, items: Category[]): Promise<ID> {
    try {
      const batch = writeBatch(db);

      const colRef = collection(db, paths.identities(uid));

      // 1. Fetch existing docs
      const snapshot = await getDocs(colRef);
      const existingIds = snapshot.docs.map((doc) => doc.id);

      // 2. Build new set of IDs from form
      const newIds = items.map((item) => item.id);

      // 3. Queue deletes for docs that are no longer in the form
      existingIds.forEach((id) => {
        if (!newIds.includes(id)) {
          batch.delete(doc(colRef, id));
        }
      });

      // 4. Queue set for current items
      items.forEach((item) => {
        const ref = doc(colRef, item.id);

        batch.set(ref, {
          id: item.id,
          name: item.name.trim(),
          color: item.color,
        });
      });

      // 5. Commit all changes atomically
      await batch.commit();
    } catch (error) {
      console.error("Error saving items:", error);
    }
    return uid;
  },
};

export const YearsRepo = {
  async listAll(uid: ID): Promise<Period[]> {
    const q = query(collection(db, paths.years(uid)));
    const snap = await getDocs(q);

    return snap.docs.map(mapDoc<Period>);
  },

  async addYear(uid: ID, newYearId: ID, newYearData: Period): Promise<ID> {
    const docRef = doc(db, paths.years(uid), newYearId);
    await setDoc(docRef, newYearData);

    // const docSnap = await getDoc(docRef);
    // return mapDoc<Period>(docSnap);
    return uid;
  },
};

export const YearlyGoals = {
  async listAll(uid: ID, yearId: ID): Promise<YearGoal[]> {
    const q = query(collection(db, paths.yearlyGoals(uid, yearId)));
    const snap = await getDocs(q);

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
    return mapDoc<YearGoal>(docSnap);
  },
};

export const QuartersRepo = {
  async listAll(uid: ID, yearId: ID): Promise<Period[]> {
    const q = query(collection(db, paths.quarters(uid, yearId)));
    const snap = await getDocs(q);

    return snap.docs.map(mapDoc<Period>);
  },

  async addQuarter(
    uid: ID,
    selectedYear: ID,
    newQuarterId: ID,
    newQuarterData: Period
  ): Promise<{ uid: ID; selectedYear: ID }> {
    const docRef = doc(db, paths.quarters(uid, selectedYear), newQuarterId);
    await setDoc(docRef, newQuarterData);

    return { uid, selectedYear };
  },
};

export const QuarterlyGoals = {
  async listAll(uid: ID, yearId: ID, quarterId: ID): Promise<QuarterGoal[]> {
    const q = query(
      collection(db, paths.quarterlyGoals(uid, yearId, quarterId))
    );
    const snap = await getDocs(q);

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

    return mapDoc<QuarterGoal>(docSnap);
  },
};

export const WeeksRepo = {
  async listAll(uid: ID, yearId: ID, quarterId: ID): Promise<Period[]> {
    const q = query(collection(db, paths.weeks(uid, yearId, quarterId)));
    const snap = await getDocs(q);

    return snap.docs.map(mapDoc<Period>);
  },

  async addWeek(
    uid: ID,
    selectedYear: ID,
    selectedQuarter: ID,
    newWeekId: ID,
    newWeekData: Period
  ): Promise<{ uid: ID; selectedYear: ID; selectedQuarter: ID }> {
    const docRef = doc(
      db,
      paths.weeks(uid, selectedYear, selectedQuarter),
      newWeekId
    );

    await setDoc(docRef, newWeekData);

    return { uid, selectedYear, selectedQuarter };
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

    return mapDoc<WeekGoal>(docSnap);
  },
};
