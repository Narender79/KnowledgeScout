import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Mail, FileText, Shield, HelpCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Knowledge Scout</span>
            </div>
            <p className="text-neutral-400 text-sm">
              Transform documents into intelligent conversations. 
              Discover insights, ask questions, and collaborate seamlessly.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com/knowledge-scout" 
                className="text-neutral-400 hover:text-primary-400 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="mailto:support@knowledgescout.com" 
                className="text-neutral-400 hover:text-primary-400 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/upload" className="text-neutral-400 hover:text-white transition-colors">
                  Upload Documents
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-neutral-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-neutral-400 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-neutral-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/docs" 
                  className="text-neutral-400 hover:text-white transition-colors flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Documentation</span>
                </a>
              </li>
              <li>
                <a 
                  href="/help" 
                  className="text-neutral-400 hover:text-white transition-colors flex items-center space-x-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Help Center</span>
                </a>
              </li>
              <li>
                <a 
                  href="/api" 
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  API Reference
                </a>
              </li>
              <li>
                <a 
                  href="/blog" 
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/privacy" 
                  className="text-neutral-400 hover:text-white transition-colors flex items-center space-x-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Privacy Policy</span>
                </a>
              </li>
              <li>
                <a 
                  href="/terms" 
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a 
                  href="/security" 
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Security
                </a>
              </li>
              <li>
                <a 
                  href="/cookies" 
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-400 text-sm">
              © 2024 Knowledge Scout. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a 
                href="/status" 
                className="text-neutral-400 hover:text-white transition-colors text-sm"
              >
                Status
              </a>
              <a 
                href="/contact" 
                className="text-neutral-400 hover:text-white transition-colors text-sm"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
