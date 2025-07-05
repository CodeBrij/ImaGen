import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
    const { setShowLogin, backendURL, setToken, setUser } = useContext(AppContext);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [state, setState] = useState("Login");

    // prevent scrolling
    useEffect(()=>{
        document.body.style.overflow = 'hidden';

        return ()=>{
            document.body.style.overflow = 'hidden';
        }
    },[])

    const handleSubmit = async (e) => {
      e.preventDefault();
      console.log(backendURL);
      
      try {
        if(state === "Login"){
          const resp = await axios.post(backendURL + '/api/user/login', {
            email,
            password
          });
          console.log(resp.data);
          if(resp.data){
            // Login successful
            setToken(resp.data.token);
            setUser(resp.data.user);
            localStorage.setItem("token", resp.data.token);
            setShowLogin(false);
          } else {
            toast.error(resp.data.message || "Login failed");
          }
        } else {
          const resp = await axios.post(backendURL + '/api/user/register', {
            name,
            email,
            password
          });
          console.log(resp.data);
          if(resp.data){
            // Registration successful
            setToken(resp.data.token);
            setUser(resp.data.user);
            localStorage.setItem("token", resp.data.token);
            setShowLogin(false);
          } else {
            toast.error(resp.data.message || "Registration failed");
          }
        }
      } catch (error) {
        toast.error("An error occurred:"+error.message || "Something went wrong");
      }
    }

  return (
    <div className='fixed top-0 left-0 right-0 bottom-0 z-10 backdrop-blur-sm bg-black/30 flex justify-center items-center'
    >
      <motion.form onSubmit={handleSubmit} action="" className="relative bg-white p-10 rounded-xl text-slate-500"
      initial = {{opacity:0.2, y:100}}
    transition={{duration:0.3}}
    whileInView={{opacity:1, y:0}}
    viewport={{once:true}}
      >
        <h1 className="text-center text-neutral-700 text-2xl font-medium">
          {state}
        </h1>
        <p className="text-sm">Welcome back! Please sign up to continue</p>
        {state !== "Login" && (
          <div className="border px-5 py-2 flex items-center gap-1 rounded-full mt-5">
            <img className="w-5" src={assets.profile_icon} />
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              className="outline-none text-sm"
              type="text"
              placeholder="Full Name"
              required
            />
          </div>
        )}

        <div className="border px-5 py-2 flex items-center gap-2 rounded-full mt-4">
          <img src={assets.email_icon} />
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="outline-none text-sm"
            type="email"
            placeholder="Email id"
            required
          />
        </div>
        <div className="border px-5 py-2 flex items-center gap-2 rounded-full mt-4">
          <img src={assets.lock_icon} />
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className="outline-none text-sm"
            type="password"
            placeholder="Password"
            required
          />
        </div>
        <p className="text-sm text-blue-600 my-4 cursor-pointer">
          Forgot password?
        </p>
        <button type='submit' className="bg-blue-600 w-full text-white py-2 rounded-full">
          {state === "Login" ? "Login" : "Create Account"}
        </button>
        {state === "Login" ? (
          <p className="mt-5 text-center">
            Don't have an account?{" "}
            <span
              onClick={() => setState("Sign Up")}
              className="text-blue-600 cursor-pointer"
            >
              Sign up
            </span>
          </p>
        ) : (
          <p className="mt-5 text-center">
            Already have an account?{" "}
            <span
              onClick={() => setState("Login")}
              className="text-blue-600 cursor-pointer"
            >
              Login
            </span>
          </p>
        )}

        <img
          onClick={() => setShowLogin(false)}
          className="absolute top-5 right-5 cursor-pointer"
          src={assets.cross_icon}
        />
        </motion.form>
    </div>
  )
}

export default Login
