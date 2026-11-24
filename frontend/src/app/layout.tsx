import "./globals.css";
import TopUtilityBar from "@/components/TopUtilityBar";
import FaintingProtocolBanner from "@/components/FaintingProtocolBanner";

export const metadata = {
  title: "AeroTriage | Clinical Decision Support & Emergency Grid",
  description: "Enterprise CDSS & Hospital Routing Network with Fainting First Aid Protocol",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased selection:bg-sky-500/30 selection:text-sky-200">
        <div className="min-h-screen flex flex-col justify-between bg-transparent">
          <div>
            <TopUtilityBar />
            <div>{children}</div>
          </div>
          <FaintingProtocolBanner />
        </div>
      </body>
    </html>
  );
}