import Enquiry from "@/components/Enquiry";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import Plate from "@/components/Plate";
import Questions from "@/components/Questions";
import Record from "@/components/Record";
import Standing from "@/components/Standing";
import Tiers from "@/components/Tiers";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Plate />
        <Record />
        <Tiers />
        <Standing />
        <Questions />
        <Enquiry />
      </main>
      <Footer />
    </>
  );
}
