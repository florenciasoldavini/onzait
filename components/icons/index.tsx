import {
  ArrowUpDown,
  ArrowRight,
  AtSign,
  Bell,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CirclePlus,
  CircleUserRound,
  Construction,
  EllipsisVertical,
  Eye,
  EyeOff,
  FolderOpen,
  FolderKanban,
  FolderPlus,
  HardHat,
  House,
  ImageOff,
  ImagePlus,
  Link2,
  ListChecks,
  ListFilter,
  ListPlus,
  ListTodo,
  LocateFixed,
  Lock,
  LogOut,
  Mail,
  MapPinned,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  SlidersHorizontal,
  Trash2,
  UserRound,
  X,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
  type LucideProps
} from "lucide-react-native";
import type { ComponentType } from "react";

export type AppIconSize = "xs" | "sm" | "md" | "lg";

export const appIconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24
} as const satisfies Record<AppIconSize, number>;

export type AppIconProps = {
  color: NonNullable<LucideProps["color"]>;
  size?: AppIconSize | number;
  strokeWidth?: LucideProps["strokeWidth"];
};

export type AppIconComponent = ComponentType<AppIconProps>;

function createIcon(Icon: LucideIcon): AppIconComponent {
  return function AppIcon({
    color,
    size = "md",
    strokeWidth = 1.8
  }: AppIconProps) {
    const resolvedSize = typeof size === "number" ? size : appIconSizes[size];

    return <Icon color={color} size={resolvedSize} strokeWidth={strokeWidth} />;
  };
}

export const ArrowRightIcon = createIcon(ArrowRight);
export const SortIcon = createIcon(ArrowUpDown);
export const AtSignIcon = createIcon(AtSign);
export const BellIcon = createIcon(Bell);
export const CalendarIcon = createIcon(CalendarDays);
export const CameraIcon = createIcon(Camera);
export const CheckIcon = createIcon(Check);
export const CheckCircleIcon = createIcon(CheckCircle2);
export const ChevronDownIcon = createIcon(ChevronDown);
export const ChevronLeftIcon = createIcon(ChevronLeft);
export const ChevronRightIcon = createIcon(ChevronRight);
export const AlertCircleIcon = createIcon(CircleAlert);
export const AddCircleIcon = createIcon(CirclePlus);
export const ClosedEyeIcon = createIcon(EyeOff);
export const ConstructionIcon = createIcon(Construction);
export const MoreVerticalIcon = createIcon(EllipsisVertical);
export const FolderOpenIcon = createIcon(FolderOpen);
export const FolderPlusIcon = createIcon(FolderPlus);
export const HardHatIcon = createIcon(HardHat);
export const HomeIcon = createIcon(House);
export const LinkIcon = createIcon(Link2);
export const ImageOffIcon = createIcon(ImageOff);
export const ImageAddIcon = createIcon(ImagePlus);
export const ChecklistIcon = createIcon(ListChecks);
export const FilterIcon = createIcon(ListFilter);
export const TaskAddIcon = createIcon(ListPlus);
export const LocateIcon = createIcon(LocateFixed);
export const LockIcon = createIcon(Lock);
export const LogoutIcon = createIcon(LogOut);
export const MailIcon = createIcon(Mail);
export const MapPinIcon = createIcon(MapPinned);
export const OpenEyeIcon = createIcon(Eye);
export const PlusIcon = createIcon(Plus);
export const EditIcon = createIcon(Pencil);
export const RefreshIcon = createIcon(RefreshCw);
export const SaveIcon = createIcon(Save);
export const SearchIcon = createIcon(Search);
export const FilterSettingsIcon = createIcon(SlidersHorizontal);
export const ProfileIcon = createIcon(CircleUserRound);
export const ProjectsIcon = createIcon(FolderKanban);
export const TasksIcon = createIcon(ListTodo);
export const ToDoIcon = TasksIcon;
export const TrashIcon = createIcon(Trash2);
export const UserIcon = createIcon(UserRound);
export const PhoneIcon = createIcon(Phone);
export const CloseIcon = createIcon(X);
export const ZoomInIcon = createIcon(ZoomIn);
export const ZoomOutIcon = createIcon(ZoomOut);
