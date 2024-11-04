import React from "react";

const Loader = ({ color }) => {
  return (
    <>
      <span class='loader'></span>

      <style>
        {`
        .loader {
          width: 28px;
          height: 28px;
          border: 3px solid ${color};
          border-radius: 50%;
          display: inline-block;
          position: relative;
          box-sizing: border-box;
          animation: rotation 1s linear infinite;
          }
          .loader::after {
          content: '';
          box-sizing: border-box;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 46px;
          height: 46px;
          border-radius: 50%;
          border: 3px solid;
          border-color: ${color} transparent;
          }
          
          @keyframes rotation {
          0% {
          transform: rotate(0deg);
          }
          100% {
          transform: rotate(360deg);
          }
          }
          
        `}
      </style>
    </>
  );
};

export default Loader;