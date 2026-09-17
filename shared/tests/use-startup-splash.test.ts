import { act, renderHook } from "@testing-library/react-native";
import { useStartupSplash } from "@/shared/splash/use-startup-splash";
import * as SplashScreen from "expo-splash-screen";

jest.mock("expo-splash-screen", () => ({ hide: jest.fn() }));

it("waits for auth, shows the guest intro once, and never replays it on remount or sign-out", async () => {
  const first = await renderHook(
    (props: { ready: boolean; authenticated: boolean }) =>
      useStartupSplash(props),
    {
      initialProps: { ready: false, authenticated: false }
    }
  );
  expect(first.result.current.visible).toBe(false);
  await first.rerender({ ready: true, authenticated: false });
  expect(first.result.current.visible).toBe(true);
  await act(() => first.result.current.finish());
  expect(first.result.current.visible).toBe(false);
  await first.unmount();

  const returning = await renderHook(
    (props: { ready: boolean; authenticated: boolean }) =>
      useStartupSplash(props),
    {
      initialProps: { ready: false, authenticated: false }
    }
  );
  await returning.rerender({ ready: true, authenticated: true });
  expect(returning.result.current.visible).toBe(false);
  expect(SplashScreen.hide).toHaveBeenCalled();
  await returning.rerender({ ready: true, authenticated: false });
  expect(returning.result.current.visible).toBe(false);
  await returning.unmount();

  const guestRefresh = await renderHook(() =>
    useStartupSplash({ ready: true, authenticated: false })
  );
  expect(guestRefresh.result.current.visible).toBe(false);
});
