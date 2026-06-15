import React from 'react';
import { 
  Users, BriefcaseMedical, CalendarDays, CircleDollarSign, BarChart3, 
  Search, Mail, Plus, ChevronDown, ChevronRight, ChevronUp, 
  X, AlertCircle, Check, Pencil, Trash2, Eye, Key, Lock, Unlock, LogOut, Clock,
  Download, Save
} from 'lucide-react';
import './Icon.css';

/**
 * Lucide React Central Wrapper
 * Tự động chuyển đổi các Icon tĩnh cũ sang Lucide React.
 */
const LUCIDE_MAP = {
  'users': Users,
  'briefcase': BriefcaseMedical, // Đổi sang phong cách Y tế
  'calendar': CalendarDays,
  'circle-dollar-sign': CircleDollarSign,
  'bar-chart-3': BarChart3,
  'search': Search,
  'mail': Mail,
  'plus': Plus,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  'chevron-up': ChevronUp,
  'x': X,
  'alert-circle': AlertCircle,
  'check': Check,
  'edit': Pencil, // Chuẩn hóa icon Sửa thành Pencil
  'trash': Trash2, // Chuẩn hóa icon Xóa thành Trash2
  'eye': Eye,
  'key': Key,
  'lock': Lock,
  'unlock': Unlock,
  'log-out': LogOut,
  'schedule': Clock,
  'clock': Clock,
  'download': Download,
  'save': Save,
};

export function Icon({ name, className = '', size = 18, strokeWidth = 2, ...props }) {
  const LucideIcon = LUCIDE_MAP[name];

  if (!LucideIcon) {
    console.warn(`Icon "${name}" chưa được cấu hình trong LUCIDE_MAP`);
    return null;
  }

  return (
    <LucideIcon 
      className={`icon ${className}`.trim()} 
      size={size} 
      strokeWidth={strokeWidth}
      color="currentColor" // Đảm bảo kế thừa màu sắc CSS từ thẻ cha
      {...props}
    />
  );
}
