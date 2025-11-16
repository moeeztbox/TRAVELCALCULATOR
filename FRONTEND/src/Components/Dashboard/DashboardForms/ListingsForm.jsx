import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import HotelListCard from "./ListingsFormCards/HotelListCard";
import TransportListCard from "./ListingsFormCards/TransportListCard";
import VisaListCard from "./ListingsFormCards/VisaListCard";
import TicketListCard from "./ListingsFormCards/TicketListCard";

const ListingsForm = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
      {/* BACK BUTTON */}
      <button
        onClick={handleBack}
        className="flex cursor-pointer items-center gap-2 text-gray-700 hover:text-black mb-6"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back</span>
      </button>

      <h1 className="text-3xl font-extrabold text-gray-900">Listings</h1>
      <p className="text-gray-600 mt-2 mb-10">
        View and manage all service listings
      </p>

      {/* CARDS GRID */}
      <div
        className="
          grid 
          grid-cols-1 
          sm:grid-cols-2 
          md:grid-cols-2 
          lg:grid-cols-2 
          gap-8
        "
      >
        <HotelListCard />
        <TransportListCard />
        <VisaListCard />
        <TicketListCard />
      </div>
    </div>
  );
};

export default ListingsForm;
