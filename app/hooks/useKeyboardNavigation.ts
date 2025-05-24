import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { navItemsToSearch } from "../utils";

export function useKeyboardNavigation() {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Only trigger if Ctrl is pressed
      if (event.ctrlKey) {
        const key = event.key.toUpperCase();

        const matchingItem = navItemsToSearch.find(
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
