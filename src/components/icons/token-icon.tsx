import type { SVGProps } from 'react';

export function TokenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="12" cy="12" r="10" fill="hsl(var(--primary))"/>
      <path d="M11 20A7 7 0 0 1 4 13V7a1.001 1.001 0 0 1 1.414-.914l2.122 1.226A6 6 0 0 0 12 12v8Z" fill="hsl(var(--primary-foreground))" fillOpacity="0.7"/>
      <path d="M12 20V12a6 6 0 0 1 4.464-5.688l2.122-1.226A1 1 0 0 1 20 6v7a7 7 0 0 1-8 7Z" fill="hsl(var(--primary-foreground))"/>
    </svg>
  );
}
