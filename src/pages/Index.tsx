import { useState } from "react";
import LandingPage from "@/components/LandingPage";
import LeadQualificationForm from "@/components/LeadQualificationForm";

const Index = () => {
  const [showForm, setShowForm] = useState(() => {
    return !sessionStorage.getItem("planest_lead_done");
  });

  const handleComplete = () => {
    sessionStorage.setItem("planest_lead_done", "1");
    setShowForm(false);
  };

  if (showForm) {
    return <LeadQualificationForm onComplete={handleComplete} />;
  }

  return <LandingPage />;
};

export default Index;
