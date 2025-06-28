import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const ScreenLayout = ({ children }: { children: React.ReactNode }) => {
  const insets = useSafeAreaInsets();

  return (
    <View className="w-screen h-screen justify-center items-center p-4">
      <View
        className="w-full h-full"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        {children}
      </View>
    </View>
  );
};
