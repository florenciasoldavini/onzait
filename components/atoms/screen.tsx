import { atomLayout, atomPalette, atomSpacing } from "@/components/atoms/theme";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function Screen({
  centered = false,
  children,
  keyboardSafe = false,
  scrollable = true,
  style
}: {
  centered?: boolean;
  children: ReactNode;
  keyboardSafe?: boolean;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const horizontalPadding =
    width >= atomLayout.breakpointDesktop
      ? atomLayout.marginDesktop
      : width >= atomLayout.breakpointTablet
        ? atomLayout.marginTablet
        : atomLayout.marginMobile;

  const container = (
    <View
      style={{
        alignSelf: "center",
        flex: centered ? 1 : undefined,
        justifyContent: centered ? "center" : undefined,
        maxWidth: atomLayout.maxWidthContent,
        paddingHorizontal: horizontalPadding,
        width: "100%"
      }}
    >
      {children}
    </View>
  );
  const shouldAvoidKeyboard = keyboardSafe && Platform.OS !== "web";
  const keyboardBottomPadding =
    shouldAvoidKeyboard && keyboardVisible ? atomSpacing[24] : atomSpacing[12];

  useEffect(() => {
    if (!shouldAvoidKeyboard) {
      return;
    }

    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSubscription = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
      scrollRef.current?.scrollTo({ animated: true, y: 0 });
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [shouldAvoidKeyboard]);

  function renderRoot(content: ReactNode) {
    if (!shouldAvoidKeyboard) {
      return (
        <View
          style={[
            {
              backgroundColor: atomPalette.background,
              flex: 1
            },
            style
          ]}
        >
          {content}
        </View>
      );
    }

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
        style={[
          {
            backgroundColor: atomPalette.background,
            flex: 1
          },
          style
        ]}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  if (!scrollable) {
    return renderRoot(
      <View
        style={{
          flex: 1,
          paddingBottom: insets.bottom + atomSpacing[6],
          paddingTop: insets.top + atomSpacing[6]
        }}
      >
        {container}
      </View>
    );
  }

  return renderRoot(
    <ScrollView
      ref={scrollRef}
      automaticallyAdjustKeyboardInsets={shouldAvoidKeyboard}
      bounces={!shouldAvoidKeyboard || keyboardVisible}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: centered ? "center" : undefined,
        paddingBottom: insets.bottom + keyboardBottomPadding,
        paddingTop: insets.top + atomSpacing[6]
      }}
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      keyboardShouldPersistTaps="handled"
      scrollEnabled={!shouldAvoidKeyboard || keyboardVisible}
      showsVerticalScrollIndicator={false}
    >
      {container}
    </ScrollView>
  );
}
