import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ShoppingBag,
  Star,
  Smartphone,
  Store,
  Bike,
  ChevronRight,
  ShieldCheck,
  Award,
} from 'lucide-react';

import useRestaurantStore from '../store/useRestaurantStore';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import SkeletonLoader from '../components/common/SkeletonLoader';

const CUISINES = [
  { label: 'All', icon: '🍽️' },
  { label: 'Pizza', icon: '🍕' },
  { label: 'Burgers', icon: '🍔' },
  { label: 'Momo', icon: '🥟' },
  { label: 'Chinese', icon: '🥢' },
  { label: 'Indian', icon: '🍛' },
  { label: 'Desserts', icon: '🍰' },
  { label: 'Beverages', icon: '🥤' },
];

export const Landing = () => {
  const navigate = useNavigate();
  const { restaurants, fetchRestaurants, loading } = useRestaurantStore();
  const [selectedCuisine, setSelectedCuisine] = useState('All');

  useEffect(() => {
    fetchRestaurants({ limit: 6 });
  }, [fetchRestaurants]);

  const handleCuisineClick = (cuisineLabel) => {
    setSelectedCuisine(cuisineLabel);
    if (cuisineLabel === 'All') {
      navigate('/restaurants');
    } else {
      navigate(`/restaurants?cuisine=${cuisineLabel.toLowerCase()}`);
    }
  };

  // Mock featured data fallback if backend returns empty list during testing
  const displayRestaurants =
    restaurants.length > 0
      ? restaurants.slice(0, 6)
      : [
          {
            _id: '1',
            name: 'Bajeko Sekuwa',
            cuisine: ['Nepali', 'Grilled'],
            rating: 4.7,
            deliveryTime: 30,
            deliveryFee: 0,
            image: {
              url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=320&fit=crop&auto=format',
            },
            discount: '20% OFF',
          },
          {
            _id: '2',
            name: 'Roadhouse Café',
            cuisine: ['Continental', 'Burgers'],
            rating: 4.5,
            deliveryTime: 35,
            deliveryFee: 49,
            image: {
              url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&h=320&fit=crop&auto=format',
            },
            isAiPick: true,
          },
          {
            _id: '3',
            name: 'Momo Station',
            cuisine: ['Momo', 'Tibetan'],
            rating: 4.8,
            deliveryTime: 25,
            deliveryFee: 0,
            image: {
              url: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&h=320&fit=crop&auto=format',
            },
            discount: '15% OFF',
          },
        ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-white pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Column Text & CTAs */}
          <div className="flex-1 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#c2410c] text-xs font-semibold mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#f97316]" />
              <span>Food Delivery, Delivered Right</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
              Cravings? We've got you{' '}
              <span className="text-[#f97316]">covered.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              Order from hundreds of local restaurants across Kathmandu and get hot, fresh food delivered to your door in under 30 minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 mb-10">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/restaurants')}
                className="w-full sm:w-auto shadow-lg hover:shadow-orange-500/20"
                icon={Search}
              >
                Order Food Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto"
              >
                Become a Partner <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-medium text-slate-600 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Free delivery over ₹499
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 200+ partner places
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 30-min avg arrival
              </span>
            </div>
          </div>

          {/* Right Column Floating Card Stack Mockup */}
          <div className="hidden lg:flex relative w-[420px] h-[400px] items-center justify-center flex-shrink-0">
            {/* AI Recommendation Floating Pill */}
            <div className="absolute top-4 right-6 z-20 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>AI recommended for you</span>
            </div>

            {/* Background Rotated Card */}
            <div className="absolute top-12 left-4 z-0 -rotate-6 scale-95 opacity-80 blur-[0.5px]">
              <div className="w-72 bg-white rounded-2xl p-3 border border-slate-200 shadow-md">
                <div className="h-36 rounded-xl bg-slate-100 overflow-hidden mb-3">
                  <img
                    src="https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&h=320&fit=crop&auto=format"
                    alt="Roadhouse Cafe"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="font-semibold text-sm text-slate-900">Roadhouse Café</p>
                <p className="text-xs text-slate-500">Continental · Burgers</p>
              </div>
            </div>

            {/* Foreground Featured Restaurant Card */}
            <div className="absolute top-6 left-12 z-10 rotate-2 hover:rotate-0 transition-transform duration-300">
              <div
                onClick={() => navigate('/restaurants')}
                className="w-80 bg-white rounded-2xl p-4 border border-slate-200 shadow-2xl cursor-pointer"
              >
                <div className="relative h-44 rounded-xl bg-slate-100 overflow-hidden mb-3">
                  <img
                    src="https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=320&fit=crop&auto=format"
                    alt="Bajeko Sekuwa"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full text-xs font-bold text-slate-900 flex items-center gap-1 shadow-xs">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.7
                  </div>
                  <span className="absolute top-2.5 left-2.5 bg-[#ea580c] text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                    20% OFF
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-0.5">Bajeko Sekuwa</h3>
                <p className="text-xs text-slate-500 mb-2">Nepali · Charcoal Grilled · Sekuwa</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 border-t border-slate-100 pt-2.5">
                  <span className="flex items-center gap-1 text-slate-600 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> 25–35 min
                  </span>
                  <span>·</span>
                  <span className="text-emerald-600 font-semibold">Free delivery</span>
                </div>
              </div>
            </div>

            {/* Floating Quick Add Pill */}
            <div className="absolute bottom-4 left-6 z-30 bg-white rounded-xl p-3 shadow-xl border border-slate-200 flex items-center gap-3 w-64 animate-bounce-slow">
              <img
                src="https://images.unsplash.com/photo-1529557989-1c5cc38acf0b?w=80&h=80&fit=crop&auto=format"
                alt="Chicken Sekuwa"
                className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">Chicken Sekuwa</p>
                <p className="text-xs font-semibold text-slate-500">₹380</p>
              </div>
              <span className="bg-[#f97316] text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-xs">
                Add
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Cuisine Filter Pills Carousel */}
      <section className="bg-slate-100/70 border-b border-slate-200 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            {CUISINES.map((c) => {
              const isSelected = selectedCuisine === c.label;
              return (
                <button
                  key={c.label}
                  onClick={() => handleCuisineClick(c.label)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold flex-shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#fff7ed] text-[#f97316] border-1.5 border-[#f97316] shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm">{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              How KhanaExpress works
            </h2>
            <p className="text-sm text-slate-500">
              From craving to doorstep in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                step: '01',
                title: 'Browse & Choose',
                desc: 'Explore 200+ top local restaurants. Filter by your favorite cuisine, dietary preference, or rating.',
                icon: Search,
              },
              {
                step: '02',
                title: 'Place Your Order',
                desc: 'Select dishes, add special instructions, and check out with seamless payment choices.',
                icon: ShoppingBag,
              },
              {
                step: '03',
                title: 'Track & Enjoy',
                desc: 'Watch your order move live from kitchen preparation to your door. Fresh, hot, and fast.',
                icon: Clock,
              },
            ].map((s) => {
              const IconComp = s.icon;
              return (
                <div
                  key={s.step}
                  className="bg-slate-50 rounded-2xl p-8 border border-slate-200 relative group hover:bg-orange-50/40 hover:border-orange-200 transition-all"
                >
                  <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded bg-orange-100 text-[#f97316] mb-4">
                    {s.step}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#f97316] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Near You Section */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Popular near you
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Top-rated dining spots in Kathmandu
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/restaurants')}
            >
              View all <ChevronRight className="w-4 h-4 ml-0.5" />
            </Button>
          </div>

          {loading ? (
            <SkeletonLoader type="card" count={3} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayRestaurants.map((r) => {
                const imageUrl = r.image?.url || r.imageUrl;
                const cuisines = Array.isArray(r.cuisine)
                  ? r.cuisine.join(', ')
                  : r.cuisines
                  ? r.cuisines.join(', ')
                  : 'Multi-Cuisine';

                return (
                  <div
                    key={r._id || r.id}
                    onClick={() => navigate(`/restaurants/${r._id || r.id}`)}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer overflow-hidden group flex flex-col"
                  >
                    <div className="relative h-44 bg-slate-100 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={r.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full text-xs font-bold text-slate-900 flex items-center gap-1 shadow-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {r.rating || 4.5}
                      </div>
                      {r.discount && (
                        <span className="absolute top-3 left-3 bg-[#ea580c] text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                          {r.discount}
                        </span>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-base text-slate-900 group-hover:text-[#f97316] transition-colors">
                          {r.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 capitalize">
                          {cuisines}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 pt-3 mt-3 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />{' '}
                          {r.deliveryTime || 30} min
                        </span>
                        <span>·</span>
                        <span className="text-emerald-700 font-semibold">
                          {r.deliveryFee === 0 || r.deliveryFee === 'Free'
                            ? 'Free delivery'
                            : `₹${r.deliveryFee} delivery`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Platform Statistics Banner */}
      <section className="bg-[#ea580c] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '200+', label: 'Local Restaurants' },
              { value: '50,000+', label: 'Orders Delivered' },
              { value: '30 min', label: 'Average Arrival' },
              { value: '4.7 ★', label: 'Average Rating' },
            ].map((st) => (
              <div key={st.label} className="space-y-1">
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {st.value}
                </p>
                <p className="text-xs sm:text-sm text-orange-100 font-medium">
                  {st.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Signup & App CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Restaurant Partner CTA */}
            <div className="bg-orange-50/60 rounded-3xl p-8 border border-orange-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#f97316] text-white flex items-center justify-center mb-5 shadow-sm">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  List your restaurant
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Grow your business by reaching thousands of hungry food lovers across your city.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
                className="self-start"
              >
                Partner Signup <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Delivery Partner CTA */}
            <div className="bg-slate-100/80 rounded-3xl p-8 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-5 shadow-sm">
                  <Bike className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Ride with KhanaExpress
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Flexible working hours, weekly payouts, and great earnings as a delivery partner.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/register')}
                className="self-start bg-slate-900 text-white hover:bg-slate-800 border-none"
              >
                Become a Rider <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
