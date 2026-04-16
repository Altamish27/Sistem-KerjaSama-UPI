"use client";

import { useEffect, useState } from "react";
import type { AppRole } from "@/lib/workflow";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  unit?: string;
  institution?: string;
}

const SESSION_KEY = "simadu.session.user";

export function saveSessionUser(user: SessionUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSessionUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function readSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as SessionUser;
    if (!parsed?.id || !parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function useSessionUser() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    setUser(readSessionUser());
  }, []);

  return user;
}
