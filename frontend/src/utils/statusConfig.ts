import React from 'react';
import { CheckCircle, Clock, XCircle, Ban } from 'lucide-react';
import { Status } from '../types/order';

export interface StatusConfig {
  icon: React.ReactElement;
  badge: string;
  color: 'green' | 'yellow' | 'red' | 'gray';
  badgeClass: string;
  indicatorClass: string;
}

export const getStatusConfig = (status: Status): StatusConfig => {
  switch (status) {
    case 'pending':
      return {
        icon: React.createElement(Clock, { className: 'w-5 h-5' }),
        badge: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200',
        color: 'yellow',
        badgeClass: 'status-badge pending',
        indicatorClass: 'pending',
      };
    case 'approved':
      return {
        icon: React.createElement(CheckCircle, { className: 'w-5 h-5' }),
        badge: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200',
        color: 'green',
        badgeClass: 'status-badge approved',
        indicatorClass: 'approved',
      };
    case 'rejected':
      return {
        icon: React.createElement(XCircle, { className: 'w-5 h-5' }),
        badge: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200',
        color: 'red',
        badgeClass: 'status-badge rejected',
        indicatorClass: 'rejected',
      };
    case 'cancelled':
      return {
        icon: React.createElement(Ban, { className: 'w-5 h-5' }),
        badge: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200',
        color: 'gray',
        badgeClass: 'status-badge cancelled',
        indicatorClass: 'cancelled',
      };
    default:
      return {
        icon: React.createElement(Clock, { className: 'w-5 h-5' }),
        badge: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200',
        color: 'gray',
        badgeClass: 'status-badge',
        indicatorClass: 'default',
      };
  }
};
