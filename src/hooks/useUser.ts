import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type UserRole = "admin" | "user";

export type User = {
  id: string;
  email: string;
  role: UserRole;
};

export function useUser() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session?.user) {
        const role: UserRole =
          data.session.user.email === "waterlily-admin@yopmail.com"
            ? "admin"
            : "user";
        setUser({
          id: data.session.user.id,
          email: data.session.user.email!,
          role,
        });
      } else {
        setUser(null);
      }
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const role: UserRole =
            session.user.email === "waterlily-admin@yopmail.com"
              ? "admin"
              : "user";
          setUser({
            id: session.user.id,
            email: session.user.email!,
            role,
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  return user;
}
