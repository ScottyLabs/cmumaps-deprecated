import React, { useState, useEffect, ReactElement } from 'react';
import Image from 'next/image'
import styles from '@/styles/QuickSearch.module.css';
import coffeeIcon from "/public/assets/icons/coffee.svg"
import toiletIcon from "/public/assets/icons/toilet.svg"
import fountainIcon from "/public/assets/icons/water.svg"
import foodIcon from "/public/assets/icons/forkknife.svg"

export interface QuickSearchProps {
  setQuery: (q:string)=>void,
}

/**
 * Displays the search results.
 */
export default function QuickSearch({
  setQuery
}: QuickSearchProps):ReactElement {
    return(
        <div className="w-[100%] h-[275px]">
            <div className="relative h-[275px]">
                <div className="absolute w-[100%] h-[275px] top-0 left-0 bg-[#8e8e8e] rounded-[20px]" />
                <p className="absolute w-[100%] top-[165px] left-[10px] [font-family:'Inter-Bold',Helvetica] font-bold text-white text-[16px] tracking-[0] leading-[normal]">
                    Events (as of now 3:00PM EST Sat Mar 23)
                </p>
                <div className="absolute w-[100%] h-[140px] top-[12px] left-[8px]">
                    <div className="absolute w-[100%] top-0 left-[2px] [font-family:'Inter-Bold',Helvetica] font-bold text-white text-[16px] tracking-[0] leading-[normal]">
                        Quick Search
                    </div>
                    <div className="absolute w-[95%] h-[110px] top-[30px] left-0 bg-[#b1b1b1] rounded-[9.71px]">
                        <div className="absolute w-[22%] h-[90px] top-[10px] left-[6px]" onClick={()=>setQuery("Restroom")}>
                            <div className="relative w-[100%] h-[90px] bg-[#e0e0e0] rounded-[9.29px]">
                                <p className="absolute w-[22%] top-[3px] left-[9px] [font-family:'Inter-Bold',Helvetica] font-normal text-[#545454] text-[13px] tracking-[0] leading-[normal]">
                                    <span className="font-bold">Restroom</span>
                                    <span className="[font-family:'Inter-Regular',Helvetica] text-[14.9px]">&nbsp;</span>
                                </p>
                                <div className="absolute w-[60px] h-[61px] top-[23px] left-[10px] bg-white rounded-[30.23px/30.25px]" />
                                <Image className="absolute w-[50%] h-[50hu] top-[32px] left-[20px] object-cover"
                                    alt="Toilet" 
                                    src={toiletIcon} width={100} height={100}>    
                                </Image>
                            </div>
                        </div>
                        <div className="absolute w-[22%] h-[90px] top-[10px] left-[94px]" onClick={()=>setQuery("Cafes")}>
                            <div className="relative w-[100%] h-[90px] bg-[#e0e0e0] rounded-[9.29px]">
                                <div className="absolute w-[22%] top-[3px] left-[9px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#545454] text-[13px] text-center tracking-[0] leading-[normal]">
                                    Coffee
                                </div>
                                <div className="absolute w-[60px] h-[61px] top-[23px] left-[10px] bg-white rounded-[30.23px/30.25px]" />
                                <Image className="absolute w-[58px] h-[58px] top-[23px] left-[12px] object-cover"
                                    alt="Coffee" 
                                    src={coffeeIcon} width={100} height={100}>    
                                </Image>
                            </div>
                        </div>
                        <div className="absolute w-[22%] h-[90px] top-[10px] left-[182px]" onClick={()=>setQuery("Dining")}>
                            <div className="relative w-[100%] h-[90px] bg-[#e0e0e0] rounded-[9.29px]">
                                <div className="absolute w-[22%] top-[3px] left-[9px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#545454] text-[13px] text-center tracking-[0] leading-[normal]">
                                    Food
                                </div>
                                <div className="absolute w-[60px] h-[61px] top-[23px] left-[10px] bg-white rounded-[30.23px/30.25px]" />
                                <Image className="absolute w-[32px] h-[46px] top-[30px] left-[24px] object-cover"
                                    alt="Food" 
                                    src={foodIcon} width={100} height={100}>    
                                </Image>
                            </div>
                        </div>
                        <div className="absolute w-[22%] h-[90px] top-[10px] left-[270px]" onClick={()=>setQuery("restroom")}>
                            <div className="relative w-[100%] h-[90px] bg-[#e0e0e0] rounded-[9.29px]">
                                <div className="absolute w-[22%] top-[3px] left-[9px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#545454] text-[13px] text-center tracking-[0] leading-[normal]">
                                    Fountain
                                </div>
                                <div className="absolute w-[60px] h-[61px] top-[23px] left-[10px] bg-white rounded-[30.23px/30.25px]" />
                                <Image className="absolute w-[42px] h-[42px] top-[33px] left-[20px] object-cover"
                                    alt="Fountain" 
                                    src={fountainIcon} width={100} height={100}>    
                                </Image>
                            </div>
                        </div>
                    </div>
                    <div className="absolute w-[95%] h-[69px] top-[180px] bg-[#b1b1b1] rounded-[9.82px]" />

                </div>

            </div>
        </div>
    );
};
        
