import toast from "react-hot-toast";
import Button from "../_components/reusable/Button";
import { CheckCircle2, CircleX, Info, TriangleAlert } from "lucide-react";

export function customToast(type, message) {
  const color =
    type === "Error"
      ? "text-error"
      : type === "Success"
      ? "text-success"
      : type === "Warning"
      ? "text-warning"
      : "text-info";

  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-background-600 shadow-xl rounded-lg pointer-events-auto flex ring-1 ring-background-500 ring-opacity-20 backdrop-blur-sm border border-background-500/30`}
        style={{
          border: `1px solid ${
            type === "Error"
              ? "var(--color-error)"
              : type === "Success"
              ? "var(--color-success)"
              : "transparent"
          } `,
        }}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex h-full">
            <div className=" flex-shrink-0 grid place-items-center transition-transform duration-200 hover:scale-110">
              {type === "Success" && (
                <CheckCircle2 className={`w-4 h-4 ${color}`} />
              )}
              {type === "Error" && <CircleX className={`w-4 h-4 ${color}`} />}
              {type === "Warning" && (
                <TriangleAlert className={`w-4 h-4 ${color}`} />
              )}
              {type === "Info" && <Info className={`w-4 h-4 ${color}`} />}
            </div>
            <div className="ml-3 flex-1">
              <p className={`text-sm font-medium ${color}`}>{type}</p>
              <p className="mt-1 text-sm text-text-gray">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center pr-2">
          <Button
            variant="secondary"
            onClick={() => toast.dismiss(t.id)}
            className="text-xs px-3 py-1.5 transition-all duration-200 hover:scale-105 hover:bg-background-500/50"
          >
            Close
          </Button>
        </div>
      </div>
    ),
    {
      duration: 5000,
    }
  );
}
