"use client";
import Link from "next/link";
import { useState, FormEvent, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Button from "../_components/reusable/Button";
import Input from "../_components/reusable/Input";
import { User } from "lucide-react";
import {
  signInWithGoogle,
  signInWithEmailAndPasswordFirebase,
  signUpWithEmailAndPasswordFirebase,
} from "../_lib/auth-client";
import Loader from "../_components/Loader";
import { useRouter } from "next/navigation";
import PasswordGenerator from "../_components/PasswordGenerator";
import { Tooltip } from "react-tooltip";
import AnimatedBackground from "../_components/animations/AnimatedBackground";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/webapp");
    }
  }, [status, router]);

  if (status === "loading") return <Loader label="Loading session..." />;
  if (status === "authenticated") {
    return <Loader label="Redirecting to webapp..." />;
  }
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          setError("Display name is required for sign up.");
          setIsLoading(false);
          return;
        }
        await signUpWithEmailAndPasswordFirebase(email, password, displayName);
      } else {
        await signInWithEmailAndPasswordFirebase(email, password);
      }
    } catch (errUnknown: unknown) {
      const err = errUnknown as { code?: string; message?: string };
      let errorMessage = "An unknown error occurred.";
      if (err.message) {
        errorMessage = err.message;
      }
      if (err.code) {
        switch (err.code) {
          case "auth/user-not-found":
          case "auth/invalid-credential":
            errorMessage = "Invalid email or password. Please try again.";
            break;
          case "auth/wrong-password":
            errorMessage = "Incorrect password. Please try again.";
            break;
          case "auth/email-already-in-use":
            errorMessage = "This email is already in use. Try signing in.";
            break;
          case "auth/weak-password":
            errorMessage =
              "Password is too weak. It should be at least 6 characters.";
            break;
          default:
            if (!err.message)
              errorMessage = `Error: ${err.code || "authentication failed"}`;
            break;
        }
      }
      setError(errorMessage);
      console.error("Authentication error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("github", { callbackUrl: "/webapp" });
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to sign in with GitHub.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background-600">
      <div className="w-full md:w-1/2 flex flex-col p-8">
        <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
          <motion.h1
            className="text-2xl font-bold text-primary-500 mb-1"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {isSignUp ? "Create an Account" : "Welcome back"}
          </motion.h1>
          <motion.p
            className="text-text-low text-sm mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {isSignUp
              ? "Fill in the details to create your account"
              : "Sign in to your account"}
          </motion.p>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {isSignUp && (
              <Input
                type="text"
                id="displayName"
                name="displayName"
                placeholder="Username"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required={isSignUp}
                className="w-full"
              />
            )}
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
            <div className="relative tooltip-container">
              <Input
                type="text"
                id="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
              {isSignUp && (
                <PasswordGenerator
                  setCurrentPassword={setPassword}
                  length={12}
                  customClassName="absolute top-2 right-2"
                />
              )}
              <Tooltip
                id="password-generator"
                place="top"
                className="tooltip-diff-arrow"
                classNameArrow="tooltip-arrow"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 bg-background-600 p-2 rounded">
                {error}
              </p>
            )}
            {successMessage && (
              <p className="text-sm text-green-700 bg-green-100 border border-green-300 p-2 rounded">
                {successMessage}
              </p>
            )}
            <Button
              type="submit"
              variant="primary"
              className="w-full flex items-center justify-center py-2.5"
              disabled={isLoading}
            >
              {isLoading && !isSignUp && !error
                ? "Signing In..."
                : isLoading && isSignUp && !error
                ? "Creating Account..."
                : isSignUp
                ? "Create Account"
                : "Sign In"}
            </Button>
          </motion.form>

          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-background-500"></div>
            <span className="mx-4 text-xs text-text-low uppercase">
              Or continue with
            </span>
            <div className="flex-grow border-t border-background-500"></div>
          </div>

          <Button
            variant="secondary"
            className="flex items-center justify-center border border-background-500 rounded py-2 px-4 mb-4 text-text-high hover:bg-background-500 transition-colors w-full"
            onClick={handleGitHubSignIn}
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="24"
              height="24"
              viewBox="0 0 50 50"
            >
              <path d="M17.791,46.836C18.502,46.53,19,45.823,19,45v-5.4c0-0.197,0.016-0.402,0.041-0.61C19.027,38.994,19.014,38.997,19,39 c0,0-3,0-3.6,0c-1.5,0-2.8-0.6-3.4-1.8c-0.7-1.3-1-3.5-2.8-4.7C8.9,32.3,9.1,32,9.7,32c0.6,0.1,1.9,0.9,2.7,2c0.9,1.1,1.8,2,3.4,2 c2.487,0,3.82-0.125,4.622-0.555C21.356,34.056,22.649,33,24,33v-0.025c-5.668-0.182-9.289-2.066-10.975-4.975 c-3.665,0.042-6.856,0.405-8.677,0.707c-0.058-0.327-0.108-0.656-0.151-0.987c1.797-0.296,4.843-0.647,8.345-0.714 c-0.112-0.276-0.209-0.559-0.291-0.849c-3.511-0.178-6.541-0.039-8.187,0.097c-0.02-0.332-0.047-0.663-0.051-0.999 c1.649-0.135,4.597-0.27,8.018-0.111c-0.079-0.5-0.13-1.011-0.13-1.543c0-1.7,0.6-3.5,1.7-5c-0.5-1.7-1.2-5.3,0.2-6.6 c2.7,0,4.6,1.3,5.5,2.1C21,13.4,22.9,13,25,13s4,0.4,5.6,1.1c0.9-0.8,2.8-2.1,5.5-2.1c1.5,1.4,0.7,5,0.2,6.6c1.1,1.5,1.7,3.2,1.6,5 c0,0.484-0.045,0.951-0.11,1.409c3.499-0.172,6.527-0.034,8.204,0.102c-0.002,0.337-0.033,0.666-0.051,0.999 c-1.671-0.138-4.775-0.28-8.359-0.089c-0.089,0.336-0.197,0.663-0.325,0.98c3.546,0.046,6.665,0.389,8.548,0.689 c-0.043,0.332-0.093,0.661-0.151,0.987c-1.912-0.306-5.171-0.664-8.879-0.682C35.112,30.873,31.557,32.75,26,32.969V33 c2.6,0,5,3.9,5,6.6V45c0,0.823,0.498,1.53,1.209,1.836C41.37,43.804,48,35.164,48,25C48,12.318,37.683,2,25,2S2,12.318,2,25 C2,35.164,8.63,43.804,17.791,46.836z"></path>
            </svg>
            Continue with GitHub
          </Button>

          <Button
            variant="secondary"
            className="flex items-center justify-center border border-background-500 rounded py-2 px-4 mb-4 text-text-high hover:bg-background-500 transition-colors w-full"
            onClick={async () => {
              setIsLoading(true);
              setError(null);
              try {
                await signInWithGoogle();
              } catch (errUnknown: unknown) {
                const googleError = errUnknown as {
                  message?: string;
                  code?: string;
                };
                let errorMessage = "Failed to sign in with Google.";
                if (googleError.message) {
                  errorMessage = googleError.message;
                }
                if (googleError.code === "auth/popup-closed-by-user") {
                  errorMessage = "Sign-in process cancelled.";
                }
                setError(errorMessage);
                console.error("Google Sign-In error:", googleError);
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="24"
              height="24"
              viewBox="0 0 48 48"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              ></path>
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              ></path>
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
            </svg>
            <span className="ml-2">Continue with Google</span>
          </Button>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccessMessage(null);
                setPassword("");
                setEmail("");
              }}
              className="text-sm text-primary-500 hover:underline"
            >
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="https://mail.google.com/mail/u/0/#inbox?compose=GTvVlcSBmlxplnNQddBtBVZtqsdsWbWLKmLbtjTBPQfpgjwrQNldzkbMXXWrXdScSHsmmJMMCgKsq"
              className="text-text-low text-sm"
            >
              Having troubles when signing in?{" "}
              <span className="underline text-primary-500 cursor-pointer">
                Contact me
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden md:flex md:w-1/2 bg-background-700 items-center justify-center p-8 relative overflow-hidden">
        <AnimatedBackground />

        <div className="max-w-md relative z-10">
          <motion.p
            className="text-xl text-text-low mb-6 italic"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Taskflow team is doing some awesome stuff, with a focus on
            productivity, seamless collaboration, and efficient task management.
            Organize your work, track progress, and manage tasks effortlessly
            with intuitive tools designed for teams.
          </motion.p>
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="w-10 h-10 bg-background-500 rounded-full flex items-center justify-center mr-3">
              <User color="#cbd5e1" />
            </div>
            <span className="text-text-low">Josip Čunko </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
