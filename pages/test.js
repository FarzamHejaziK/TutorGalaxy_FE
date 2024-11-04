import React, { useEffect, useState, useRef } from "react";

const para =
  "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).";

export default function Test() {
  const containerRef = useRef(null);

  const [paras, setParas] = useState(
    [0, 1, 2, 3, 4, 5, 6, 7, 9, 10].map((x, i) => `${i}---- ${para}`)
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      const scrollHeightBefore = containerRef.current.scrollHeight;
      setParas((pa) => [`${pa.length + 1}---- ${para}`, ...pa]);
      setTimeout(() => {
        const scrollHeightAfter = containerRef.current.scrollHeight;
        console.log(scrollHeightBefore, scrollHeightAfter);

        window.scrollBy(0, scrollHeightAfter - scrollHeightBefore);
      }, 200);
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);
  return (
    <div ref={containerRef}>
      {paras.map((item, i) => (
        <p>{item}</p>
      ))}
    </div>
  );
}
