import { Facebook, Instagram, Mail } from "lucide-react";

const Footer = () => (
  <footer className="w-full bg-black py-8 px-4">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start">
      {/* Left: Socials */}
      <div className="flex flex-col items-start mb-6 md:mb-0">
        <span className="text-white font-semibold mb-4">FOLLOW US</span>
        <div className="flex flex-col space-y-4">
            <span className="flex items-center space-x-2">
              <a
                href="https://facebook.com/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-400 flex items-center"
              >
                <Facebook className="h-6 w-6" />
                <span className="ml-2 underline">Facebook</span>
              </a>
            </span>
            <span className="flex items-center space-x-2">
              <a
                href="https://www.tiktok.com/@nex_gen01"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-400 flex items-center"
              >
                <img src="/images/tiktok.png" alt="TikTok" className="h-4 w-4 object-contain" />
                <span className="ml-2 underline">NEXGEN</span>
              </a>
            </span>
            <span className="flex items-center space-x-2">
              <a
                href="https://instagram.com/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-400 flex items-center"
              >
                <Instagram className="h-6 w-6" />
                <span className="ml-2 underline">Instagram</span>
              </a>
            </span>
        </div>
      </div>
      {/* Center: Logo */}
      <div className="flex flex-col items-center mb-6 md:mb-0">
        {/* Replace with your logo image */}
        <img
          src="/images/logo1.png"
          alt="Twelve Studio Logo"
          className="h-20 w-auto mb-2"
        />
  <img src="/images/logo.png" alt="Twelve Studio Logo" className="h-30 w-auto mb-4" />
  <span className="text-white text-xs mt-4 block">© {new Date().getFullYear()} twelveAM . All rights reserved.</span>
      </div>
      {/* Right: Payment and Customer Service */}
      <div className="flex flex-col items-end text-white">
        <span className="font-semibold mb-4">WE ACCEPT</span>
        <div className="flex space-x-2 mb-4">
          {/* Replace with your payment icons */}
          <img src="/images/aba.png" alt="Pay" className="h-6" />
          <img src="/images/visa.png" alt="Visa" className="h-6" />
          <img src="/images/mastercard.png" alt="Mastercard" className="h-6" />
        </div>
        <span className="font-semibold mb-2">CUSTOMER SERVICES</span>
        <div className="flex flex-col items-end space-y-2 text-sm">
          <p
            className="flex items-center"
          >
            <span className="mr-2">🛈</span> Online exchange policy
          </p>
          <p
            className="flex items-center"
          >
            <span className="mr-2">🛡</span> Privacy Policy
          </p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;