import React from 'react';

const Navbar = () => {
  return (
    <nav className="custom-navbar" style={{ backgroundColor: '#a45151ff', padding: '10px', borderBottom: '1px solid #ccc', zIndex: 1000, position: 'relative' }}>
      <h1>Physical AI and Humanoid Robotics</h1>
      <ul>
        <li><a href="#">English</a></li>
        <li><a href="#">Urdu</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;