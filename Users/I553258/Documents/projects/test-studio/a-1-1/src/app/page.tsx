
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { generateImage } from '@/ai/flows/generate-image-flow';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.018,35.258,44,30.036,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

export default async function OnboardingPage() {
  let backgroundImageUrl = 'https://placehold.co/800x1200.png';
  let imageHint = 'philippines island';

  try {
    const result = await generateImage({ prompt: 'A serene, breathtaking ecotourism spot in the Philippines, perfect for a travel app background' });
    backgroundImageUrl = result.imageUrl;
    imageHint = 'philippines island landscape';
  } catch (error) {
    console.error("Failed to generate background image, using placeholder.", error);
    // The default placeholder will be used.
  }

  return (
    <main className="app-container !max-w-full">
      <div className="relative w-full h-full flex flex-col">
        <Image
          src={backgroundImageUrl}
          alt="A serene travel destination in the Philippines"
          layout="fill"
          objectFit="cover"
          className="z-0"
          data-ai-hint={imageHint}
          unoptimized // Required for data URIs from the AI flow
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10"></div>
        <div className="relative z-20 flex flex-col justify-end items-center h-full text-center p-8 text-white">
          <div className="flex-grow flex flex-col justify-center items-center">
            <Logo className="w-48 h-auto" />
            <p className="text-xl mt-2 font-headline">Explore. Earn. Protect.</p>
          </div>
          <div className="w-full max-w-sm space-y-3">
            <Button asChild className="w-full !text-black !bg-white hover:!bg-gray-200">
              <Link href="/map">
                <GoogleIcon className="mr-2" />
                Sign in with Google
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
