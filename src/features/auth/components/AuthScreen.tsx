"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthFlow } from "@/features/auth/lib/types";
import { safeRedirectPath } from "@/features/auth/lib/safe-redirect";
import { SignInCard } from "./SignInCard";
import { SignUpCard } from "./SignUpCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthScreenProps {
  onClose?: () => void;
}

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export const AuthScreen = ({ onClose }: AuthScreenProps) => {
  const [authFlow, setAuthFlow] = useState<AuthFlow>("signIn");
  const router = useRouter();
  const searchParams = useSearchParams();
  // Where to go once signed in. Parsed against this origin; anything
  // cross-origin falls back to the app.
  const rawCallback = searchParams?.get("callbackUrl");
  const [callbackUrl, setCallbackUrl] = useState("/dashboard");
  useEffect(() => {
    setCallbackUrl(safeRedirectPath(rawCallback, window.location.origin));
  }, [rawCallback]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onClose]);

  const handleContinueAsGuest = () => {
    // The middleware reads this cookie; localStorage alone never let guests in.
    document.cookie = "userStatus=guest; path=/; max-age=2592000; SameSite=Lax";
    try {
      localStorage.setItem("userStatus", "guest");
    } catch {
      /* storage blocked; the cookie is enough */
    }
    if (onClose) onClose();
    router.push(callbackUrl);
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />

      {/* Auth Container */}
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {authFlow === "signIn" ? (
              <SignInCard key="signin" setState={setAuthFlow} onClose={onClose} redirectTo={callbackUrl} />
            ) : (
              <SignUpCard key="signup" setState={setAuthFlow} onClose={onClose} redirectTo={callbackUrl} />
            )}
          </AnimatePresence>
          {/* Guest entry. The middleware lets guests into the app through the cookie set here. */}
          <div className="mt-3 flex items-center justify-center">
            <Button type="button" variant="ghost" size="sm" onClick={handleContinueAsGuest}>
              Continue as a guest
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};