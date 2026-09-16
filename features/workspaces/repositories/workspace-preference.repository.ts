import AsyncStorage from "@react-native-async-storage/async-storage";

const ACTIVE_WORKSPACE_KEY = "onzait.active-workspace-id";

export async function readActiveWorkspaceId() {
  return AsyncStorage.getItem(ACTIVE_WORKSPACE_KEY);
}

export async function writeActiveWorkspaceId(workspaceId: string | null) {
  if (workspaceId) {
    await AsyncStorage.setItem(ACTIVE_WORKSPACE_KEY, workspaceId);
    return;
  }

  await AsyncStorage.removeItem(ACTIVE_WORKSPACE_KEY);
}
