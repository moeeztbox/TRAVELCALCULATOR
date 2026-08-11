import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PackageCheck } from "lucide-react";
import PageHeader from "../Components/UI/PageHeader";
import NormalPackage from "../Components/CustomizePackage/NormalPackage";
import ExplanatoryPackage from "../Components/CustomizePackage/ExplanatoryPackage";

const TABS = [
  { key: "explanatory", label: "Explanatory Package" },
  { key: "normal", label: "Normal Package" },
];

const CustomizePackage = () => {
  const navigate = useNavigate();
  const { tab } = useParams();
  // The URL is the single source of truth for which package type is active
  // (the sidebar's Normal/Explanatory submenu links here directly), so an
  // unrecognized/missing segment just falls back to Normal.
  const activeTab = tab === "explanatory" ? "explanatory" : "normal";

  return (
    <div className="p-4 w-full">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-6 no-print">
          <PageHeader
            title="Customize Package"
            subtitle="Build your own package from available listings"
            icon={PackageCheck}
            onBack={() => navigate("/dashboard")}
          />
        </div>

        {/* PACKAGE TYPE SELECTOR */}
        <div className="mb-6 no-print">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-surface-2 border border-hair">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => navigate(`/dashboard/customize-package/${t.key}`)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                  activeTab === t.key
                    ? "bg-brand-600 text-white shadow-brand"
                    : "text-muted hover:bg-surface hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "normal" ? <NormalPackage /> : <ExplanatoryPackage />}
      </div>
    </div>
  );
};

export default CustomizePackage;
