// Central icon registry — one place listing every lucide-angular icon used
// across the app, mirroring how the React app imported icons individually
// from lucide-react per file. Registered once via LucideAngularModule.pick()
// in app.config.ts; components still import the icon they need directly
// from 'lucide-angular' and bind it with [img] so templates read the same
// way the React JSX did (e.g. `<lucide-icon [img]="Bell">`).
export {
  Bell,
  Mail,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  FlaskConical,
  MapPin,
  CalendarRange,
  CalendarDays,
  Users,
  CreditCard,
  Settings,
  LayoutDashboard,
  AlertTriangle,
  Repeat,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Award,
  Sparkles,
  Lightbulb,
  CircleDot,
  Dumbbell,
  User,
  Check,
} from 'lucide-angular';
