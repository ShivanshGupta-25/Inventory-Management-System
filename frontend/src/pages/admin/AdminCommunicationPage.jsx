import CommunicationLayout from "../../components/Communication/CommunicationLayout";
import { CommunicationProvider } from "../../context/CommunicationContext";

const AdminCommunicationPage = () => {
  return (
    <CommunicationProvider>
      <div className="h-full min-h-0 overflow-hidden bg-slate-50">
        <main className="h-full min-h-0 overflow-hidden">
          <CommunicationLayout />
        </main>
      </div>
    </CommunicationProvider>
  );
};

export default AdminCommunicationPage;