import React from "react";
import logo from '../assets/logo.jpg'

const Loading = () => {
  return (
    <div className="relative flex justify-center items-center w-screen h-screen gap-5">
      <div className="flex justify-center items-center">
        {/* <div className="absolute animate-spin rounded-md h-40 w-40 border-4  border-emerald-500"></div> */}
        <img
          src={logo}
          className="h-100 w-100"
        />
      </div>
      {/* <span className="text-2xl text-emerald-500">Loading...</span> */}
    </div>
  );
};

export default Loading;
