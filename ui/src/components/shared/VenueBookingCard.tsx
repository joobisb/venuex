import React from 'react';
import { MapPin, Star, Clock, Users, ExternalLink, Calendar, Phone } from 'lucide-react';

export interface VenueBooking {
  platform: string;
  venue_name: string;
  venue_id?: string;
  city: string;
  area?: string;
  address?: string;
  sport: string;
  sports_offered?: string[];
  rating?: number;
  rating_count?: number;
  is_bookable: boolean;
  booking_url: string;
  venue_url?: string;
  price?: string;
  time_slots?: string;
  distance?: number;
  detected_at: string;
}

interface VenueBookingCardProps {
  venue: VenueBooking;
  onBookingClick?: (venue: VenueBooking) => void;
}

const VenueBookingCard: React.FC<VenueBookingCardProps> = ({ venue, onBookingClick }) => {
  const handleBookingClick = () => {
    if (onBookingClick) {
      onBookingClick(venue);
    } else {
      // Open booking URL in new tab
      window.open(venue.booking_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleVenueDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (venue.venue_url) {
      window.open(venue.venue_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {venue.venue_name}
            </h3>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{venue.area}, {venue.city}</span>
              {venue.distance && (
                <span className="ml-2 text-gray-500">
                  • {venue.distance.toFixed(1)} km away
                </span>
              )}
            </div>
          </div>
          
          {/* Platform Badge */}
          <div className="flex-shrink-0">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {venue.platform}
            </span>
          </div>
        </div>

        {/* Rating */}
        {venue.rating && venue.rating > 0 && (
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm font-medium text-gray-900">
                {venue.rating.toFixed(1)}
              </span>
              {venue.rating_count && (
                <span className="ml-1 text-sm text-gray-500">
                  ({venue.rating_count} reviews)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Address */}
        {venue.address && (
          <p className="text-sm text-gray-600 mb-3">
            {venue.address}
          </p>
        )}
      </div>

      {/* Sports & Details */}
      <div className="px-6 pb-4">
        {/* Sports Offered */}
        {venue.sports_offered && venue.sports_offered.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Sports Available</h4>
            <div className="flex flex-wrap gap-1">
              {venue.sports_offered.slice(0, 4).map((sport, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800"
                >
                  {sport}
                </span>
              ))}
              {venue.sports_offered.length > 4 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                  +{venue.sports_offered.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Time & Price Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {venue.time_slots && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>{venue.time_slots}</span>
            </div>
          )}
          {venue.price && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              <span>{venue.price}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          {/* Availability Status */}
          <div className="flex items-center">
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                venue.is_bookable ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
            <span
              className={`text-sm font-medium ${
                venue.is_bookable ? 'text-green-700' : 'text-gray-600'
              }`}
            >
              {venue.is_bookable ? 'Available for Booking' : 'Not Available'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {venue.venue_url && (
              <button
                onClick={handleVenueDetailsClick}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Details
              </button>
            )}
            
            {venue.is_bookable && (
              <button
                onClick={handleBookingClick}
                className="inline-flex items-center px-4 py-1.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Calendar className="w-3 h-3 mr-1" />
                Book Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueBookingCard; 