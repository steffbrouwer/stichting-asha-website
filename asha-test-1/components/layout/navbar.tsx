"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Activiteiten", href: "/activiteiten" },
  { name: "Agenda", href: "/agenda" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <header className="bg-surface">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center p-4 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Image
              src="https://www.stichtingasha.nl/img/home/asha-logo.png"
              alt="Logo"
              width={48}
              height={48}
              className="h-12 w-auto"
            />
            <span className="text-secondary text-xl font-bold">Stichting Asha</span>
          </div>
        </div>
      </header>
      <div className="container mx-auto p-4">
        <ul className="flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "text-secondary hover:text-primary font-semibold",
                  pathname === item.href && "text-primary"
                )}
              >
                {item.name}
              </Link>
            </li>
          ))}
          <li className="md:ml-auto">
            {!loading && (
              isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/dashboard"
                    className="text-primary hover:text-primary-dark-text"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-red-500 hover:text-red-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Uitloggen</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center text-primary hover:text-primary-dark-text"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Inloggen</span>
                </Link>
              )
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}