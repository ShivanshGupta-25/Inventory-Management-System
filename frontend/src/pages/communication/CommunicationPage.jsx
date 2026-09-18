import CommunicationLayout from "../../components/Communication/CommunicationLayout";
import {
  CommunicationProvider,
} from "../../context/CommunicationContext";

const CommunicationPage = () => {
  return (
    <CommunicationProvider>
      <div className="h-[calc(100vh-120px)] min-h-[600px]">
        <CommunicationLayout />
      </div>
    </CommunicationProvider>
  );
};

export default CommunicationPage;