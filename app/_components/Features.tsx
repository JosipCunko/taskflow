import type { LucideProps } from "lucide-react";
import { FEATURES } from "../utils";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

function Features() {
  return (
    <section className="py-14">
      <div className="max-w-screen-xl mx-auto px-4 text-center text-text-low md:px-8">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-text-low text-3xl font-semibold sm:text-4xl">
            The most efficient task management app
          </h3>
        </div>
        <div className="mt-12">
          <ul className="grid gap-y-8 gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(
              (
                item: {
                  icon: ForwardRefExoticComponent<
                    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
                  >;
                  label: string;
                  description: string;
                },
                idx
              ) => (
                <li key={idx} className="space-y-3">
                  <div className="w-12 h-12 mx-auto bg-text-high text-primary-500 rounded-full flex items-center justify-center">
                    {<item.icon />}
                  </div>
                  <h4 className="text-lg text-text-low font-semibold">
                    {item.label}
                  </h4>
                  <p className="text-text-gray">{item.description}</p>
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
export default Features;
