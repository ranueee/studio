import type { SVGProps } from 'react';

export function VictionLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 128 35"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className="text-foreground"
      {...props}
    >
      <path d="M15.44 3.6h5.88L28.1 23.36V3.6h5.2v30h-5.4L21 14.04V33.6h-5.2v-30Z" />
      <path d="M42.22 3.6h5.84v30h-5.84v-30Z" />
      <path d="M57.94 3.6c8.48 0 13.48 5.6 13.48 15s-5 15-13.48 15h-5.84v-30h5.84Zm0 24.64c5.24 0 7.72-3.32 7.72-9.64s-2.48-9.68-7.72-9.68h-.12v19.32h.12Z" />
      <path d="M96.48 3.6c5.52 0 8.76 2.04 10.6 5.84l-4.96 2.6c-1-2.2-2.6-3.12-5.4-3.12-3.8 0-6.64 2.88-6.64 7.64v1.08h13.48v3.48c0 5.6-3.24 9.12-8.56 9.12-5.2 0-9.12-3.8-9.12-9.6 0-6.2 3.84-9.96 9.2-9.96Zm-1.44 14.64c3.4 0 5.48-2.12 5.8-4.96H90.2c.44 3.2 2.6 4.96 4.84 4.96Z" />
      <path d="M110.19 3.6h5.84v30h-5.84v-30Z" />
      <path d="M117.51 3.6h10.4v4.68h-4.56v25.32h-5.84V8.28h-4.56V3.6Z" />
    </svg>
  );
}
