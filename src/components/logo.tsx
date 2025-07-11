import type { SVGProps } from "react";
import { LeafIcon } from "@/components/icons/leaf-icon";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center justify-center text-4xl font-bold font-headline text-white" {...props}>
      <LeafIcon className="w-10 h-10 mr-2 text-primary" />
      <span>EcoLakbay</span>
    </div>
  );
}
