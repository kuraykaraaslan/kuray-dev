import Image from 'next/image'

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
            <Image
              src="/assets/svg/spades.svg"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 transition"
              aria-hidden="true"
            />
          </div>
          <div className="fixed flex flex-col uppercase mt-2 ml-2 right-2 bottom-2 transform rotate-180">
            <span className="text-2xl font-bold text-black ml-[0.4rem]">A</span>
            <Image src="/assets/svg/spades.svg" alt="" width={32} height={32} className="h-8 w-8 transition" aria-hidden="true" />
          </div>

          <div className="relative flex flex-col items-center justify-center w-full h-full">
            <Image src="/assets/svg/spades.svg" alt="" width={64} height={64} className="h-16 w-16 transition" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyImage
