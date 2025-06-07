import Button from "./reusable/Button";
import { RefreshCw } from "lucide-react";

export default function PasswordGenerator({
  setCurrentPassword,
  length = 12,
  customClassName = "",
}: {
  setCurrentPassword: (password: string) => void;
  length?: number;
  customClassName?: string;
}) {
  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let newPassword = "";

    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setCurrentPassword(newPassword);
  };

  return (
    <div
      data-tooltip-id="password-generator"
      data-tooltip-content="Generate a password"
      className={customClassName}
    >
      <Button onClick={generatePassword}>
        <RefreshCw size={18} />
      </Button>
    </div>
  );
}
