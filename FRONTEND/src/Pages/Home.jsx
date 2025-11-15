import React from "react";
import AdminCard from "../Components/Home/AdminCard";
import UserCard from "../Components/Home/UserCard";

const Home = () => {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center bg-linear-to-br from-gray-50 via-gray-100 to-gray-50 px-4 py-8 md:py-16">
      <div className="w-full max-w-6xl text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
          Welcome to Your Travel Hub
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-10">
          Choose your role to get started with your journey
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <UserCard />
          <AdminCard />
        </div>
      </div>
    </div>
  );
};

export default Home;
