import React from 'react';
import { Compass, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#f97316] flex items-center justify-center text-white font-bold">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-slate-900">
                Khana<span className="text-[#f97316]">Express</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Fast, reliable food delivery and restaurant management platform. Delivers hot & fresh meals to your doorstep in minutes.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><a href="/restaurants" className="hover:text-[#f97316] transition-colors">Browse Restaurants</a></li>
              <li><a href="/login" className="hover:text-[#f97316] transition-colors">Customer Login</a></li>
              <li><a href="/register" className="hover:text-[#f97316] transition-colors">Partner Signup</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              For Partners
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><a href="/register" className="hover:text-[#f97316] transition-colors">Add your Restaurant</a></li>
              <li><a href="/register" className="hover:text-[#f97316] transition-colors">Become a Delivery Partner</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Support
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><span className="text-slate-500">Kathmandu, Nepal</span></li>
              <li><span className="text-slate-500">support@khanaexpress.com</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} KhanaExpress. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for food lovers.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
