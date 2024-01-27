'use client';
import React, { useState, ReactNode, useEffect } from 'react';

interface SingleSlideProps {
    htmlDOM: ReactNode;
}

interface CarouselProps {
    children?: ReactNode[];
}

const Carousel = ({ children }: CarouselProps) => {
    const [active, setActive] = useState(0);
    const carouselRef = React.createRef<HTMLDivElement>();

    const buttonClass = "btn btn-circle border-1 border-gray-500 hover:bg-white hover:text-black active:bg-white active:text-black bg-opacity-20 sm:bg-opacity-0 hidden sm:flex shadow-lg border border-base-200";
    const mobileButtonClass = "btn rounded-full dark:text-black dark:hover:text-white sm:hidden rounded-full -py-2 w-10 h-10  shadow-lg border border-base-200";



    useEffect(() => {
        let carouselItems = carouselRef.current?.querySelectorAll('.carousel-item');
        // make a timer that checks which slide is active and changes it
        const timer = setInterval(() => {
            //find the which hidden item located on screen
            
            for (let i = 0; i < (carouselItems?.length ?? 0); i++) {
                const element = carouselItems?.item(i);
                if (element?.getBoundingClientRect().left == 0) {
                    setActive(i);
                }
            }

        }
            , 5);

        return () => clearInterval(timer);

    } , []);

            


    return (
        <>
            <div className="carousel w-full min-h-screen -mt-24" style={{ top: '0', left: '0'}} ref={carouselRef}>
                {children?.map((child: any, index: number) => (
                    <>
                    <div id={`slide${index + 1}`} className="carousel-item relative w-full" key={index} onClick={() => setActive(index)} >
                        {child?.htmlDOM}
                        {index == 0 ? (
                            <a key={index} href={`#slide${children?.length || 0}`} className={buttonClass} style={{ zIndex: 100, position: 'absolute', top: '50%', left: '5', marginLeft: '30px' }}>&#10094;</a>
                        ) : (
                            <a key={index} href={`#slide${index}`} className={buttonClass} style={{ zIndex: 100, position: 'absolute', top: '50%', left: '5', marginLeft: '30px' }}>&#10094;</a>
                        )}
                        {index < children.length - 1 ? (
                            <a key={index} href={`#slide${index + 2}`} className={buttonClass} style={{ zIndex: 100, position: 'absolute', top: '50%', right: '0', marginRight: '30px' }}> &#10095;</a>
                        ) : (
                            <a key={index} href={`#slide1`} className={buttonClass} style={{ zIndex: 100, position: 'absolute', top: '50%', right: '0', marginRight: '30px' }}> &#10095;</a>
                        )}
                        

                    </div>
                    </>
                ))}
            </div>
            <div className="flex carousel-indicators gap-2" style={{ zIndex: 50, position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: '70px', height: '20px' }}>
                {children?.map((child: any, index: number) => (
                    <a
                        
                        className={(index === active ? `${mobileButtonClass} active bg-primary` : `${mobileButtonClass} bg-gray-300`) + ' rounded-full overflow-text'} style={{ height: '50px', width: '10px' }}
                        href={`#slide${index + 1}`}  onClick={() => setActive(index)}
                    >
                        <span>{index + 1}</span>
                    </a>
                ))}
            </div>

        </>
    );
};

export default Carousel;
