import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { navSearchItems } from "../utils";

export function useKeyboardNavigation() {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Only trigger if Ctrl is pressed
      if (event.ctrlKey) {
        const key = event.key.toUpperCase();

        const matchingItem = navSearchItems.find(
          (item) => item.command[1] === key
        );

        if (matchingItem) {
          event.preventDefault(); // Prevent default browser shortcuts
          router.push(matchingItem.link);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);
}
