"use client";

import { useState, useEffect } from "react";
import { LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInWithGoogle, signOut, onAuthStateChange } from "@/lib/auth";
import { User as FirebaseUser } from "firebase/auth";

export function GoogleLoginButton() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-white">Angemeldet</h3>
          <p className="text-gray-400">Willkommen zurück!</p>
        </div>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-brand-500/20 rounded-full flex items-center justify-center">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profilbild"
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <User className="w-6 h-6 text-brand-400" />
              )}
            </div>
            <div className="text-left">
              <p className="text-white font-medium">{user.displayName}</p>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
          </div>

          <Button
            onClick={handleSignOut}
            disabled={isLoading}
            variant="outline"
            size="lg"
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isLoading ? "Wird abgemeldet..." : "Abmelden"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-white">Mit Google anmelden</h3>
        <p className="text-gray-400">Schnell und sicher mit deinem Google-Konto</p>
      </div>

      <div className="text-center">
        <Button
          onClick={handleSignIn}
          disabled={isLoading}
          variant="brand"
          size="lg"
          className="w-full"
        >
          <LogIn className="w-4 h-4 mr-2" />
          {isLoading ? "Wird angemeldet..." : "Mit Google anmelden"}
        </Button>
        
        <p className="text-gray-400 text-xs mt-4">
          Durch die Anmeldung stimmst du unseren Nutzungsbedingungen zu.
        </p>
      </div>
    </div>
  );
}