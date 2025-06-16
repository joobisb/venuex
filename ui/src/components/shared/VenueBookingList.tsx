import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Calendar, Star, RotateCcw } from 'lucide-react';
import VenueBookingCard, { VenueBooking } from './VenueBookingCard';

interface VenueBookingListProps {
  venues: VenueBooking[];
  loading?: boolean;
  title?: string;
  onRefresh?: () => void;
  onBookingClick?: (venue: VenueBooking) => void;
}

const VenueBookingList: React.FC<VenueBookingListProps> = ({
  venues,
  loading = false,
  title = "Available Venues",
  onRefresh,
  onBookingClick
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBookable, setFilterBookable] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'distance'>('name');
  
  // Progressive loading messages for sports enthusiasts
  const loadingMessages = [
    "🏟️ Scouting your perfect playing field...",
    "🌍 Exploring the sports scene in your city...", 
    "📍 Pinpointing premium venues nearby...",
    "🔍 Hunting down the best courts & grounds...",
    "⚡ Checking live availability & slots...",
    "🎯 Matching you with top-rated venues..."
  ];

  const [currentLoadingIndex, setCurrentLoadingIndex] = useState(0);
  
  // Handle progressive loading messages
  useEffect(() => {
    let interval: number;
    
    if (loading) {
      setCurrentLoadingIndex(0);
      interval = setInterval(() => {
        setCurrentLoadingIndex((prev) => {
          const next = prev + 1;
          if (next >= loadingMessages.length) {
            // Loop back to first message if we reach the end
            return 0;
          }
          return next;
        });
      }, 3000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [loading, loadingMessages.length]);

  // Filter and sort venues
  const filteredAndSortedVenues = venues
    .filter(venue => {
      const matchesSearch = venue.venue_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           venue.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           venue.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBookable = !filterBookable || venue.is_bookable;
      return matchesSearch && matchesBookable;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'distance':
          return (a.distance || 999) - (b.distance || 999);
        default:
          return a.venue_name.localeCompare(b.venue_name);
      }
    });

  const bookableCount = venues.filter(v => v.is_bookable).length;
  const avgRating = venues.reduce((sum, v) => sum + (v.rating || 0), 0) / venues.length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 transition-all duration-500 ease-in-out">
              {loadingMessages[currentLoadingIndex]}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Title and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {venues.length} venues found
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {bookableCount} available
            </span>
            {avgRating > 0 && (
              <span className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-400" />
                {avgRating.toFixed(1)} avg rating
              </span>
            )}
          </div>
        </div>
        
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search venues, areas, or cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="bookable"
                checked={filterBookable}
                onChange={(e) => setFilterBookable(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="bookable" className="ml-2 text-sm text-gray-700">
                Available only
              </label>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'rating' | 'distance')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="name">Sort by Name</option>
              <option value="rating">Sort by Rating</option>
              <option value="distance">Sort by Distance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredAndSortedVenues.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No venues found</h3>
          <p className="text-gray-600">
            {searchTerm || filterBookable
              ? "Try adjusting your search or filters"
              : "No venues available for this location and sport"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedVenues.map((venue, index) => (
            <VenueBookingCard
              key={`${venue.venue_id || venue.venue_name}-${index}`}
              venue={venue}
              onBookingClick={onBookingClick}
            />
          ))}
        </div>
      )}

      {/* Results Summary */}
      {filteredAndSortedVenues.length > 0 && (
        <div className="text-center text-sm text-gray-600 py-4 border-t border-gray-200">
          Showing {filteredAndSortedVenues.length} of {venues.length} venues
          {searchTerm && (
            <span> • Search: "{searchTerm}"</span>
          )}
          {filterBookable && (
            <span> • Available only</span>
          )}
        </div>
      )}
    </div>
  );
};

export default VenueBookingList; 