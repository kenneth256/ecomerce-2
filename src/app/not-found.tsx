import Image from "next/image";
import Link from "next/link";
import React from "react";

const notfound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white">
      <Image
        src="/notfound.jpg"
        alt="Not Found"
        width={300}
        height={300}
        className="absolute top-0 left-0 w-full h-full object-cover"
        quality={100}
      />
      <div className="relative z-10  bg-opacity-90 p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          404 - Page Not Found
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default notfound;
