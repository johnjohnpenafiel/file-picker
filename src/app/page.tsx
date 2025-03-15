import FilePicker from "@/components/FilePicker";
import ConnectionInfo from "@/components/ConnectionInfo";
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-4xl font-bold">Vercel Deployment Test</h1>
      <ConnectionInfo />
      <FilePicker />
    </div>
  );
}
