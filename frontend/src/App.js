import React, { useState, useEffect, useRef, useContext } from "react";
import classNames from "classnames";
import { Route, Switch, useParams } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import { AppTopbar } from "./AppTopbar";
import { AppMenu } from "./AppMenu";
import PrimeReact from "primereact/api";

import "primeicons/primeicons.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.css";
import "primeflex/primeflex.css";
import "./layout/flags/flags.css";
import "./layout/layout.scss";
import "./App.scss";

import { PanelGestion } from "./pages/Panel/PanelGestion";

import { Button } from "primereact/button";

import PanelContext from "./context/Panel/PanelContext";

import { LocalStorageService } from "./service/LocalStorageService";

const App = () => {
    const [layoutMode, setLayoutMode] = useState("overlay");
    const [layoutColorMode, setLayoutColorMode] = useState("dark");
    const [staticMenuInactive, setStaticMenuInactive] = useState(false);
    const [overlayMenuActive, setOverlayMenuActive] = useState(false);
    const [mobileMenuActive, setMobileMenuActive] = useState(false);
    const [inputStyle, setInputStyle] = useState("outlined");
    const [ripple, setRipple] = useState(false);
    const sidebar = useRef();
    let menuClick = false;

    const panelContext = useContext(PanelContext);

    const [dialogActualizar, setDialogActualizar] = useState(false);
    const [showInfoDireccion, setShowInfoDireccion] = useState(false);
    const [menu, setMenu] = useState([]);

    useEffect(() => {
        removeClass(document.body, "body-overflow-hidden-login");
        if (mobileMenuActive) {
            addClass(document.body, "body-overflow-hidden");
        } else {
            removeClass(document.body, "body-overflow-hidden");
        }
    }, [mobileMenuActive]);

    useEffect(() => {
        let _menu = [];
        // console.log("panelContext", panelContext);
        if (!panelContext.userLogin) {
            let localStorageService = new LocalStorageService();
            let userLoginSession = null;
            try {
                userLoginSession = localStorageService.getUserLogin();
            } catch (Exception) {
                console.log("exception", Exception);
                window.location = process.env.REACT_APP_ROUTE_BASE;
            }
            //console.log('userLoginSession',userLoginSession);

            if (userLoginSession == null) {
                window.location = process.env.REACT_APP_ROUTE_BASE;
            } else {
                panelContext.setUserLogin(userLoginSession);

                localStorageService.getUserLogin().clients.forEach((element) => {
                    _menu.push({
                        label: element.nombre,
                        command: () => {
                            panelContext.setSelectedEntityId(element.id_tabla);
                            panelContext.setSelectedCarteraId(element.idcartera);
                            window.location = "#/admin/gestion/" + element.id_tabla;
                        },
                    });
                });
                setMenu([{ label: "GESTIÓN ", items: _menu }]);
            }
        } else {
            //console.log('Contiene valor context')
            panelContext.userLogin.clients.forEach((element) => {
                _menu.push({
                    label: element.nombre,
                    command: () => {
                        panelContext.setSelectedEntityId(element.id_tabla);
                        panelContext.setSelectedCarteraId(element.idcartera);
                        window.location = "#/admin/gestion/" + element.id_tabla;
                    },
                });
            });
            setMenu([{ label: "GESTIÓN ", items: _menu }]);
        }
    }, []);

    const onInputStyleChange = (inputStyle) => {
        setInputStyle(inputStyle);
    };

    const onRipple = (e) => {
        PrimeReact.ripple = e.value;
        setRipple(e.value);
    };

    const onLayoutModeChange = (mode) => {
        setLayoutMode(mode);
    };

    const onColorModeChange = (mode) => {
        setLayoutColorMode(mode);
    };

    const onWrapperClick = (event) => {
        if (!menuClick) {
            setOverlayMenuActive(false);
            setMobileMenuActive(false);
        }
        menuClick = false;
    };

    const onToggleMenu = (event) => {
        menuClick = true;

        if (isDesktop()) {
            if (layoutMode === "overlay") {
                setOverlayMenuActive((prevState) => !prevState);
            } else if (layoutMode === "static") {
                setStaticMenuInactive((prevState) => !prevState);
            }
        } else {
            setMobileMenuActive((prevState) => !prevState);
        }
        event.preventDefault();
    };

    const onSidebarClick = () => {
        menuClick = true;
    };

    const onMenuItemClick = (event) => {
        if (!event.item.items) {
            setOverlayMenuActive(false);
            setMobileMenuActive(false);
        }
    };

    const addClass = (element, className) => {
        if (element.classList) element.classList.add(className);
        else element.className += " " + className;
    };

    const removeClass = (element, className) => {
        if (element.classList) element.classList.remove(className);
        else element.className = element.className.replace(new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };

    const isDesktop = () => {
        return window.innerWidth > 1024;
    };

    const isSidebarVisible = () => {
        if (isDesktop()) {
            if (layoutMode === "static") return !staticMenuInactive;
            else if (layoutMode === "overlay") return overlayMenuActive;
            else return true;
        }

        return true;
    };

    //const logo = layoutColorMode === 'dark' ? 'assets/layout/images/logo-white.svg' : 'assets/layout/images/logo.svg';
    const logo = layoutColorMode === "dark" ? "assets/layout/images/logo-cp.png" : "assets/layout/images/logo-cp.png";

    const wrapperClass = classNames("layout-wrapper", {
        "layout-overlay": layoutMode === "overlay",
        "layout-static": layoutMode === "static",
        "layout-static-sidebar-inactive": staticMenuInactive && layoutMode === "static",
        "layout-overlay-sidebar-active": overlayMenuActive && layoutMode === "overlay",
        "layout-mobile-sidebar-active": mobileMenuActive,
        "p-input-filled": inputStyle === "filled",
        "p-ripple-disabled": ripple === false,
    });

    const sidebarClassName = classNames("layout-sidebar", {
        "layout-sidebar-dark": layoutColorMode === "dark",
        "layout-sidebar-light": layoutColorMode === "light",
    });
    const renderFooter = (name) => {
        return (
            <div>
                <Button label="Cancelar" icon="pi pi-times" className="p-button-text" />
                <Button label="Guardar" icon="pi pi-check" autoFocus />
            </div>
        );
    };

    //<AppProfile />
    return (
        <React.Fragment>
            {panelContext.userLogin && (
                <div className={wrapperClass} onClick={onWrapperClick}>
                    <AppTopbar user={panelContext.userLogin} onToggleMenu={onToggleMenu} />

                    <CSSTransition classNames="layout-sidebar" timeout={{ enter: 200, exit: 200 }} in={isSidebarVisible()} unmountOnExit>
                        <div ref={sidebar} className={sidebarClassName} onClick={onSidebarClick}>
                            <div className="layout-logo">
                                <h5 className="p-mr-6 p-ml-6" style={{ color: "white", fontSize: "14px" }}>
                                    SISTEMA DE GESTIÓN DE CARTERAS Y COBRANZAS
                                </h5>
                            </div>
                            <div style={{ border: "1px solid #607d8b", marginLeft: "4px" }} className="p-ml-3  p-mr-3"></div>
                            <AppMenu model={menu} onMenuItemClick={onMenuItemClick} />
                        </div>
                    </CSSTransition>

                    <div className="layout-main">
                        <Switch>
                            <Route path="/admin/gestion/:entityId?" exact component={PanelGestion} />
                            <Route path="/admin/vcdial/:paramIdentity?/:paramTelefono?" exact component={PanelGestion} />
                        </Switch>

                        {/*   
                               <Route path="/admin/gestion/:entityId?/:numDoc?" exact component={PanelGestion} />
                               */}
                    </div>
                </div>
            )}
        </React.Fragment>
    );
};
export default App;
