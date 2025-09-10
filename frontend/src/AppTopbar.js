import React, { useContext, useRef } from "react";
import { Menu } from "primereact/menu";
import { LocalStorageService } from "./service/LocalStorageService";
import PanelContext from "./context/Panel/PanelContext";
import { useHistory } from "react-router-dom";
import { SIPContext } from "./context/JsSIP/JsSIPContext";
export const AppTopbar = (props) => {
    const panelContext = useContext(PanelContext);

    const { closeSession } = useContext(SIPContext);

    let history = useHistory();

    const menu = useRef(null);

    const items = [
        {
            label: "Opciones",
            items: [
                {
                    label: "Logout",
                    icon: "pi pi-power-off",
                    command: () => {
                        closeSession();

                        let localStorageService = new LocalStorageService();
                        sessionStorage.removeItem("usrm");
                        localStorageService.clearToken();
                        panelContext.setUserLogin(null);
                        panelContext.setSelectedEntityId(null);
                        history.push(process.env.REACT_APP_ROUTE_BASE);
                    },
                },
            ],
        },
    ];

    return (
        <>
            <Menu model={items} popup ref={menu} id="popup_menu" />
            <div className="layout-topbar clearfix">
                <button type="button" className="p-link layout-menu-button" onClick={props.onToggleMenu}>
                    <span className="pi pi-bars" />
                </button>
                <span className="p-ml-4" style={{ fontSize: 14 }}>
                    COBRANZAS PERÚ{" "}
                </span>
                <div className="layout-topbar-icons">
                    <span className="layout-topbar-search" style={{ fontSize: 14 }}>
                        {props.user.NOMBRES} {props.user.APELLIDOS}
                    </span>

                    <button type="button" className="p-link" onClick={(event) => menu.current.toggle(event)} aria-controls="popup_menu" aria-haspopup>
                        <span className="layout-topbar-icon pi pi-user" />
                    </button>
                </div>
            </div>
        </>
    );
};
