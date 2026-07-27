import { Separator } from "@/components/ui/separator";

import Logo from "@/components/shadcn-studio/logo";
import { FacebookIcon } from "@/components/icons/devicon-facebook";
import { InstagramIcon } from "@/components/icons/il-instagram";
import { XTwitterIcon } from "@/components/icons/arcticons-x-twitter";
import { YoutubeIconIcon } from "@/components/icons/logos-youtube-icon";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full mt-[20dvh]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 max-md:flex-col sm:px-6 sm:py-6 md:gap-6 md:py-8">
        <Link href="#">
          <div className="flex items-center gap-3">
            <Logo />
          </div>
        </Link>

        <div className="flex items-center gap-5 whitespace-nowrap">
          <Link
            href="#"
            className="opacity-80 transition-opacity duration-300 hover:opacity-100"
          >
            About
          </Link>

          <Link
            href="#"
            className="opacity-80 transition-opacity duration-300 hover:opacity-100"
          >
            Feed
          </Link>
          <Link
            href="#"
            className="opacity-80 transition-opacity duration-300 hover:opacity-100"
          >
            Contact Us
          </Link>
          <Link
            href="#"
            className="opacity-80 transition-opacity duration-300 hover:opacity-100"
          >
            Terms & Conditions
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="#">
            <FacebookIcon className="size-5" />
          </Link>
          <Link href="#">
            <InstagramIcon className="size-5" />
          </Link>
          <Link href="#">
            <XTwitterIcon className="size-5" />
          </Link>
          <Link href="#">
            <YoutubeIconIcon className="size-5" />
          </Link>
        </div>
      </div>

      <Separator />

      <div className="mx-auto flex max-w-7xl justify-center px-4 py-8 sm:px-6">
        <p className="text-center font-medium text-balance">
          {`©${new Date().getFullYear()}`}{" "}
          <Link href="#" className="hover:underline">
            Virtual Try-on
          </Link>{" "}
          made with ❤️
        </p>
      </div>
    </footer>
  );
};

export default Footer;
