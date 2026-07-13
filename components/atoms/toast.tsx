import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast
} from "@/components/ui/toast";

export type AppToastTone = "error" | "info" | "muted" | "success" | "warning";

export type AppToastInput = {
  description?: string;
  duration?: number;
  title: string;
  tone?: AppToastTone;
};

export function useAppToast() {
  const toast = useToast();

  const show = ({
    description,
    duration = 4000,
    title,
    tone = "info"
  }: AppToastInput) => {
    toast.show({
      duration,
      placement: process.env.EXPO_OS === "web" ? "top right" : "top",
      render: ({ id }) => (
        <Toast action={tone} nativeID={id}>
          <ToastTitle size="sm">{title}</ToastTitle>
          {description ? (
            <ToastDescription size="sm">{description}</ToastDescription>
          ) : null}
        </Toast>
      )
    });
  };

  return { show };
}
