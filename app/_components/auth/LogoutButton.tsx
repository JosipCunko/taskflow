"use client";

import { signOut } from "@/app/_lib/auth-client";
import Button from "../reusable/Button";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <Button onClick={signOut} variant="danger" className="mt-6 mx-auto">
      <LogOut size={18} />
      <span>Sign Out</span>
    </Button>
  );
}
