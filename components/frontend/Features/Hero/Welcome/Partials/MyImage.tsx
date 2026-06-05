import Image from 'next/image'

const SPADES_SRC = '/assets/svg/spades.svg'

function SpadeIcon({ size }: { size: 8 | 16 }) {
  const px = size === 8 ? 32 : 64
  return (
    <Image
      src={SPADES_SRC}
      alt=""
      width={px}
      height={px}
      className={`h-${size} w-${size} transition`}
      aria-hidden="true"
    />
  )
}

const MyImage = () => {
  return (
    <div className="relative flex-none hidden sm:block group">
      <div className="shadow-2xl max-w-24 sm:max-w-48 md:max-w-64 transition duration-500 transform group-hover:rotate-y-180 bg-primary">
        <Image
          src="/assets/img/kuraykaraaslan.jpg"
          alt="kuray karaaslan"
          width={256}
          height={256}
          priority
          className="transition duration-500 transform w-full h-auto"
          sizes="(max-width: 640px) 6rem, (max-width: 768px) 12rem, 16rem"
        />
      </div>
      <div className="absolute top-0 shadow-2xl max-w-24 sm:max-w-48 md:max-w-64 transition duration-500 transform rotate-y-180 group-hover:rotate-y-0 bg-primary w-full h-full opacity-0 group-hover:opacity-100">
        <div className="relative w-full h-full flex flex-col">
          <div className="fixed flex flex-col uppercase left-2 top-2">
            <span className="text-2xl font-bold text-black ml-[0.4rem]">A</span>
            <SpadeIcon size={8} />
          </div>
          <div className="fixed flex flex-col uppercase mt-2 ml-2 right-2 bottom-2 transform rotate-180">
            <span className="text-2xl font-bold text-black ml-[0.4rem]">A</span>
            <SpadeIcon size={8} />
          </div>
          <div className="relative flex flex-col items-center justify-center w-full h-full">
            <SpadeIcon size={16} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyImage
