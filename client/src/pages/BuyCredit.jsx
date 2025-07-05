import React, { useContext } from 'react'
import { assets, plans } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
const BuyCredit = () => {
  const {user, setShowLogin, backendURL, loadUserCredit, token, } = useContext(AppContext);
  const navigate = useNavigate();
  const initPay = async (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
      amount: order.amount, // Amount is in currency subunits. Default currency is INR.
      currency: order.currency,
      name: "Credits Payment",
      description: "Purchase Credits",
      order_id: order.id, //This is a sample Order ID. Replace with the actual Order ID.
      receipt : order.receipt,
      handler: async (response) => {
        try {
          const {data} = await axios.post(backendURL + '/api/user/verify-razor', response, {headers: {token}})
          if(data.success){
            loadUserCredit(); // Reload user credit after successful payment
            navigate('/');
            toast.success("Payment successful! Credits added to your account.");
          }
        } catch (error) {
          console.error("Payment handler error:", error.message);
          toast.error("Payment failed. Please try again.");
        }
      },
    }
    const razorpay = new window.Razorpay(options);
    razorpay.open();

  }

  const paymentRazorpay = async (planId) => {
    try {
      if(!user){
        setShowLogin(true);
        return;
      }

      const {data} = await axios.post(backendURL + '/api/user/pay-razor', {planId}, {headers: {token}});
      if(data.success){
        initPay(data.order);
      }
    } catch (error) {
      toast.error("Error processing payment:", error);
    }
  }
  
  return (
    <motion.div  className="min-h-[80vh] text-center pt-14 mb-10"
    initial={{opacity:0.2, y:100}}
    transition={{duration:1}}
    whileInView={{opacity:1, y:0}}
    viewport={{once:true}}
    >
      <button className="border border-gray-400 px-10 py-2 rounded-full mb-6">
        Our Plans
      </button>
      <h1 className="text-center text-4xl font-medium mb-6 sm:mb-10">
        Choose the plan
      </h1>
      <div className="flex flex-wrap justify-center gap-6 text-left">
        {plans.map((item, index) => (
          <div
            key={index}
            className="bg-white drop-shadow-sm border rounded-lg py-12 px-8 text-gray-600 hover:scale-105 transition-all duration-500"
          >
            <img width={40} src={assets.logo_icon} />
            <p className="mt-3 mb-1 font-semibold">{item.id}</p>
            <p className="text-sm">{item.desc}</p>
            <p className="mt-6">
              <span className="text-3xl font-medium">Rs. {item.price}</span> /{" "}
              {item.credits} credits
            </p>
            <button
              onClick={() => paymentRazorpay(item.id)}
              className="w-full bg-gray-800 text-white mt-8 text-sm rounded-md py-2.5 min-w-52"
            >
              {user ? "Purchase" : "Get Started"}
            </button>
          </div>
        ))}
      </div>
      </motion.div>
  )
}

export default BuyCredit