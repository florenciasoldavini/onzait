import {
  CircleUserRound,
  Eye,
  EyeClosed,
  House,
  ListTodo
} from "lucide-react-native";

export const HomeIcon = ({ color, size }: { color: string; size: number }) => {
  return <House size={size} color={color} />;
};

export const ToDoIcon = ({ color, size }: { color: string; size: number }) => {
  return <ListTodo size={size} color={color} />;
};

export const ProfileIcon = ({
  color,
  size
}: {
  color: string;
  size: number;
}) => {
  return <CircleUserRound size={size} color={color} />;
};

export const OpenEyeIcon = ({
  color,
  size
}: {
  color: string;
  size: number;
}) => {
  return <Eye size={size} color={color} />;
};

export const ClosedEyeIcon = ({
  color,
  size
}: {
  color: string;
  size: number;
}) => {
  return <EyeClosed size={size} color={color} />;
};
