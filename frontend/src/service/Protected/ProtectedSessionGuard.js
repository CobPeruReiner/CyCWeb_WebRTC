/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { SIPContext } from "../../context/JsSIP/JsSIPContext";
import PanelContext from "../../context/Panel/PanelContext";
import { LocalStorageService } from "../LocalStorageService";
import { connectSocket, disconnectSocket, offForceLogout, onForceLogout } from "../../Socket/Socket";

export default function ProtectedSessionGuard({ children }) {
    const { closeSession } = useContext(SIPContext) || {};
    const panelContext = useContext(PanelContext);
    const history = useHistory();

    useEffect(() => {
        const ls = new LocalStorageService();
        const token = ls.getAccessToken?.();
        if (!token) return;

        connectSocket(token);

        const handleForced = ({ reason }) => {
            try {
                closeSession?.();
            } catch {}
            sessionStorage.removeItem("usrm");
            ls.clearToken();
            panelContext.setUserLogin(null);
            panelContext.setSelectedEntityId?.(null);
            disconnectSocket();

            sessionStorage.setItem("forcedLogoutMsg", "Se inició sesión en otro dispositivo.");

            history.replace("/");
        };

        onForceLogout(handleForced);
        return () => offForceLogout(handleForced);
    }, []);

    useEffect(() => {
        const ls = new LocalStorageService();
        const token = ls.getAccessToken?.();
        if (!token) return;

        const decode = (t) => {
            try {
                const base64 = t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
                const json = decodeURIComponent(
                    atob(base64)
                        .split("")
                        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                        .join("")
                );
                return JSON.parse(json);
            } catch {
                return null;
            }
        };

        const payload = decode(token);
        const expMs = payload?.exp ? payload.exp * 1000 : null;
        if (!expMs) return;

        const now = Date.now();
        const msLeft = expMs - now;
        const WARN_MS = 60_000;

        if (msLeft <= 0) {
            sessionStorage.setItem("forcedLogoutMsg", "Tu sesión expiró por inactividad (token vencido).");
            try {
                closeSession?.();
            } catch {}
            ls.clearToken();
            panelContext.setUserLogin(null);
            panelContext.setSelectedEntityId?.(null);
            disconnectSocket();
            history.replace("/");
            return;
        }

        let warnTimer, expireTimer;

        const showWarn = () => {
            console.warn("Sesión por expirar en ~1 minuto");
        };

        const doExpire = () => {
            sessionStorage.setItem("forcedLogoutMsg", "Tu sesión expiró por inactividad (token vencido).");
            try {
                closeSession?.();
            } catch {}
            ls.clearToken();
            panelContext.setUserLogin(null);
            panelContext.setSelectedEntityId?.(null);
            disconnectSocket();
            history.replace("/");
        };

        if (msLeft > WARN_MS) {
            warnTimer = setTimeout(showWarn, msLeft - WARN_MS);
        } else {
            showWarn();
        }

        expireTimer = setTimeout(doExpire, msLeft + 500);

        return () => {
            clearTimeout(warnTimer);
            clearTimeout(expireTimer);
        };
    }, []);

    return <>{children}</>;
}
