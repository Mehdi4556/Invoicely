import { Button } from "./ui/button";
import { GoArrowUpRight } from "react-icons/go";

export default function Hero() {
  return (
    <section className="flex items-center justify-center px-8 py-32">
      <div className="max-w-[1100px] mx-auto text-center">
        <h1
          className="text-3xl md:text-6xl font-light
         text-foreground font-dm-sans mb-8 leading-tight"
        >
          Create Beautiful Invoices
          <br />
          <span className="text-muted-foreground font-normal">
            Not Ugly Ones
          </span>
        </h1>

        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto font-dm-sans">
          Design professional invoices in minutes with our intuitive tools. Make
          your business look as good as it performs.
        </p>

        <Button className="bg-gradient-to-r from-blue-800 to-blue-800 text-white hover:opacity-90 transition-opacity px-3 py-1 cursor-pointer text-base font-medium  shadow-lg">
          Get Started
          <div className="ml-2 h-4 w-4 rounded-full bg-white/20 flex items-center justify-center">
            <GoArrowUpRight className="h-2.5 w-2.5" />
          </div>
        </Button>
      </div>
    </section>
  );
}
