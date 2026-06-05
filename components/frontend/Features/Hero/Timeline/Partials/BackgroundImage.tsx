'use client'
import Image from 'next/image'

function BackgroundImage() {
  return (
    <div className="absolute top-0 left-0 z-0 w-full h-full bg-black opacity-20">
      <Image
        src="/assets/img/heros/view1.webp"
        fill
        className="object-cover"
        alt="Hero Background"
        sizes="100vw"
      />
    </div>
  )
}

export default BackgroundImage
