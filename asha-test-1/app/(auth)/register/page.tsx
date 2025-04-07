"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Wachtwoorden komen niet overeen");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('rate limit')) {
          setError("Te veel aanmeldpogingen. Wacht een moment en probeer het opnieuw.");
        } else if (signUpError.message.includes('already registered')) {
          setError("Dit e-mailadres is al in gebruik");
        } else {
          console.error("Sign up error:", signUpError);
          setError("Er is een fout opgetreden bij het registreren");
        }
        return;
      }

      if (!data.user) {
        setError("Er is een fout opgetreden bij het registreren");
        return;
      }

      // Insert into users table
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: data.user.email
          }
        ]);

      if (insertError) {
        console.error("Insert error:", insertError);
        if (insertError.code === '23505') {
          setError("Dit e-mailadres is al in gebruik");
        } else {
          setError("Er is een fout opgetreden bij het maken van het account");
        }
        return;
      }

      router.push("/login?registered=true");
    } catch (error) {
      console.error("Registration error:", error);
      setError("Er is een onverwachte fout opgetreden");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6 max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-secondary mb-4 text-center">
          Registreren
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-secondary">
              E-mailadres:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-secondary">
              Wachtwoord:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-secondary">
              Bevestig wachtwoord:
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="bg-primary text-white py-2 px-4 rounded-md w-full hover:bg-primary-dark-text transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Bezig met registreren..." : "Registreren"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Al een account?{" "}
            <Link href="/login" className="text-primary hover:text-secondary">
              Log hier in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}