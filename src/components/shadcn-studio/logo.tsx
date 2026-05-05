import Image from "next/image";

const Logo = () => {
  return <Image src={"/logo.png"} height={64} width={64} alt="logo" />;
};

export default Logo;
