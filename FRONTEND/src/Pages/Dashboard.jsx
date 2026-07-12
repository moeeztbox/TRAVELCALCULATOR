import React from "react";
import HotelCard from "../Components/Dashboard/DashboardCards/HotelCard";
import VisaCard from "../Components/Dashboard/DashboardCards/VisaCard";
import TicketCard from "../Components/Dashboard/DashboardCards/TicketCard";
import TransportCard from "../Components/Dashboard/DashboardCards/TransportCard";
import PackageCard from "../Components/Dashboard/DashboardCards/PackageCard";
import PackagesViewCard from "../Components/Dashboard/DashboardCards/PackagesViewCard";
import ListingsCard from "../Components/Dashboard/DashboardCards/ListingsCard";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { displayName: username, isAdmin } = useAuth();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-4xl font-extrabold text-gray-900">
          {isAdmin ? "Admin Dashboard" : "User Dashboard"}
        </h1>

        <p className="text-gray-700 text-md font-medium mt-2 sm:mt-0">
          Logged in by: <span className="font-semibold">{username}</span>
        </p>
      </div>

      <p className="text-gray-500 mb-12 mt-2">
        Manage all your travel and services in one place
      </p>

      {/* GRID */}
      <div
        className="
          grid 
          grid-cols-1 
          sm:grid-cols-2 
          lg:grid-cols-3 
          xl:grid-cols-3 
          gap-8
        "
      >
        <HotelCard />
        <VisaCard />
        <TicketCard />
        <TransportCard />
        <PackagesViewCard />
        <PackageCard />
        <ListingsCard />
      </div>
    </div>
  );
};

export default Dashboard;
