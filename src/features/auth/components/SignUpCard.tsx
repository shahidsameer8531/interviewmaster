"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { AuthFlow } from "@/features/auth/lib/types";
import { useAuthActions } from "@convex-dev/auth/react";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { TriangleAlert } from "lucide-react";
import { X } from "lucide-react";

import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OAUTH_PROVIDERS } from "@/features/auth/lib/oauth-providers";
import { EMAIL_PATTERN, MESSAGES, MIN_PASSWORD_LENGTH, classifySignInError, clearGuestCookie } from "@/features/auth/lib/sign-in-errors";
import { useConvex } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface SignUpCardProps {
    /** Where to go after a successful sign-in. */
    redirectTo?: string;
  setState: (state: AuthFlow) => void;
  onClose: () => void;
}

export const SignUpCard = ({ setState, onClose, redirectTo = "/dashboard" }: SignUpCardProps) => {
    const router = useRouter();
  const { signIn } = useAuthActions();
  const convex = useConvex();
  const [account, setAccount] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUpByEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (account.password !== account.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!account.name || !account.email || !account.password) {
      setError("All fields are required");
      return;
    }

    if (!EMAIL_PATTERN.test(account.email.trim())) {
      setError(MESSAGES.invalidEmail);
      return;
    }

    if (account.password.length < MIN_PASSWORD_LENGTH) {
      setError(MESSAGES.shortPassword);
      return;
    }

    setPending(true);
    setError(null);
    const email = account.email.trim();

    // The proxy hides the server's reason, so the one case we can name is
    // looked up directly: does a password account already exist for this email?
    const explainRejection = async () => {
      try {
        const taken = await convex.query(api.users.emailTaken, { email });
        setError(taken ? MESSAGES.signUpExists : MESSAGES.signUpRejected);
      } catch {
        setError(MESSAGES.signUpRejected);
      }
    };

    try {
      const result = await signIn("password", {
        name: account.name.trim(),
        email,
        password: account.password,
        flow: "signUp",
      });
      if (!result.signingIn) {
        await explainRejection();
        return;
      }
      clearGuestCookie();
      router.push(redirectTo);
    } catch (err) {
      console.error("Signup error:", err);
      if (classifySignInError(err) === "network") {
        setError(MESSAGES.network);
      } else {
        await explainRejection();
      }
    } finally {
      setPending(false);
    }
  };

  const startOAuth = async (provider: "google" | "github") => {
    setPending(true);
    setError(null);
    try {
      const result = await signIn(provider, { redirectTo });
      if (!result.signingIn && !result.redirect) {
        setError(`Couldn't start ${provider === "google" ? "Google" : "GitHub"} sign-in. Try again.`);
      }
    } catch (err) {
      console.error("OAuth error:", err);
      setError(classifySignInError(err) === "network" ? MESSAGES.network : `Couldn't start ${provider === "google" ? "Google" : "GitHub"} sign-in. Try again.`);
    } finally {
      setPending(false);
    }
  };

  return (
    <Card className="w-full max-w-md border border-white/10 shadow-2xl bg-black/40 backdrop-blur-sm">
      <CardHeader className="relative space-y-1 pb-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/5 transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground hover:text-white" />
        </button>
        <div className="flex items-center justify-center mb-2">
          <Logo className="h-8" />
        </div>
        <CardTitle className="text-xl font-semibold text-center">Create an account</CardTitle>
        <CardDescription className="text-center text-sm text-muted-foreground">
          Enter your details to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 p-3 text-sm text-red-500/90 bg-red-500/10 rounded-lg border border-red-500/20"
          >
            <TriangleAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </motion.div>
        )}

        <form onSubmit={signUpByEmail} className="space-y-3">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Full name"
              value={account.name}
              onChange={(e) => setAccount({ ...account, name: e.target.value })}
              className="h-10 text-sm bg-white/5 border-white/10 focus:border-[#fcba28]/50 focus:ring-[#fcba28]/30 transition-all duration-300"
            />
            <Input
              type="email"
              placeholder="Email address"
              value={account.email}
              onChange={(e) => setAccount({ ...account, email: e.target.value })}
              className="h-10 text-sm bg-white/5 border-white/10 focus:border-[#fcba28]/50 focus:ring-[#fcba28]/30 transition-all duration-300"
            />
            <Input
              type="password"
              placeholder="Password"
              value={account.password}
              onChange={(e) => setAccount({ ...account, password: e.target.value })}
              className="h-10 text-sm bg-white/5 border-white/10 focus:border-[#fcba28]/50 focus:ring-[#fcba28]/30 transition-all duration-300"
            />
            <Input
              type="password"
              placeholder="Confirm password"
              value={account.confirmPassword}
              onChange={(e) => setAccount({ ...account, confirmPassword: e.target.value })}
              className="h-10 text-sm bg-white/5 border-white/10 focus:border-[#fcba28]/50 focus:ring-[#fcba28]/30 transition-all duration-300"
            />
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="w-full h-10 text-sm bg-[#fcba28] hover:bg-[#fcba28]/90 text-background font-medium transition-all duration-300"
          >
            {pending ? "Creating account..." : "Create account"}
          </Button>
        </form>

        {OAUTH_PROVIDERS.length > 0 && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-background text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className={OAUTH_PROVIDERS.length === 2 ? "grid grid-cols-2 gap-3" : "grid gap-3"}>
              {OAUTH_PROVIDERS.includes("google") && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => startOAuth("google")}
                  disabled={pending}
                  className="h-10 text-sm bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <FcGoogle className="h-4 w-4 mr-2" />
                  Google
                </Button>
              )}
              {OAUTH_PROVIDERS.includes("github") && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => startOAuth("github")}
                  disabled={pending}
                  className="h-10 text-sm bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <FaGithub className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
              )}
            </div>
          </>
        )}

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setState("signIn")}
              className="text-[#fcba28] hover:text-[#fcba28]/80 font-medium transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};