import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaGithub } from "react-icons/fa";


const scrollOntop = () => {
  window.scrollTo({
    top :0 , behavior : "smooth"
  });
} 

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8">
      <div className="container mx-auto px-6 md:flex md:justify-around">
        
        {/* Left Section: Brand & About */}
        <div className="mb-6 md:mb-0">
          <h2 className="text-3xl font-extrabold text-green-400">Land Strider</h2>
          <p className="text-gray-300 mt-2 max-w-sm">
            Your trusted platform for renting, buying, and leasing lands. Explore the best options today!
          </p>
        </div>

        {/* Center Section: Quick Links */}
        <div className="mb-6 md:mb-0">
          <h3 className="text-xl font-semibold text-green-300">Quick Links</h3>
          <ul className="mt-3 space-y-2">
            <li><Link to="/" onClick={scrollOntop} className="text-gray-300 hover:text-green-400 transition duration-300">🏠 Home</Link></li>
            <li><Link to="/about" onClick={scrollOntop} className="text-gray-300 hover:text-green-400 transition duration-300">ℹ️ About</Link></li>
            <li><Link to="/contact" onClick={scrollOntop} className="text-gray-300 hover:text-green-400 transition duration-300">📞 Contact</Link></li>
            <li><Link to="/privacy-policy" onClick={scrollOntop} className="text-gray-300 hover:text-green-400 transition duration-300">🔒 Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Right Section: Social Media */}
        <div>
          <h3 className="text-xl font-semibold text-green-300">Follow Us</h3>
          <div className="flex space-x-4 mt-3">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
              className="text-gray-300 hover:text-blue-500 transition duration-300">
              <FaFacebookF size={24} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" 
              className="text-gray-300 hover:text-blue-400 transition duration-300">
              <FaTwitter size={24} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
              className="text-gray-300 hover:text-pink-500 transition duration-300">
              <FaInstagram size={24} />
            </a>
            <a href="https://github.com/Aryanverma24" target="_blank" rel="noopener noreferrer" 
              className="text-gray-300 hover:text-orange-500 transition duration-300">
              <FaGithub size={24} />
            </a>
            <a href="https://www.linkedin.com/in/aryan-verma-554115283/" target="_blank" rel="noopener noreferrer" 
              className="text-gray-300 hover:text-blue-700 transition duration-300">
              <FaLinkedinIn size={24} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Section: Copyright */}
      <div className="text-center text-gray-400 mt-6 border-t border-gray-700 pt-4">
        © {new Date().getFullYear()} <span className="text-green-400 font-semibold">Land Strider</span>. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
