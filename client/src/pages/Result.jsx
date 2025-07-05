import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { motion } from 'motion/react';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const Result = () => {
  const [image, setImage] = useState(assets.sample_img_1);
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [isImageLoaded, setImageLoaded] = useState(false)
  
  const {generateImage} = useContext(AppContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    if(input){
      const image = await generateImage(input);
      if(image){
        setImage(image);
        setImageLoaded(true);
      }
    }
    setLoading(false);
    setInput("");
  }
  return (
    <motion.form onSubmit={onSubmitHandler} className='flex flex-col min-h-[90vh] justify-center items-center'
    initial={{opacity:0.2, y:100}}
    transition={{duration:1}}
    whileInView={{opacity:1, y:0}}
    viewport={{once:true}}
    >
    <div>
      <div className='relative'>
          <img src={image || assets.sample_img_1} className='max-w-sm rounded' alt="" />
          <span className={`absolute bottom-0 left-0 h-1 bg-blue-500 ${loading? 'w-full transition-all duration-[10s]' : 'w-0'}`}></span>
      </div>       
      <p className={!loading? 'hidden' : ''}>Loading...</p>
    </div>
  { !isImageLoaded &&
    <div className='
    flex w-full max-w-xl bg-neutral-500 text-white text-sm p-0.5 mt-10 rounded-full 
    '>
      <input type="text" value={input} onChange={(e)=> setInput(e.target.value)} placeholder='Describe what ypu want to generate' className='flex-1 bg-transparent outline-none ml-8 max-sm:w-20 placeholder-color' />
      <button type='submit' className='bg-zinc-900 px-10 sm:px-16 py-3 rounded-full'>Generate</button>
    </div>}

    {isImageLoaded && <div className='flex flex-wrap gap-2 justify-center text-white text-sm p-0.5 mt-10 rounded-full'>
      <p onClick={()=> setImageLoaded(false)} className='bg-transparent border border-zinc-900 text-black px-8 py-3 rounded-full cursor-pointer'>Generate Another</p>
      <a href={image} download className='bg-zinc-900 px-10 py-3 rounded-full cursor-pointer' >Download</a>
    </div>}
    </motion.form>
  )
}

export default Result