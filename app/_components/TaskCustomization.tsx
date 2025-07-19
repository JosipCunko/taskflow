import type { RefAttributes, ForwardRefExoticComponent, Dispatch } from "react";
import type { LucideProps } from "lucide-react";

import ColorPicker from "./ColorPicker";
import IconPicker from "./IconPicker";
import Button from "./reusable/Button";
import { type Action } from "./AddTask";

const TaskCustomization = ({
  state,
  dispatch,
  onCloseTab,
}: {
  state: {
    selectedColor: string;
    selectedIcon: ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
  };
  dispatch: Dispatch<Action>;
  onCloseTab?: () => void;
}) => {
  const handleDone = () => {
    onCloseTab?.();
  };

  return (
    <div className="flex flex-col gap-5 justify-between items-center">
      <ColorPicker selectedColor={state.selectedColor} dispatch={dispatch} />
      <IconPicker selectedIcon={state.selectedIcon} dispatch={dispatch} />

      <Button onClick={handleDone}>Done</Button>
    </div>
  );
};
export default TaskCustomization;
