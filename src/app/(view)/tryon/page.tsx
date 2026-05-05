import Tryons from "@/components/core/tryons";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export default function Page() {
  return (
    <div className="grid p-6 gap-6 items-start h-full">
      <section className="">
        <div className="flex items-center w-full justify-between mb-4">
          <h1 className="font-bold text-xl pb-4">Try-on photos</h1>
          <Button>
            <PlusIcon /> Add Try-on Photo
          </Button>
        </div>
        <div className="grid lg:grid-cols-3 gap-6 w-full h-full">
          <Tryons />
        </div>
      </section>
    </div>
  );
}
