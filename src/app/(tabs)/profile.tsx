import { Platform } from "react-native";

export default function ProfileRoute() {
    const isWebServerRender = Platform.OS === "web" && typeof window === "undefined";

    if (isWebServerRender) {
        return null;
    }

    const { Profile } = require("@/features/profile/Profile");
    return <Profile />;
}