import FilePicker from "@/components/FilePicker";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[700px] border-2 border-neutral-200 flex flex-col overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 h-full border-r border-gray-200">
            <Sidebar />
          </div>
          <div className="flex-1">
            <FilePicker />
          </div>
        </div>
      </div>
    </div>
  );
}
