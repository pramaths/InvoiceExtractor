import React from 'react';
import { FaHome } from 'react-icons/fa';
import { MdPerson, MdSettings } from 'react-icons/md';
import { FaGithub } from 'react-icons/fa';
import Link from 'next/link';

const Header = ({ title }: { title: string }) => {
  return (
    <header className="bg-inherit text-white w-full py-4 px-8 flex justify-between items-center top-0">
      <div className="flex items-center gap-4">
        <img src="/swipe.svg" alt="logo" height="100" width="100"/>
      </div>
      <Link href = 'https://github.com/pramaths/InvoiceExtractor'>
      <div>
        <FaGithub className="text-2xl text-white" />
      </div>
      </Link>
    </header>
  );
};

export default Header;
