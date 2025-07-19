"use client";

import { signOut } from "@/app/_lib/auth-client";
import Button from "../reusable/Button";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, []);

  return (
    <Button
      onClick={() => {
        setIsLoading(true);
        signOut();
      }}
      disabled={isLoading}
      variant="danger"
      className="mt-6 mx-auto"
    >
      <LogOut size={18} />
      <span>{isLoading ? "Signing Out..." : "Sign Out"}</span>
    </Button>
  );
}
