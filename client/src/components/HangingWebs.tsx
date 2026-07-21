import Image from "next/image";

export function HangingWebs() {
  return (
    <div className="absolute top-0 left-0 right-0 h-[100vh] overflow-hidden pointer-events-none select-none z-0">
      <div className="absolute inset-0" style={{ transform: 'translateY(-20%)' }}>
        <Image
          src="/web.png"
          alt="Spider webs"
          fill
          className="object-contain object-top opacity-50 mix-blend-screen md:object-cover"
          priority
        />
      </div>
    </div>
  );
}
