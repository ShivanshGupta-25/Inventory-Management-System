import CommunicationLayout from "../../components/Communication/CommunicationLayout";
import { CommunicationProvider } from "../../context/CommunicationContext";

const CommunicationPage = () => {
  return (
    <CommunicationProvider>
      <div className="min-h-screen w-full bg-slate-50">
        <CommunicationLayout />
      </div>
    </CommunicationProvider>
  );
};

export default CommunicationPage;