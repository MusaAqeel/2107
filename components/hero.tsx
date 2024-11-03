import Link from "next/link";

export default function Hero() {
  return (
    <div className="flex flex-col gap-16 items-center">
      <div className="flex gap-8 justify-center items-center">
        <Link href="https://github.com/MusaAqeel/2107-stealth" className="font-semibold">
          Mixify - Your AI DJ
        </Link>
      </div>
      <h1 className="sr-only">Mixify - Your AI DJ</h1>
      <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
        Experience personalized music with Mixify, your AI DJ
      </p>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
