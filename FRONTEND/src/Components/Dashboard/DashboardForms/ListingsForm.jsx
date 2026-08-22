import React from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Car, Stamp, Plane, Train, Package, ListChecks } from "lucide-react";
import PageHeader from "../../UI/PageHeader";
import ModuleCard from "../../UI/ModuleCard";

const LISTINGS = [
  { to: "/dashboard/listings/hotels", icon: Building2, title: "Hotels", description: "Manage hotel inventory & rates.", accent: "blue" },
  { to: "/dashboard/listings/transport", icon: Car, title: "Transport", description: "Vehicles, routes & trip pricing.", accent: "violet" },
  { to: "/dashboard/listings/visa", icon: Stamp, title: "Visa", description: "Visa categories & passenger costs.", accent: "green" },
  { to: "/dashboard/listings/tickets", icon: Plane, title: "Tickets", description: "Airlines, fares & validity.", accent: "sky" },
  { to: "/dashboard/listings/train", icon: Train, title: "Train", description: "Train routes, classes & fares.", accent: "indigo" },
  { to: "/dashboard/listings/packages", icon: Package, title: "Packages", description: "Hajj & Umrah package catalogue.", accent: "gold" },
];

const ListingsForm = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Listings"
        subtitle="Manage all your service inventory in one place"
        icon={ListChecks}
        onBack={() => navigate("/dashboard")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {LISTINGS.map((l) => (
          <ModuleCard key={l.to} {...l} />
        ))}
      </div>
    </div>
  );
};

export default ListingsForm;
