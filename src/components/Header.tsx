import { UserMenu } from "./UserMenu";

const Header = () => {
  return (
    <div className="flex items-center justify-end w-full h-14 sm:h-16 bg-white/10 backdrop-blur-md border-b border-white/20 px-3 sm:px-6 rounded-lg">
      <UserMenu />
    </div>
  );
};

export default Header;
