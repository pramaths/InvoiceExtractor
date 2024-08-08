import React from 'react';
import { FaHome } from 'react-icons/fa';
import { MdPerson, MdSettings } from 'react-icons/md';

const Header = ({ title }: { title: string }) => {
  return (
    <header className="bg-gray-800 text-white w-full py-4 px-8 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <img src="/swipe.svg" alt="logo" height="100" width="100"/>
        <FaHome className="text-2xl" />
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <MdPerson className="text-xl cursor-pointer" title="Profile" />
        <MdSettings className="text-xl cursor-pointer" title="Settings" />
      </div>
    </header>
  );
};

export default Header;
