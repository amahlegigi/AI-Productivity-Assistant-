import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ActivityKind = "email" | "meeting" | "planner" | "research" | "chat";

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  at: number;
};

export type EmailSeed = {
  purpose?: string;
  recipient?: string;
  mainPoints?: string;
};

export type PlannerSeed = {
  tasks: string;
  notes?: string;
};

type StoreValue = {
  hydrated: boolean;
  activity: ActivityItem[];
  logActivity: (item: Omit<ActivityItem, "id" | "at">) => void;
  clearActivity: () => void;
  emailSeed: EmailSeed | null;
  setEmailSeed: (seed: EmailSeed | null) => void;
  plannerSeed: PlannerSeed | null;
  setPlannerSeed: (seed: PlannerSeed | null) => void;
  usage: Record<ActivityKind, number>;
};

const KEY = "workmate-ai-state-v1";

const WorkmateContext = createContext<StoreValue | null>(null);

type Persisted = {
  activity: ActivityItem[];
  emailSeed: EmailSeed | null;
  plannerSeed: PlannerSeed | null;
};

export function WorkmateProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [emailSeed, setEmailSeed] = useState<EmailSeed | null>(null);
  const [plannerSeed, setPlannerSeed] = useState<PlannerSeed | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Persisted>;
        setActivity(Array.isArray(parsed.activity) ? parsed.activity : []);
        setEmailSeed(parsed.emailSeed ?? null);
        setPlannerSeed(parsed.plannerSeed ?? null);
      }
    } catch {
      /* ignore corrupted local state */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ activity, emailSeed, plannerSeed }));
    } catch {
      /* storage unavailable */
    }
  }, [hydrated, activity, emailSeed, plannerSeed]);

  const logActivity = useCallback((item: Omit<ActivityItem, "id" | "at">) => {
    setActivity((prev) =>
      [
        { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, at: Date.now() },
        ...prev,
      ].slice(0, 25),
    );
  }, []);

  const value = useMemo<StoreValue>(() => {
    const usage: Record<ActivityKind, number> = {
      email: 0,
      meeting: 0,
      planner: 0,
      research: 0,
      chat: 0,
    };
    for (const item of activity) usage[item.kind] += 1;

    return {
      hydrated,
      activity,
      logActivity,
      clearActivity: () => setActivity([]),
      emailSeed,
      setEmailSeed,
      plannerSeed,
      setPlannerSeed,
      usage,
    };
  }, [hydrated, activity, logActivity, emailSeed, plannerSeed]);

  return <WorkmateContext.Provider value={value}>{children}</WorkmateContext.Provider>;
}

export function useWorkmate() {
  const ctx = useContext(WorkmateContext);
  if (!ctx) throw new Error("useWorkmate must be used inside WorkmateProvider");
  return ctx;
}
