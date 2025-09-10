import { useState, useEffect, useContext } from "react";
// import classNames from "classnames";

import { useHistory } from "react-router-dom";
import { Button } from "primereact/button";
// import PrimeReact from "primereact/api";
import { Divider } from "primereact/divider";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "prismjs/themes/prism-coy.css";
import "@fullcalendar/core/main.css";
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/timegrid/main.css";
import "./layout/flags/flags.css";
import "./layout/layout.scss";
import "./AppLogin.css";
import { InputText } from "primereact/inputtext";
import { LoginService } from "./service/LoginService";
import { LocalStorageService } from "./service/LocalStorageService";
import PanelContext from "./context/Panel/PanelContext";
import { Password } from "primereact/password";
import { SIPContext } from "./context/JsSIP/JsSIPContext";
import { Toast } from "primereact/toast";

const AppLogin = () => {
    const { toastJsIP } = useContext(SIPContext);

    const history = useHistory();
    // const [layoutMode, setLayoutMode] = useState("static");
    // const [layoutColorMode, setLayoutColorMode] = useState("dark");
    // const [staticMenuInactive, setStaticMenuInactive] = useState(false);
    // const [overlayMenuActive, setOverlayMenuActive] = useState(false);
    const [mobileMenuActive] = useState(false);
    // const [inputStyle, setInputStyle] = useState("outlined");
    // const [ripple, setRipple] = useState(false);
    // const [showRegister, setShowRegister] = useState(false);
    // const sidebar = useRef();

    const [mensaje, setMensaje] = useState(null);
    // let menuClick = false;
    const panelContext = useContext(PanelContext);

    const [login, setLogin] = useState({ user: "", password: "" });

    useEffect(() => {
        addClass(document.body, "body-overflow-hidden-login");
    }, [mobileMenuActive]);

    const handleClick = () => {
        new LoginService().logIn(login).then((response) => {
            if (response.status == 0) {
                let lsService = new LocalStorageService();
                lsService.setToken(response.body);
                panelContext.setUserLogin(response.body);

                history.push("/admin/gestion");
            } else if (response.status == 2) {
                setMensaje(response.body);
                console.log(response.minTime);
                console.log(response.maxTime);
                console.log(response.currentTime);
            } else {
                setMensaje(response.body);
            }
        });
    };

    // const onInputStyleChange = (inputStyle) => {
    //     setInputStyle(inputStyle);
    // };

    // const onRipple = (e) => {
    //     PrimeReact.ripple = e.value;
    //     setRipple(e.value);
    // };

    // const onLayoutModeChange = (mode) => {
    //     setLayoutMode(mode);
    // };

    // const onColorModeChange = (mode) => {
    //     setLayoutColorMode(mode);
    // };

    // const onWrapperClick = (event) => {
    //     if (!menuClick) {
    //         setOverlayMenuActive(false);
    //         setMobileMenuActive(false);
    //     }
    //     menuClick = false;
    // };

    // const onToggleMenu = (event) => {
    //     menuClick = true;

    //     if (isDesktop()) {
    //         if (layoutMode === "overlay") {
    //             setOverlayMenuActive((prevState) => !prevState);
    //         } else if (layoutMode === "static") {
    //             setStaticMenuInactive((prevState) => !prevState);
    //         }
    //     } else {
    //         setMobileMenuActive((prevState) => !prevState);
    //     }
    //     event.preventDefault();
    // };

    // const onSidebarClick = () => {
    //     menuClick = true;
    // };

    // const onMenuItemClick = (event) => {
    //     if (!event.item.items) {
    //         setOverlayMenuActive(false);
    //         setMobileMenuActive(false);
    //     }
    // };

    const addClass = (element, className) => {
        if (element.classList) element.classList.add(className);
        else element.className += " " + className;
    };

    // const removeClass = (element, className) => {
    //     if (element.classList) element.classList.remove(className);
    //     else element.className = element.className.replace(new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    // };

    // const isDesktop = () => {
    //     return window.innerWidth > 1024;
    // };

    // const isSidebarVisible = () => {
    //     if (isDesktop()) {
    //         if (layoutMode === "static") return !staticMenuInactive;
    //         else if (layoutMode === "overlay") return overlayMenuActive;
    //         else return true;
    //     }

    //     return true;
    // };

    // const logo = layoutColorMode === "dark" ? "assets/layout/images/logo-white.svg" : "assets/layout/images/logo.svg";

    // const wrapperClass = classNames("layout-wrapper", {
    //     "layout-overlay": layoutMode === "overlay",
    //     "layout-static": layoutMode === "static",
    //     "layout-static-sidebar-inactive": staticMenuInactive && layoutMode === "static",
    //     "layout-overlay-sidebar-active": overlayMenuActive && layoutMode === "overlay",
    //     "layout-mobile-sidebar-active": mobileMenuActive,
    //     "p-input-filled": inputStyle === "filled",
    //     "p-ripple-disabled": ripple === false,
    // });

    // const sidebarClassName = classNames("layout-sidebar", {
    //     "layout-sidebar-dark": layoutColorMode === "dark",
    //     "layout-sidebar-light": layoutColorMode === "light",
    // });

    return (
        <>
            <Toast ref={toastJsIP} />
            <div className="container" id="container" style={{ minHeight: 500 }}>
                <div className="wrap-login100">
                    <div className="login100-form-title" style={{ backgroundImage: "url(assets/layout/images/bg-01.png)" }}>
                        <span className="login100-form-title-1"></span>
                    </div>
                    <div className="p-d-flex">
                        <div className="p-mt-5 p-ml-5">
                            <img alt="Logo" height="50" src="assets/layout/images/logo.png" />
                        </div>
                        <div className="p-mt-5 p-ml-5">
                            <span style={{ color: "#607d8b", fontWeight: 700, fontSize: 18, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif' }}>Cobranzas Perú</span>
                            <br />
                            <span style={{ color: "#607d8b", fontWeight: 700, fontSize: 16, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif' }}>SISTEMA DE GESTIÓN DE CARTERAS Y COBRANZAS</span>
                        </div>
                    </div>

                    <Divider />
                    <div className="p-fluid p-p-6">
                        <div className="p-field p-grid">
                            <label htmlFor="firstname4" className="p-col-12 p-md-2">
                                Usuario
                            </label>
                            <div className="p-col-12 p-md-10">
                                <InputText id="firstname4" onChange={(e) => setLogin({ ...login, user: e.target.value })} type="text" />
                            </div>
                        </div>
                        <div className="p-field p-grid">
                            <label htmlFor="lastname4" className="p-col-12 p-md-2">
                                Password
                            </label>
                            <div className="p-col-12 p-md-10">
                                <Password onChange={(e) => setLogin({ ...login, password: e.target.value })} feedback={false} />
                            </div>
                        </div>
                        {mensaje && (
                            <div className="p-field p-grid">
                                <label htmlFor="lastname4" className="p-col-12 p-md-2"></label>
                                <div className="p-col-12 p-md-10" style={{ color: "red" }}>
                                    {mensaje}
                                </div>
                            </div>
                        )}
                        <div className="p-field p-grid"></div>
                        <div className="p-fluid p-formgrid p-grid">
                            <div className="p-field p-col-12 p-md-9"></div>
                            <div className="p-field p-col-12 p-md-3">
                                <Button label="Iniciar Sesión" icon={"pi pi-send"} onClick={handleClick} className="p-button-rounded p-button-secondary" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
    //<AppFooter />
};

export default AppLogin;
