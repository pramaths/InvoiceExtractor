import React from 'react';
import { FaHome } from 'react-icons/fa';
import { MdPerson, MdSettings } from 'react-icons/md';

const Header = ({ title }: { title: string }) => {
  return (
    <header className="bg-inherit text-white w-full py-4 px-8 flex justify-between items-center top-0">
      <div className="flex items-center gap-4">
        <img src="/swipe.svg" alt="logo" height="100" width="100"/>
      </div>
    </header>
  );
};

export default Header;
