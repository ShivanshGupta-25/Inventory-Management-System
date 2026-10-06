import CommunicationLayout from "../../components/Communication/CommunicationLayout";
import { CommunicationProvider } from "../../context/CommunicationContext";

const AdminCommunicationPage = () => {
  return (
    <CommunicationProvider>
      <div
        className="
          flex
          h-[calc(100dvh-104px)]
          min-h-0
          w-full
          flex-col
          overflow-hidden

          sm:h-[calc(100dvh-112px)]
          lg:h-[calc(100dvh-120px)]
          xl:h-[calc(100dvh-128px)]
        "
      >
        <main className="min-h-0 flex-1 overflow-hidden">
          <CommunicationLayout />
        </main>
      </div>
    </CommunicationProvider>
  );
};

export default AdminCommunicationPage;