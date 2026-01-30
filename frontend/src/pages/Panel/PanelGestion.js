/* eslint-disable default-case */
/* eslint-disable no-lone-blocks */
/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable no-redeclare */
/* eslint-disable eqeqeq */
import React, { useState, useEffect, useRef, useContext } from "react";
import classNames from "classnames";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { TabView, TabPanel } from "primereact/tabview";
import { Toolbar } from "primereact/toolbar";
import { Menu } from "primereact/menu";
import "primeicons/primeicons.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.css";
import "primeflex/primeflex.css";
import PanelContext from "../../context/Panel/PanelContext";
import { DialogFilter } from "../../components/DialogFilter";
import { useParams } from "react-router";
import { SkeletonTable } from "../../components/SkeletonTable";
import { DialogFormGestion } from "../../components/DialogFormGestion";
import { DialogUpdateInfo } from "../../components/DialogUpdateInfo";
import { ButtonDialogPromesa } from "../../components/DialogPromesa";
import { InputTextarea } from "primereact/inputtextarea";
import { GestionService } from "../../service/GestionService";
import { SkeletonHistorial } from "../../components/SkeletonHistorial";
import { Skeleton } from "primereact/skeleton";
import { SelectButton } from "primereact/selectbutton";
import { MultiSelect } from "primereact/multiselect";
import NumberFormat from "react-number-format";
import { LoginService } from "../../service/LoginService";
import { LocalStorageService } from "../../service/LocalStorageService";
import { TotalNumber } from "../../components/TotalNumber";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { CommonService } from "../../service/CommonService";
import moment from "moment";
import { DialogFormJudicial } from "../../components/Judicial/DialogFormJudicial";
import { camposArchivos, camposSimples, judicialData, tiposBusqueda, valoresIniciales } from "../../components/Judicial/Components/Data/Data";
import axios from "axios";
import { SIPContext } from "../../context/JsSIP/JsSIPContext";
import { PhoneModal } from "../../components/JsSIP/PhoneModal";
import { GestionJsSIP } from "../../components/GestionJsSIP/GestionJsSIP";
import { Dropdown } from "primereact/dropdown";
import { DialogSMS } from "../../components/Omnicanal/DialogSMS";
import { DialogIVR } from "../../components/Omnicanal/DialogIVR";
import { DialogWhatsApp } from "../../components/Omnicanal/DialogWhatsApp";

export const PanelGestion = (props) => {
    const { selectedPhone, setSelectedPhone, toast, toastJsIP, showFormNewGestionRTC, showPhone, dialogGestion, setDialogGestion, showInfoCampo, setShowInfoCampo, formGestionType, setFormGestionType } = useContext(SIPContext);

    // const API_URL_DOWNLOAD = `${process.env.REACT_APP_ROUTE_API}download`;
    const API_URL_GESTION = `${process.env.REACT_APP_ROUTE_API}gestion`;

    //Local variables
    var { entityId, paramIdentity, paramTelefono } = useParams();
    const panelContext = useContext(PanelContext);

    //Variables services
    let gestionService = new GestionService();

    //variables useRef
    const toast2 = useRef(null);
    const toast3 = useRef(null);
    const dt = useRef(null);
    const [selectedProduct, setSelectedProduct] = useState(null);

    //Common form variables
    const [loading, setLoading] = useState(false);
    const [value2, setValue2] = useState(["CONTACTO INDIRECTO", "NO CONTACTO", "CONTACTO DIRECTO"]);
    const [totales, setTotales] = useState({ montot_sol: 0, montot_dol: 0, montoc_sol: 0, montoc_dol: 0, indexCS: 1 });

    const [customers, setCustomers] = useState([]);
    const [filter, setFilter] = useState(null);
    const [columnsGridMain, setColumnsGridMain] = useState(null);
    const [columnsPanel3, setColumnsPanel3] = useState([]);
    const [columnsPanel4, setColumnsPanel4] = useState([]);
    const [showLoading, setShowLoading] = useState(false);

    const [dataHistorial, setDataHistorial] = useState([]);
    const [dataHistorialFilter, setDataHistorialFilter] = useState([]);
    const [dataPromesa, setDataPromesa] = useState([]);
    const [dataAgendamientos, setDataAgendamientos] = useState([]);

    const [dataDirecciones, setDataDirecciones] = useState([]);
    const [dataPagos, setDataPagos] = useState([]);
    const [dataCuotas, setDataCuotas] = useState([]);
    const [dataCampanas, setDataCampanas] = useState([]);
    const [dataProgramaciones, setDataProgramaciones] = useState([]);

    // ============================= REQUERIMIENTO CARLOS =============================
    const [dataTercerosByIdentificador, setDataTercerosByIdentificador] = useState([]);
    // ============================= REQUERIMIENTO CARLOS =============================

    /* data for autoplanCuotas */
    const [dataCuotasAutoplanNoAdjudicado, setDataCuotasAutoplanNoAdjudicado] = useState([]);

    const [showColumnName, setShowColumnName] = useState(true);
    const [showDetails, setShowDetails] = useState(false);

    //Dialog variables
    const [dialogForm, setDialogForm] = useState(false);
    const [dialogDelete, setDialogDelete] = useState(false);
    const [dialogProgramGestion, setDialogProgramGestion] = useState(false);
    const [dialogPromesas, setDialogPromesas] = useState(false);
    const [dialogDireccion, setDialogDireccion] = useState(false);
    const [dialogPagos, setDialogPagos] = useState(false);
    const [dialogCuotas, setDialogCuotas] = useState(false);
    const [dialogCampanas, setDialogCampanas] = useState(false);
    const [dialogInfoadicional, setDialogInfoadicional] = useState(false);
    const [dialogFiltro, setDialogFiltro] = useState(false);

    // ============================= REQUERIMIENTO CARLOS =============================
    const [dialogTercerosByIdentificador, setDialogTercerosByIdentificador] = useState(false);
    // ============================= REQUERIMIENTO CARLOS =============================

    /* data for autoplanCuotas */
    const [dialogCuotasAutoplanNoAdjudicado, setDialogCuotasAutoplanNoAdjudicado] = useState(false);

    //Dialog Formularios
    const [dialogActualizar, setDialogActualizar] = useState(false);
    const [showInfoDireccion, setShowInfoDireccion] = useState(false);

    const [lastObservation, setLastObservation] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);

    const [nameCliente, setNameCliente] = useState("");

    // ========================= REQUERIMIENTO ESTADO DE ANIMO =========================
    const [estadoAnimoCliente, setEstadoAnimoCliente] = useState([]);
    const [respuestasCliente, setrespuestasCliente] = useState([]);
    // ========================= REQUERIMIENTO ESTADO DE ANIMO =========================

    {
        /* ==================== REQUERIMIENTO OMNICANAL ==================== */
    }

    const [dialogWhatsApp, setDialogWhatsApp] = useState(false);
    const [dialogSMS, setDialogSMS] = useState(false);
    const [dialogIVR, setDialogIVR] = useState(false);

    const [textoWhatsApp, setTextoWhatsApp] = useState("");
    const [textoSMS, setTextoSMS] = useState("");
    const [textoIVR, setTextoIVR] = useState("");

    const toastSMS = useRef(null);
    const toastWhatsApp = useRef(null);
    const toastIVR = useRef(null);

    {
        /* ==================== REQUERIMIENTO OMNICANAL ==================== */
    }

    // ======================== REQUERIMIENTO PEDRO ========================

    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(null);
    const [selectedFuenteFilter, setSelectedFuenteFilter] = useState(null);
    const [searchType, setSearchType] = useState(null);

    const filteredTelefonos = panelContext?.dataTelefonos?.filter((t) => {
        const matchCategory = selectedCategoryFilter ? t.categoria === selectedCategoryFilter : true;
        const matchFuente = selectedFuenteFilter ? t.FUENTE === selectedFuenteFilter : true;
        return matchCategory && matchFuente;
    });

    // ======================== REQUERIMIENTO PEDRO ========================

    // ========================== REQUERIMIENTO OMNICANAL ==========================

    const canalBodyTemplate = (rowData) => {
        return (
            <div className="p-d-flex p-ai-center">
                {/* WHATSAPP */}
                <Button
                    icon="pi pi-whatsapp"
                    className="p-button-rounded p-button-success p-button-text p-mr-2"
                    tooltip="Enviar WhatsApp"
                    tooltipOptions={{ position: "bottom" }}
                    style={{ border: "1px solid #25D366" }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setDialogWhatsApp(true);
                    }}
                />

                {/* LLAMAR */}
                <Button
                    icon="pi pi-phone"
                    className="p-button-rounded p-button-secondary p-button-text p-mr-2"
                    tooltip="Llamar"
                    tooltipOptions={{ position: "bottom" }}
                    style={{ border: "1px solid #6c757d" }}
                    onClick={(e) => {
                        e.stopPropagation();
                        showFormNewGestionRTC(rowData.NUMERO);
                    }}
                />

                {/* SMS */}
                <Button
                    icon="pi pi-comment"
                    className="p-button-rounded p-button-secondary p-button-text p-mr-2"
                    tooltip="Enviar SMS"
                    tooltipOptions={{ position: "bottom" }}
                    style={{ border: "1px solid #6c757d" }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setDialogSMS(true);
                    }}
                />

                {/* IVR */}
                <Button
                    icon="pi pi-volume-up"
                    className="p-button-rounded p-button-secondary p-button-text"
                    tooltip="Enviar IVR"
                    tooltipOptions={{ position: "bottom" }}
                    style={{ border: "1px solid #6c757d" }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setDialogIVR(true);
                    }}
                />
            </div>
        );
    };

    // ========================== REQUERIMIENTO OMNICANAL ==========================

    const onDialogGestion = () => {
        setFormGestionType(1);
        setShowInfoCampo(false);
        setDialogGestion(true);
    };

    const onDialogGestionTelefono = () => {
        setFormGestionType(2);
        setShowInfoCampo(true);
        setDialogGestion(true);
    };

    const onDialogGestionMulticanal = () => {
        setFormGestionType(3);
        setShowInfoCampo(false);
        setDialogGestion(true);
    };

    // ========================= REQUERIMIENTO ESTADO DE ANIMO =========================
    // Renderizar Emoticon
    const renderEmojiEstadoAnimo = (rowData) => {
        const { id_estado_animo } = rowData;

        // Determina el emoji
        let emoji = "❓";
        if (id_estado_animo === 0) emoji = "😊";
        else if (id_estado_animo === 1) emoji = "😡";
        else if (id_estado_animo === 2) emoji = "😤";

        // Estilos de fondo condicional
        const backgroundColor = id_estado_animo === 1 ? "#ffe5e5" : id_estado_animo === 2 ? "#ffe5e5" : "transparent";

        // Animacion de palpitado
        const animationClass = id_estado_animo === 1 || id_estado_animo === 2 ? "emoji-pulse" : "";

        return (
            <div
                style={{
                    backgroundColor,
                    borderRadius: "4px",
                    padding: "4px",
                    textAlign: "center",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
                className={animationClass}
            >
                {emoji}
            </div>
        );
    };
    // ========================= REQUERIMIENTO ESTADO DE ANIMO =========================

    // ================= REQUERIMIENTO CARLOS DESCARGAR A CSV GESTIONES =================

    // Util: escapa valores CSV
    const csvEscape = (value) => {
        if (value === null || value === undefined) return "";
        const str = String(value);
        // Si contiene comas, comillas, saltos de línea o comienza con =,+,-,@ (para evitar fórmulas), lo envolvemos en comillas
        const needsQuotes = /[",\n\r]/.test(str) || /^[=+\-@]/.test(str);
        const escaped = str.replace(/"/g, '""');
        return needsQuotes ? `"${escaped}"` : escaped;
    };

    // Util: genera CSV a partir de una lista de objetos
    const toCSV = (rows) => {
        if (!rows || rows.length === 0) return "";
        // Columnas: todas las keys del primer objeto (ajusta si quieres un orden/selección específicos)
        const headers = Object.keys(rows[0]);
        const head = headers.map(csvEscape).join(",");
        const body = rows.map((r) => headers.map((h) => csvEscape(r[h])).join(",")).join("\r\n");
        return `${head}\r\n${body}`;
    };

    // Nombres de tabs para el archivo
    const tabNames = ["LLAMADA", "CAMPO", "MULTICANAL", "PROMESAS", "AGENDAMIENTO"];

    // Obtiene las filas del tab activo, aplicando filtro del MultiSelect si corresponde
    const getActiveTabRows = () => {
        let base = [];
        switch (activeIndex) {
            case 0:
                base = dataHistorial.filter((x) => x.accion_tipo === 1);
                break;
            case 1:
                base = dataHistorial.filter((x) => x.accion_tipo === 2);
                break;
            case 2:
                base = dataHistorial.filter((x) => x.accion_tipo === 3);
                break;
            case 3:
                base = Array.isArray(dataPromesa) ? dataPromesa : [];
                break;
            case 4:
                // Si tienes data para AGENDAMIENTO, reemplaza esta línea:
                base = Array.isArray(dataAgendamientos) ? dataAgendamientos : [];
                break;
            default:
                base = [];
        }

        // Aplica filtro por MultiSelect (HOMOLO) si existe
        if (Array.isArray(value2) && value2.length > 0) {
            base = base.filter((row) => value2.includes(row?.HOMOLO));
        }

        return base;
    };

    // Descarga CSV
    const handleDownloadCSV = () => {
        const rows = getActiveTabRows();
        if (!rows || rows.length === 0) {
            // Puedes mostrar un toast si usas PrimeToast
            toast.current.show({ severity: "warn", summary: "Sin datos", detail: "No hay registros para exportar." });
            return;
        }
        const csv = toCSV(rows);
        // BOM para Excel
        const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });

        const tabName = tabNames[activeIndex] || "TAB";
        const stamp = new Date()
            .toISOString()
            .replace("T", "_")
            .replace(/[:.].*$/, "")
            .replace(/:/g, "");
        const filename = `historial_${tabName}_${stamp}.csv`;

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // ================= REQUERIMIENTO CARLOS DESCARGAR A CSV GESTIONES =================

    const onDialogActualizarTelefono = (selectCustomer) => {
        setShowInfoDireccion(false);
        setDialogActualizar(true);
    };

    const onDialogActualizarDireccion = (selectCustomer) => {
        setShowInfoDireccion(true);
        setDialogActualizar(true);
    };

    const stateBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <span>{rowData.OBSERVACION}</span>
            </React.Fragment>
        );
    };

    const stateBodyTemplatePhone = (rowData) => {
        return (
            <div className="telefono-cell">
                <span>{rowData.NUMERO}</span>
                {/* <Button
                    icon="pi pi-phone"
                    className="p-button-rounded p-button-text telefono-btn"
                    style={{
                        position: "absolute",
                        right: "-10%",
                        top: "50%",
                        transform: "translateY(-50%)",
                    }}
                    onClick={() => showFormNewGestionRTC(rowData.NUMERO)}
                    tooltip="Marcar"
                    tooltipOptions={{ position: "top" }}
                /> */}
            </div>
        );
    };

    const stateBodyTemplateAV = (rowData) => {
        return (
            <React.Fragment>
                <span>{rowData.observacion}</span>
            </React.Fragment>
        );
    };

    // style for row in SCORE TELEFONOS
    const rowClass = (rowData) => {
        return { "state-row status-4naranja": rowData.COLOR === "4naranja" };
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <form>
                    <InputText id="firstname1" onKeyPress={handleKeypress} placeholder="Búsqueda" type="text" onChange={(e) => setFilter(e.target.value)} />

                    <Button label="Buscar" type="submit" icon="pi pi-search" onClick={filterSearch} className="p-ml-2 p-button-secondary p-button-sm" />
                </form>
                <Divider layout="vertical"></Divider>
                <div className="p-grid p-justify-center">
                    <span style={{ paddingLeft: 10, paddingRight: 10, paddingTop: 10, fontWeight: 600, color: "#607d8b" }}>Cliente : {nameCliente}</span>
                </div>
                <Divider layout="vertical"></Divider>
                <Button
                    label=" Gest. Teléfono"
                    icon="pi pi-phone"
                    onClick={() => {
                        if (selectedPhone == null) {
                            toast.current.show({ severity: "warn", summary: "Información", detail: "Seleccione un teléfono" });
                            return;
                        }
                        onDialogGestion();
                    }}
                    className="p-button-raised p-button-secondary p-mt-2 p-ml-2 p-button-sm"
                />
                <Button
                    label=" Gest. Campo"
                    icon="pi pi-fw pi-envelope"
                    onClick={() => {
                        onDialogGestionTelefono();
                    }}
                    className="p-button-raised p-button-secondary p-mt-2 p-ml-2 p-button-sm"
                />
                <Button
                    label=" Gest. MultiCanal"
                    icon="pi pi-fw pi-th-large"
                    onClick={() => {
                        if (selectedPhone == null) {
                            toast.current.show({ severity: "warn", summary: "Información", detail: "Seleccione un teléfono" });
                            return;
                        }
                        onDialogGestionMulticanal();
                    }}
                    className="p-button-raised p-button-secondary p-mt-2 p-ml-2 p-button-sm"
                />
            </React.Fragment>
        );
    };

    const footer = `Exigible S/. 9,946.57  Exigible $: 0.00`;

    const rightToolbarTemplate = () => {
        return (
            <div>
                <Button icon="pi pi-file-excel" className="p-button-rounded  p-button-danger p-button-outlined" tooltipOptions={{ position: "bottom" }} tooltip="Exportar grilla a excel" />
                <Button
                    icon="pi pi-filter"
                    className="p-button-rounded  p-button-danger p-button-outlined p-ml-2"
                    tooltipOptions={{ position: "bottom" }}
                    tooltip="Filtro de gestion"
                    onClick={() => {
                        setDialogFiltro(true);
                    }}
                />
                <Button
                    icon="pi pi-calendar"
                    onClick={() => {
                        new GestionService().getProgramacion(panelContext.selectedEntityId, panelContext.userLogin.IDPERSONAL).then((data) => {
                            setDataProgramaciones(data);
                        });
                        setDialogProgramGestion(true);
                    }}
                    tooltipOptions={{ position: "bottom" }}
                    tooltip="Programación de gestion"
                    className={dataProgramaciones && dataProgramaciones.length > 0 ? "p-button-rounded p-button-danger p-ml-2 blinking" : "p-button-rounded p-button-danger p-button-outlined p-ml-2"}
                />

                {/* BUTTON FOR AUTOPLAN ADJUDICADO */}
                {panelContext.selectedCarteraId && panelContext.selectedCarteraId == 69 && (
                    <Button
                        icon="pi pi-tags"
                        onClick={() => {
                            if (selectedProduct && selectedProduct.NUMEROCUENTA) {
                                new GestionService().getCuotasAutoplanNoAdjudicado(selectedProduct.NUMEROCUENTA).then((data) => {
                                    setDataCuotasAutoplanNoAdjudicado(data);
                                });
                                setDialogCuotasAutoplanNoAdjudicado(true);
                            }
                        }}
                        tooltipOptions={{ position: "bottom" }}
                        tooltip="Cuotas Autoplan NA"
                        className={dataCuotasAutoplanNoAdjudicado && dataCuotasAutoplanNoAdjudicado.length > 0 ? "p-button-rounded p-button-danger p-ml-2 blinking" : "p-button-rounded p-button-danger p-button-outlined p-ml-2"}
                    />
                )}

                {/* FINBUTTON FOR AUTOPLAN ADJUDICADO */}

                <Button
                    icon="pi pi-map"
                    onClick={() => {
                        setDialogDireccion(true);
                    }}
                    tooltipOptions={{ position: "bottom" }}
                    tooltip="Direcciones"
                    className={showDetails && dataDirecciones.length > 0 ? "p-button-rounded p-button-danger p-ml-2 " : "p-button-rounded p-button-danger p-button-outlined p-ml-2"}
                />
                <Button
                    icon="pi pi-money-bill"
                    onClick={() => {
                        setDialogPagos(true);
                    }}
                    tooltipOptions={{ position: "bottom" }}
                    tooltip="Pagos"
                    className={showDetails && dataPagos.length > 0 ? "p-button-rounded p-button-danger p-ml-2 " : "p-button-rounded p-button-danger  p-button-outlined p-ml-2"}
                />
                <Button
                    icon="pi pi-tags"
                    onClick={() => {
                        setDialogCuotas(true);
                    }}
                    tooltipOptions={{ position: "bottom" }}
                    tooltip="Cuotas"
                    className={showDetails && dataCuotas.length > 0 ? "p-button-rounded p-button-danger p-ml-2 " : "p-button-rounded p-button-danger  p-button-outlined p-ml-2"}
                />
                <Button
                    icon="pi pi-chart-line"
                    onClick={() => {
                        setDialogCampanas(true);
                    }}
                    tooltipOptions={{ position: "bottom" }}
                    tooltip="Campañas"
                    className={showDetails && dataCampanas.length > 0 ? "p-button-rounded p-button-danger p-ml-2 blinking" : "p-button-rounded p-button-danger p-button-outlined p-ml-2"}
                />

                <Button
                    icon="pi pi-comments"
                    onClick={() => {
                        setDialogCampanas(true);
                    }}
                    tooltipOptions={{ position: "bottom" }}
                    tooltip="Speech"
                    className={showDetails && false ? "p-button-rounded p-button-danger p-ml-2 blinking" : "p-button-rounded p-button-danger p-button-outlined p-ml-2"}
                />

                {/* ============================= REQUERIMIENTO CARLOS ============================= */}
                <Button
                    icon="pi pi-clone"
                    onClick={() => {
                        setDialogTercerosByIdentificador(true);
                    }}
                    tooltipOptions={{ position: "bottom" }}
                    tooltip="Avales"
                    className={dataTercerosByIdentificador && dataTercerosByIdentificador.length > 0 ? "p-button-rounded p-button-danger p-ml-2 blinking" : "p-button-rounded p-button-danger p-button-outlined p-ml-2"}
                />
                {/* ============================= REQUERIMIENTO CARLOS ============================= */}
            </div>
        );
    };

    const handleKeypress = (e) => {
        if (e.keyCode === 13) {
            filterSearch();
        }
    };

    const calculateTotales = (result) => {
        let montos = result.reduce(
            (counter, obj) => {
                counter.montot_sol += obj.MONEDA == "SOL" && parseFloat(obj.MONTOACOBRAR);
                counter.montot_dol += obj.MONEDA == "USD" && parseFloat(obj.MONTOACOBRAR);
                counter.montoc_sol += obj.MONEDA == "SOL" && parseFloat(obj.MONTOCAMPANA);
                counter.montoc_dol += obj.MONEDA == "USD" && parseFloat(obj.MONTOCAMPANA);
                counter.montop_sol += obj.MONEDA == "SOL" && parseFloat(obj.PORDESCUENTO);
                counter.montop_dol += obj.MONEDA == "USD" && parseFloat(obj.PORDESCUENTO);
                counter.montode_sol += obj.MONEDA == "SOL" && parseFloat(obj.DEUDATOTAL);
                counter.montode_dol += obj.MONEDA == "USD" && parseFloat(obj.DEUDATOTAL);
                counter.montoca_sol += obj.MONEDA == "SOL" && parseFloat(obj.CAPITAL);
                counter.montoca_dol += obj.MONEDA == "USD" && parseFloat(obj.CAPITAL);
                counter.montosa_sol += obj.MONEDA == "SOL" && parseFloat(obj.SALDOPORPAGAR);
                counter.montosa_dol += obj.MONEDA == "USD" && parseFloat(obj.SALDOPORPAGAR);
                return counter;
            },
            { montot_sol: 0, montot_dol: 0, montoc_sol: 0, montoc_dol: 0, montop_sol: 0, montop_dol: 0, montode_sol: 0, montode_dol: 0, montoca_sol: 0, montoca_dol: 0, montosa_sol: 0, montosa_dol: 0 }
        );

        montos.indexCS = columnsGridMain ? columnsGridMain.findIndex((c) => c.field == "MONTOACOBRAR") : 1;
        //console.log('montos 1', result, montos);
        setTotales(montos);
    };

    const filterSearch = (e) => {
        e.preventDefault();
        setShowLoading(true);
        let gestionservice = new GestionService();
        setShowDetails(false);
        panelContext.setTelefonos([]);
        setLastObservation("");
        panelContext.setSelectedPhone(null);
        gestionservice.getFilter(filter, panelContext.selectedEntityId).then((data) => {
            setShowLoading(false);
            setDataPromesa([]);
            setDataHistorial([]);
            setDataHistorialFilter([]);
            setDataAgendamientos([]);

            // Tipo de busqueda
            setSearchType(data.typeResult);

            let arr = data.result.reduce((hash, obj) => {
                if (obj["NOMBRE"] === undefined || Object.keys(hash).length > 2) return hash;
                return Object.assign(hash, { [obj["NOMBRE"]]: (hash[obj["NOMBRE"]] || []).concat(obj.identificador) });
            }, {});

            setShowColumnName(Object.keys(arr).length > 1);

            setCustomers(data.result);
            calculateTotales(data.result);
        });
    };

    const filterGestion = (post) => {
        setShowLoading(true);
        setShowDetails(false);
        new GestionService().filterGestion(post).then((data) => {
            setShowLoading(false);
            setDataPromesa([]);
            setDataHistorial([]);
            setDataHistorialFilter([]);
            setDataAgendamientos([]);
            setCustomers(data.result);
            calculateTotales(data.result);
        });
    };

    const handleRefeshHistorial = () => {
        // const currentIdCarteraItem = panelContext.userLogin.clients.find(e => e.id_tabla = panelContext.selectedEntityId);
        // const currentIdCartera = currentIdCarteraItem.idcartera;

        // gestionService.getHistorialPromesa(panelContext.selectedEntityId, selectedProduct.identificador).then(
        // gestionService.getHistorialPromesa(currentIdCartera, selectedProduct.identificador).then(
        gestionService.getHistorialPromesa(panelContext.selectedCarteraId, selectedProduct.identificador).then((data) => {
            setDataHistorial(data.historial);
            setDataHistorialFilter(data.historial);
            setDataPromesa(Object.values(data.promesas));
        });

        const commonService = new CommonService();
        commonService.getAgendamientosByIdentificador(selectedProduct.identificador).then((data) => {
            setDataAgendamientos(data);
        });
    };

    const formatCurrency = (value) => {
        return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
    };

    const totalFormatNumber = (val) => {
        return <NumberFormat value={val} displayType={"text"} thousandSeparator={true} prefix={""} decimalScale={2} />;
    };

    const handleSelected = (e, entityId) => {
        panelContext.setTelefonos(null);
        panelContext.setSelectedCustomer(e.value);
        setActiveIndex(0);
        setValue2(["CONTACTO INDIRECTO", "NO CONTACTO", "CONTACTO DIRECTO"]);
        setSelectedProduct(e.value);
        setShowDetails(true);

        const gestionService = new GestionService();
        const commonService = new CommonService();

        const promesas = [
            gestionService.getTelefonos(e.value.documento),
            gestionService.getHistorialPromesa(panelContext.selectedCarteraId, e.value.identificador),
            gestionService.getDirecciones(e.value.documento),
            gestionService.getPagos(e.value.identificador, panelContext.selectedCarteraId),
            gestionService.getCuotas(e.value.identificador),
            gestionService.getCampanas(e.value.identificador),
            gestionService.getTerceros(e.value.identificador),
            commonService.getAgendamientosByIdentificador(e.value.identificador),
        ];

        Promise.all(promesas).then(([telefonos, historial, direcciones, pagos, cuotas, campanas, terceros, agendamientos]) => {
            // Telefonos
            panelContext.setTelefonos(telefonos);
            if (e.paramTelefono !== null) {
                const sTelefono = telefonos.find((d) => d["NUMERO"] == e.paramTelefono);
                setSelectedPhone(sTelefono);
                panelContext.setSelectedPhone(sTelefono);
            } else {
                panelContext.setSelectedPhone(null);
            }

            // Historial
            setDataHistorial(historial.historial);
            setDataHistorialFilter(historial.historial);
            setDataPromesa(Object.values(historial.promesas));
            const obs = historial.historial.filter((e) => e.accion_tipo == 1);
            setLastObservation(obs.length > 0 ? obs[0].OBSERVACION : "");

            // Otros
            setDataDirecciones(direcciones);
            setDataPagos(pagos);
            setDataCuotas(cuotas);
            setDataCampanas(campanas);
            setDataTercerosByIdentificador(terceros);
            setDataAgendamientos(agendamientos);

            if (campanas.length > 0) {
                toast.current.show({ severity: "info", summary: "Información", detail: "El cliente cuenta con campañas", life: 10000 });
            }
        });
    };

    // Obtenemos las SipCreds si hay sesion activa
    // useEffect(() => {
    //     if (panelContext.userLogin) {
    //         const sipCreds = {
    //             user: panelContext.userLogin.SIP_USER,
    //             pass: panelContext.userLogin.SIP_PASS,
    //             server: panelContext.userLogin.SIP_SERVER,
    //         };

    //         connect(sipCreds);
    //     }
    // }, []);

    useEffect(() => {
        let gestionservice = new GestionService();
        panelContext.setTelefonos(null);

        if (entityId != null) {
            // setFilter('')
            setCustomers([]);
            setSelectedProduct(null);
            let oLogin = new LocalStorageService().getUserLogin();
            /*Getting idcartera*/
            const currentIdCarteraItem = oLogin.clients.find((e) => e.id_tabla == entityId);
            new LocalStorageService().updateInfo({ ...oLogin, entityId: entityId, carteraId: currentIdCarteraItem.idcartera });
            panelContext.setSelectedEntityId(entityId);
            panelContext.setSelectedCarteraId(currentIdCarteraItem.idcartera);
            setNameCliente(oLogin.clients.find((r) => r.id_tabla == entityId) && oLogin.clients.find((r) => r.id_tabla == entityId).nombre);
            gestionservice.getEstructura(entityId).then((data) => {
                // NODE JS
                setColumnsGridMain(data.filter((e) => e.table_name == "1" || e.table_name == "2"));
                setColumnsPanel3(data.filter((e) => e.table_name == "3"));
                setColumnsPanel4(data.filter((e) => e.table_name == "4"));

                // PHP
                // setColumnsGridMain(data.filter((e) => e.table == "1" || e.table == "2"));
                // setColumnsPanel3(data.filter((e) => e.table == "3"));
                // setColumnsPanel4(data.filter((e) => e.table == "4"));
            });
        } else {
            let oLogin = new LocalStorageService().getUserLogin();
            let tempEntityId = null;
            let tempCarteraId = null;

            if (oLogin.hasOwnProperty("entityId")) {
                tempEntityId = oLogin.entityId;
                tempCarteraId = oLogin.carteraId;
            } else {
                tempEntityId = oLogin.clients[0].id_tabla;
                tempCarteraId = oLogin.clients[0].idcartera;
            }
            new LocalStorageService().updateInfo({ ...oLogin, entityId: tempEntityId, carteraId: tempCarteraId });
            setNameCliente(oLogin.clients.find((r) => r.id_tabla == tempEntityId) && oLogin.clients.find((r) => r.id_tabla == tempEntityId).nombre);
            panelContext.setSelectedEntityId(tempEntityId);
            panelContext.setSelectedCarteraId(tempCarteraId);
            gestionservice.getEstructura(tempEntityId).then((data) => {
                // NODE JS
                setColumnsGridMain(data.filter((e) => e.table_name == "1" || e.table_name == "2"));
                setColumnsPanel3(data.filter((e) => e.table_name == "3"));
                setColumnsPanel4(data.filter((e) => e.table_name == "4"));

                // PHP
                // setColumnsGridMain(data.filter((e) => e.table == "1" || e.table == "2"));
                // setColumnsPanel3(data.filter((e) => e.table == "3"));
                // setColumnsPanel4(data.filter((e) => e.table == "4"));

                if (paramIdentity != null) {
                    setShowLoading(true);
                    let gestionservice = new GestionService();
                    setShowDetails(false);
                    panelContext.setTelefonos([]);
                    setLastObservation("");
                    panelContext.setSelectedPhone(null);
                    gestionservice.getFilter(paramIdentity, tempEntityId).then((data) => {
                        setShowLoading(false);
                        setDataPromesa([]);
                        setDataHistorial([]);
                        setDataHistorialFilter([]);
                        let arr = data.result.reduce((hash, obj) => {
                            if (obj["NOMBRE"] === undefined || Object.keys(hash).length > 2) return hash;
                            return Object.assign(hash, { [obj["NOMBRE"]]: (hash[obj["NOMBRE"]] || []).concat(obj.identificador) });
                        }, {});

                        setShowColumnName(Object.keys(arr).length > 1);

                        setCustomers(data.result);
                        calculateTotales(data.result);
                        if (data.result.length > 0) {
                            //console.log('data.result[0]', data.result[0],);
                            handleSelected({ value: data.result[0], paramTelefono: paramTelefono }, tempEntityId);
                        } else {
                            console.warn("Busqueda Temporal en", tempEntityId);
                            toast.current.show({ severity: "warn", summary: "Información", detail: "No se encontró información para el identificador " + paramIdentity });
                        }
                    });
                }
            });
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [entityId]);

    // ========================= REQUERIMIENTO PEDRO =========================

    useEffect(() => {
        setSelectedCategoryFilter(null);
        setSelectedFuenteFilter(null);
    }, [panelContext.selectedCustomer]);

    // ========================= REQUERIMIENTO PEDRO =========================

    //************************** REPROGRAMATIONS (NEW) ********************** /

    const handleReprogramacionInfo = (paramIdentity) => {
        let gestionservice = new GestionService();
        panelContext.setTelefonos(null);

        let oLogin = new LocalStorageService().getUserLogin();
        let tempEntityId = null;
        let tempCarteraId = null;

        if (oLogin.hasOwnProperty("entityId")) {
            tempEntityId = oLogin.entityId;
            tempCarteraId = oLogin.carteraId;
        } else {
            tempEntityId = oLogin.clients[0].id_tabla;
            tempCarteraId = oLogin.clients[0].idcartera;
        }
        new LocalStorageService().updateInfo({ ...oLogin, entityId: tempEntityId, carteraId: tempCarteraId });

        setNameCliente(oLogin.clients.find((r) => r.id_tabla == tempEntityId) && oLogin.clients.find((r) => r.id_tabla == tempEntityId).nombre);
        panelContext.setSelectedEntityId(tempEntityId);
        panelContext.setSelectedCarteraId(tempCarteraId);
        gestionservice.getEstructura(tempEntityId).then((data) => {
            // NODE JS
            setColumnsGridMain(data.filter((e) => e.table_name == "1" || e.table_name == "2"));
            setColumnsPanel3(data.filter((e) => e.table_name == "3"));
            setColumnsPanel4(data.filter((e) => e.table_name == "4"));

            // PHP
            // setColumnsGridMain(data.filter((e) => e.table == "1" || e.table == "2"));
            // setColumnsPanel3(data.filter((e) => e.table == "3"));
            // setColumnsPanel4(data.filter((e) => e.table == "4"));

            if (paramIdentity != null) {
                setShowLoading(true);
                let gestionservice = new GestionService();
                setShowDetails(false);
                panelContext.setTelefonos([]);
                setLastObservation("");
                panelContext.setSelectedPhone(null);
                gestionservice.getFilter(paramIdentity, tempEntityId).then((data) => {
                    setShowLoading(false);
                    setDataPromesa([]);
                    setDataHistorial([]);
                    setDataHistorialFilter([]);
                    let arr = data.result.reduce((hash, obj) => {
                        if (obj["NOMBRE"] === undefined || Object.keys(hash).length > 2) return hash;
                        return Object.assign(hash, { [obj["NOMBRE"]]: (hash[obj["NOMBRE"]] || []).concat(obj.identificador) });
                    }, {});

                    setShowColumnName(Object.keys(arr).length > 1);

                    setCustomers(data.result);
                    calculateTotales(data.result);
                    if (data.result.length > 0) {
                        //console.log('data.result[0]', data.result[0],);
                        handleSelected({ value: data.result[0], paramTelefono: null }, tempEntityId);
                    } else {
                        console.warn("Busqueda Temporal en", tempEntityId);
                        toast.current.show({ severity: "warn", summary: "Información", detail: "No se encontró información para el identificador " + paramIdentity });
                    }
                });
            } else {
                console.log("paramIdentity no es válido", paramIdentity);
            }
        });
    };

    const timeoutRef = useRef(null);
    const shouldRenderTabPanel = panelContext.selectedCarteraId && panelContext.selectedCarteraId === 75;

    // SETTIMEOUT AND 15MIN ALERT
    const handleProgramaciones = (data) => {
        const now = moment();

        // console.log("Fecha y hora actuales: " + now.format('YYYY-MM-DD HH:mm:ss'));
        // console.log("Fecha y hora programacion: " + moment(data[5].fecha_programacion).format('YYYY-MM-DD HH:mm:ss'));
        // console.log("Fecha pasada la hora?: " + moment(data[5].fecha_programacion).isAfter(now));

        // Encuentra la primera fecha mayor a la fecha actual
        const nextProgramacion = data.find((item) => moment(item.fecha_programacion).isAfter(now));

        if (nextProgramacion) {
            const programacionTime = moment(nextProgramacion.fecha_programacion);
            const diff = programacionTime.diff(now);

            // Limpiar cualquier timeout previo antes de establecer uno nuevo (new)
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Configurar la alerta para 15 minutos antes
            if (diff <= 15 * 60 * 1000) {
                // 15 minutos en milisegundos
                const minutes = Math.floor(diff / (60 * 1000));
                const seconds = Math.floor((diff % (60 * 1000)) / 1000);
                toast2.current.show({ severity: "info", summary: "Recordatorio", detail: `Faltan ${minutes} minutos y ${seconds} segundos para la reprogramación.`, life: 5000 });
            }

            // Configurar la alerta para el momento exacto de la reprogramación
            // const timeout = setTimeout(() => {
            timeoutRef.current = setTimeout(() => {
                // alert('¡Es hora de la reprogramación!');
                toast3.current.show({ severity: "success", summary: "Información", detail: `Se llegó a la hora de la reprogramación`, sticky: true });
                setDialogProgramGestion(true);
            }, diff);

            // return () => clearTimeout(timeout); // Limpiar el timeout si el componente se desmonta o si cambia
        }
    };

    //console.log(panelContext)

    const priceBodyTemplate = (rowData, col) => {
        if (col.type == "NUMBER") return <NumberFormat value={rowData[col.field]} displayType={"text"} thousandSeparator={true} prefix={""} />;
        return rowData[col.field];
    };

    const dynamicColumns =
        columnsGridMain &&
        columnsGridMain
            .filter((c) => c.field !== "NOMBRE")
            .map((col, i) => {
                return (
                    <Column
                        key={col.field}
                        field={col.field}
                        body={(e) => priceBodyTemplate(e, col)}
                        bodyStyle={{ textAlign: col.type == "NUMBER" ? "right" : "left", background: col.color && col.color }}
                        headerStyle={{ width: col.width + "px", textTransform: "capitalize" }}
                        header={col.header.replaceAll("_", " ")}
                    />
                );
            });

    // console.log(customers)
    const paymentOptions = [
        { name: "Contacto Directo", value: "CONTACTO DIRECTO" },
        { name: "Contacto Indirecto", value: "CONTACTO INDIRECTO" },
        { name: "No Contacto", value: "NO CONTACTO" },
    ];

    let footerGroup = (
        <ColumnGroup>
            <Row>
                <Column footer="TOTAL SOLES S./ " colSpan={totales.indexCS} footerStyle={{ textAlign: "right", paddingTop: 2, paddingBottom: 2, margin: 0 }} />
                {columnsGridMain &&
                    columnsGridMain
                        .filter((c) => c.field !== "NOMBRE")
                        .map((col, i) => {
                            if (i > totales.indexCS - 1) {
                                if (col.field == "MONTOACOBRAR") return <Column key={col.field} footer={totalFormatNumber(totales.montot_sol)} footerStyle={{ textAlign: "right", paddingTop: 1, paddingBottom: 1, margin: 0 }} />;
                                if (col.field == "MONTOCAMPANA") return <Column key={col.field} footer={totalFormatNumber(totales.montoc_sol)} footerStyle={{ textAlign: "right", paddingTop: 1, paddingBottom: 1, margin: 0 }} />;
                                if (col.field == "PORDESCUENTO") return <Column key={col.field} footer={totalFormatNumber(totales.montop_sol)} footerStyle={{ textAlign: "right", paddingTop: 1, paddingBottom: 1, margin: 0 }} />;
                                if (col.field == "DEUDATOTAL") return <Column key={col.field} footer={totalFormatNumber(totales.montode_sol)} footerStyle={{ textAlign: "right", paddingTop: 1, paddingBottom: 1, margin: 0 }} />;
                                if (col.field == "CAPITAL") return <Column key={col.field} footer={totalFormatNumber(totales.montoca_sol)} footerStyle={{ textAlign: "right", paddingTop: 1, paddingBottom: 1, margin: 0 }} />;
                                if (col.field == "SALDOPORPAGAR") return <Column key={col.field} footer={totalFormatNumber(totales.montosa_sol)} footerStyle={{ textAlign: "right", paddingTop: 1, paddingBottom: 1, margin: 0 }} />;
                                return <Column key={col.field} />;
                            }
                        })}
            </Row>
            <Row>
                <Column footer="TOTAL DOLARES $. " colSpan={totales.indexCS} footerStyle={{ textAlign: "right", paddingTop: 2, paddingBottom: 2, margin: 0 }} />
                {columnsGridMain &&
                    columnsGridMain
                        .filter((c) => c.field !== "NOMBRE")
                        .map((col, i) => {
                            if (i > totales.indexCS - 1) {
                                if (col.field == "MONTOACOBRAR") return <Column key={col.field} footer={totalFormatNumber(totales.montot_dol)} footerStyle={{ textAlign: "right", paddingTop: 1, paddingBottom: 1, margin: 0 }} />;
                                if (col.field == "MONTOCAMPANA") return <Column key={col.field} footer={totalFormatNumber(totales.montoc_dol)} footerStyle={{ textAlign: "right", paddingTop: 1, paddingBottom: 0, margin: 0 }} />;
                                if (col.field == "PORDESCUENTO") return <Column key={col.field} footer={totalFormatNumber(totales.montop_dol)} footerStyle={{ textAlign: "right", paddingTop: 1, paddingBottom: 1, margin: 0 }} />;
                                if (col.field == "DEUDATOTAL") return <Column key={col.field} footer={totalFormatNumber(totales.montode_dol)} footerStyle={{ textAlign: "right", paddingTop: 1, paddingBottom: 1, margin: 0 }} />;
                                if (col.field == "CAPITAL") return <Column key={col.field} footer={totalFormatNumber(totales.montoca_dol)} footerStyle={{ textAlign: "right", paddingTop: 1, paddingBottom: 1, margin: 0 }} />;
                                if (col.field == "SALDOPORPAGAR") return <Column key={col.field} footer={totalFormatNumber(totales.montosa_dol)} footerStyle={{ textAlign: "right", paddingTop: 1, paddingBottom: 1, margin: 0 }} />;
                                return <Column key={col.field} />;
                            }
                        })}
            </Row>
        </ColumnGroup>
    );

    return (
        <React.Fragment>
            <div className="p-grid crud-demo">
                {showLoading && (
                    <div id="dialog_bg">
                        <div id="dialog_box">
                            <img alt="Logo" height="100" src="assets/layout/images/loading.gif" />
                        </div>
                    </div>
                )}
                <div className="p-col-12">
                    <div className="card">
                        <Toast ref={toast} />
                        <Toast ref={toastJsIP} />
                        <Toast ref={toastSMS} />
                        <Toast ref={toastIVR} />
                        <Toast ref={toastWhatsApp} />
                        <Toast ref={toast2} position="top-center" />
                        <Toast ref={toast3} position="top-center" />
                        {panelContext.selectedEntityId && <Toolbar className="p-mb-2  p-p-1" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>}
                        <div className="p-grid">
                            <div className="p-col-8">
                                {showDetails && (
                                    <React.Fragment>
                                        <Card title="INFORMACIÓN PERSONAL" style={{ background: "#f8f9fa" }}>
                                            {selectedProduct && (
                                                <div className="p-fluid">
                                                    <div className="p-grid p-ml-1 p-mt-1">
                                                        {columnsPanel3.map((user) => (
                                                            <div key={"key_panel_3_" + user.field} className="p-col-4 p-p-0">
                                                                <div className="p-grid p-col p-p-1">
                                                                    <label htmlFor="firstname4" style={{ fontSize: "10.5px", width: "40%" }}>
                                                                        <b>{user.header.replaceAll("_", " ")}</b>
                                                                    </label>
                                                                    <label
                                                                        htmlFor="firstname4"
                                                                        className={user.color && "state-row-value"}
                                                                        style={{ background: ((user.color && user.header != "ESTADO") || (user.header == "ESTADO" && selectedProduct[user.field].toUpperCase() == "VENCIDO")) && user.color, fontSize: "11.5px", textAlign: "start" }}
                                                                    >
                                                                        {selectedProduct[user.field]}
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </Card>
                                    </React.Fragment>
                                )}
                            </div>
                            {showDetails && (
                                <React.Fragment>
                                    <div className="p-col-4">
                                        <Card title="DETALLE DE CUENTA" style={{ background: "#f8f9fa" }}>
                                            {selectedProduct && (
                                                <div className="p-fluid">
                                                    <div className="p-grid p-ml-1 p-mt-1">
                                                        {columnsPanel4.map((user) => (
                                                            <div key={"key_panel_2_" + user.field} className="p-col-6  p-p-0">
                                                                <div className="p-grid p-col p-p-1">
                                                                    <label htmlFor="firstname4" style={{ fontSize: "10.5px", width: "50%" }}>
                                                                        <b>{user.header.replaceAll("_", " ")}</b>
                                                                    </label>
                                                                    <label htmlFor="firstname4" className={user.color && "state-row-value"} style={{ background: user.color && user.color, fontSize: "11.5px", width: "40%", textAlign: "start" }}>
                                                                        {selectedProduct[user.field]}
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </Card>
                                    </div>
                                </React.Fragment>
                            )}
                        </div>
                        <div className="p-grid ">
                            <div className="p-col-12">
                                <Card title="INFORMACIÓN DE LA DEUDA" style={{ background: "#f8f9fa" }}>
                                    {searchType === 0 && (
                                        <p style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>
                                            Mostrando los últimos <strong>10 registros recientes</strong>
                                        </p>
                                    )}
                                    {searchType === 1 && (
                                        <p style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>
                                            Búsqueda realizada por <strong>identificador</strong>
                                        </p>
                                    )}
                                    {searchType === 2 && (
                                        <p style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>
                                            Búsqueda realizada por <strong>documento</strong>
                                        </p>
                                    )}
                                    {searchType === 3 && (
                                        <p style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>
                                            Búsqueda realizada por <strong>nombre</strong>
                                        </p>
                                    )}

                                    {columnsGridMain && (
                                        <>
                                            {columnsGridMain.length > 0 ? (
                                                <React.Fragment>
                                                    <DataTable
                                                        stripedRows
                                                        paginator={customers.length > 100}
                                                        rows={customers.length > 100 ? 10 : customers.length}
                                                        scrollHeight={customers.length > 100 ? "400px" : "200px"}
                                                        scrollable
                                                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                                                        selectionMode="single"
                                                        selection={selectedProduct}
                                                        onSelectionChange={(e) => handleSelected({ ...e, paramTelefono: paramTelefono }, panelContext.selectedEntityId)}
                                                        dataKey="identificador"
                                                        rowGroupMode="rowspan"
                                                        groupField="NOMBRE"
                                                        sortMode="single"
                                                        sortField="NOMBRE"
                                                        sortOrder={1}
                                                        style={{ width: "auto", fontSize: "12px" }}
                                                        value={customers}
                                                        emptyMessage={"No se encontraron resultados"}
                                                        footerColumnGroup={showColumnName == false && customers.length > 1 ? footerGroup : null}
                                                        loading={loading}
                                                        className="p-datatable-sm p-datatable-gridlines"
                                                    >
                                                        <Column field="NOMBRE" header="Nombre" bodyStyle={{ display: showColumnName ? "" : "none" }} headerStyle={{ width: "350px", display: showColumnName ? "" : "none" }}></Column>
                                                        {dynamicColumns}
                                                    </DataTable>
                                                </React.Fragment>
                                            ) : (
                                                <span> No se encontró configuración para la empresa</span>
                                            )}
                                        </>
                                    )}
                                </Card>
                            </div>
                        </div>
                        <div className="p-grid">
                            <div className="p-col-8">
                                <Card style={{ background: "#f8f9fa" }}>
                                    {panelContext.dataTelefonos == null ? (
                                        <div>
                                            <Skeleton height="2rem" className="mb-12"></Skeleton>
                                            <Skeleton height="2rem" className="p-mt-3"></Skeleton>
                                            <Skeleton height="2rem" className="p-mt-3"></Skeleton>
                                            <Skeleton height="2rem" className="p-mt-3"></Skeleton>
                                            <Skeleton height="2rem" className="p-mt-3"></Skeleton>
                                        </div>
                                    ) : (
                                        <React.Fragment>
                                            {/* <div className="p-d-flex p-mb-4 title-content-line"> */}

                                            {/* ================= REQUERIMIENTO CARLOS DESCARGAR A CSV GESTIONES ================= */}
                                            <div className="p-d-flex p-mb-4 title-content-line" style={{ alignItems: "center", gap: 8 }}>
                                                {/* ================= REQUERIMIENTO CARLOS DESCARGAR A CSV GESTIONES ================= */}

                                                <div className="p-card-title">HISTORIAL DE GESTIONES</div>

                                                {/* ================= REQUERIMIENTO CARLOS DESCARGAR A CSV GESTIONES ================= */}
                                                <Button className="p-button-success p-button-rounded p-button-outlined" icon="pi pi-file-excel" tooltip="Descargar Gestiones" onClick={handleDownloadCSV} aria-label="Descargar Gestiones" />
                                                {/* ================= REQUERIMIENTO CARLOS DESCARGAR A CSV GESTIONES ================= */}

                                                <div className="p-button-success p-ml-auto">
                                                    <MultiSelect
                                                        value={value2}
                                                        style={{ fontSize: 12 }}
                                                        options={paymentOptions}
                                                        onChange={(e) => {
                                                            var _dataHistorial = [...dataHistorial];
                                                            setDataHistorialFilter(_dataHistorial.filter((param) => e.value.includes(param.HOMOLO)));

                                                            setValue2(e.value);
                                                        }}
                                                        optionLabel="name"
                                                        placeholder="Filtro de tipo de contacto"
                                                        maxSelectedLabels={3}
                                                    />
                                                </div>
                                            </div>
                                            <TabView
                                                activeIndex={activeIndex}
                                                style={{ fontSize: "12px" }}
                                                onTabChange={(e) => {
                                                    switch (e.index) {
                                                        case 0:
                                                            {
                                                                var data = dataHistorial.filter((e) => e.accion_tipo == 1);
                                                                setLastObservation(data.length > 0 ? data[0].OBSERVACION : "");
                                                            }
                                                            break;
                                                        case 1:
                                                            {
                                                                var data = dataHistorial.filter((e) => e.accion_tipo == 2);
                                                                setLastObservation(data.length > 0 ? data[0].OBSERVACION : "");
                                                            }
                                                            break;
                                                        case 2:
                                                            {
                                                                var data = dataHistorial.filter((e) => e.accion_tipo == 3);
                                                                setLastObservation(data.length > 0 ? data[0].OBSERVACION : "");
                                                            }
                                                            break;
                                                        case 3:
                                                            {
                                                                setLastObservation(dataPromesa.length > 0 ? dataPromesa[0].OBSERVACION : "");
                                                            }
                                                            break;
                                                        // ============================= REQUERIMIENTO JUDICIAL =============================

                                                        // ============================= REQUERIMIENTO JUDICIAL =============================
                                                    }
                                                    setActiveIndex(e.index);
                                                }}
                                            >
                                                <TabPanel header="LLAMADA">
                                                    <DataTable
                                                        value={dataHistorialFilter && dataHistorialFilter.filter((e) => e.accion_tipo == 1)}
                                                        ref={dt}
                                                        style={{ fontSize: "12px" }}
                                                        emptyMessage={"No se encontraron resultados"}
                                                        scrollable
                                                        scrollHeight="200px"
                                                        loading={loading}
                                                        stripedRows
                                                        className="p-datatable-sm p-datatable-gridlines"
                                                    >
                                                        {/* // ============================ REQUERIMIENTO PREVENCION RECLAMOS ============================ */}
                                                        {/* <Column
                                                            body={renderEmojiEstadoAnimo}
                                                            header={
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                                                                    <path
                                                                        fill="currentColor"
                                                                        fillRule="evenodd"
                                                                        d="M12 22c-4.714 0-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12s0-7.071 1.464-8.536C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22m0-4.25a.75.75 0 0 0 .75-.75v-6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75M12 7a1 1 0 1 1 0 2a1 1 0 0 1 0-2"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            }
                                                            headerStyle={{ width: "70px", textAlign: "center" }}
                                                            style={{ textAlign: "center" }}
                                                        /> */}
                                                        {/* // ============================ REQUERIMIENTO PREVENCION RECLAMOS ============================ */}
                                                        <Column field="fecha_tmk" header="FECHA" headerStyle={{ width: "130px" }}></Column>
                                                        <Column field="ACCION" header="ACCION" headerStyle={{ width: "200px" }}></Column>
                                                        <Column field="EFECTO" header="EFECTO" headerStyle={{ width: "200px" }}></Column>
                                                        {panelContext.selectedCarteraId && panelContext.selectedCarteraId === 75 && <Column field="NombreTienda" header="TIENDA" headerStyle={{ width: "200px" }}></Column>}
                                                        {panelContext.selectedCarteraId && panelContext.selectedCarteraId === 75 && <Column field="DireccionTienda" header="DIRECCION" headerStyle={{ width: "300px" }}></Column>}
                                                        <Column field="MOTIVO" header="MOTIVO" headerStyle={{ width: "200px" }}></Column>
                                                        <Column body={stateBodyTemplate} headerStyle={{ width: "450px" }} header="OBSERVACION"></Column>
                                                        <Column field="NUMERO" header="TELEFONO" headerStyle={{ width: "80px" }}></Column>
                                                        {/* // ============================ REQUERIMIENTO PREVENCION RECLAMOS ============================ */}
                                                        {/* <Column
                                                            header={
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512">
                                                                    <path
                                                                        fill="currentColor"
                                                                        d="M467 45.2A44.45 44.45 0 0 0 435.29 32H312.36a30.63 30.63 0 0 0-21.52 8.89L45.09 286.59a44.82 44.82 0 0 0 0 63.32l117 117a44.83 44.83 0 0 0 63.34 0l245.65-245.6A30.6 30.6 0 0 0 480 199.8v-123a44.24 44.24 0 0 0-13-31.6M384 160a32 32 0 1 1 32-32a32 32 0 0 1-32 32"
                                                                    />
                                                                </svg>
                                                            }
                                                            body={(rowData) => {
                                                                const valor = rowData.auto_telefonica?.toString().trim().toUpperCase();
                                                                let display = "SC";
                                                                let background = "#ccc";
                                                                let color = "#000";
                                                                let extraClass = "";

                                                                if (valor === "SI") {
                                                                    display = "SI";
                                                                    background = "#4CAF50";
                                                                    color = "#fff";
                                                                    extraClass = "emoji-pulse";
                                                                } else if (valor === "NO") {
                                                                    display = "NO";
                                                                    background = "#F44336";
                                                                    color = "#fff";
                                                                }

                                                                return (
                                                                    <div
                                                                        className={extraClass}
                                                                        style={{
                                                                            padding: "6px 12px",
                                                                            backgroundColor: background,
                                                                            color: color,
                                                                            fontWeight: "bold",
                                                                            borderRadius: "4px",
                                                                            display: "inline-block",
                                                                            minWidth: "40px",
                                                                            textAlign: "center",
                                                                        }}
                                                                    >
                                                                        {display}
                                                                    </div>
                                                                );
                                                            }}
                                                            headerStyle={{ width: "70px", textAlign: "center" }}
                                                            style={{ textAlign: "center" }}
                                                        /> */}

                                                        {/* // ============================ REQUERIMIENTO PREVENCION RECLAMOS ============================ */}
                                                        <Column field="CONTACTO" header="CONTACTO" headerStyle={{ width: "80px" }}></Column>
                                                        <Column field="NOMCONTACTO" header="NOM. CONTACTO" headerStyle={{ width: "120px" }}></Column>
                                                        <Column field="TIPO" header="TIPOTEL" headerStyle={{ width: "90px" }}></Column>
                                                        <Column field="personal" header="GESTOR" headerStyle={{ width: "250px" }}></Column>
                                                    </DataTable>
                                                </TabPanel>
                                                <TabPanel header="CAMPO">
                                                    <DataTable
                                                        value={dataHistorialFilter && dataHistorialFilter.filter((e) => e.accion_tipo == 2)}
                                                        ref={dt}
                                                        style={{ fontSize: "12px" }}
                                                        emptyMessage={"No se encontraron resultados"}
                                                        scrollable
                                                        scrollHeight="200px"
                                                        loading={loading}
                                                        stripedRows
                                                        className="p-datatable-sm p-datatable-gridlines"
                                                    >
                                                        {/* // ============================ REQUERIMIENTO PREVENCION RECLAMOS ============================ */}
                                                        {/* <Column
                                                            body={renderEmojiEstadoAnimo}
                                                            header={
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                                                                    <path
                                                                        fill="currentColor"
                                                                        fillRule="evenodd"
                                                                        d="M12 22c-4.714 0-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12s0-7.071 1.464-8.536C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22m0-4.25a.75.75 0 0 0 .75-.75v-6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75M12 7a1 1 0 1 1 0 2a1 1 0 0 1 0-2"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            }
                                                            headerStyle={{ width: "70px", textAlign: "center" }}
                                                            style={{ textAlign: "center" }}
                                                        /> */}

                                                        {/* // ============================ REQUERIMIENTO PREVENCION RECLAMOS ============================ */}
                                                        <Column field="fecha_tmk" header="FECHA" headerStyle={{ width: "130px" }}></Column>
                                                        <Column field="ACCION" header="ACCION" headerStyle={{ width: "200px" }}></Column>
                                                        <Column field="EFECTO" header="EFECTO" headerStyle={{ width: "300px" }}></Column>
                                                        <Column field="MOTIVO" header="MOTIVO" headerStyle={{ width: "200px" }}></Column>
                                                        <Column body={stateBodyTemplate} headerStyle={{ width: "450px" }} header="OBSERVACION"></Column>
                                                        <Column field="CONTACTO" header="CONTACTO" headerStyle={{ width: "80px" }}></Column>
                                                        <Column field="NOMCONTACTO" header="NOM. CONTACTO" headerStyle={{ width: "200px" }}></Column>
                                                        {/* // ============================ REQUERIMIENTO PREVENCION RECLAMOS ============================ */}
                                                        {/* <Column
                                                            header={
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512">
                                                                    <path
                                                                        fill="currentColor"
                                                                        d="M467 45.2A44.45 44.45 0 0 0 435.29 32H312.36a30.63 30.63 0 0 0-21.52 8.89L45.09 286.59a44.82 44.82 0 0 0 0 63.32l117 117a44.83 44.83 0 0 0 63.34 0l245.65-245.6A30.6 30.6 0 0 0 480 199.8v-123a44.24 44.24 0 0 0-13-31.6M384 160a32 32 0 1 1 32-32a32 32 0 0 1-32 32"
                                                                    />
                                                                </svg>
                                                            }
                                                            body={(rowData) => {
                                                                const valor = rowData.auto_telefonica?.toString().trim().toUpperCase();
                                                                let display = "SC";
                                                                let background = "#ccc";
                                                                let color = "#000";
                                                                let extraClass = "";

                                                                if (valor === "SI") {
                                                                    display = "SI";
                                                                    background = "#4CAF50";
                                                                    color = "#fff";
                                                                    extraClass = "emoji-pulse";
                                                                } else if (valor === "NO") {
                                                                    display = "NO";
                                                                    background = "#F44336";
                                                                    color = "#fff";
                                                                }

                                                                return (
                                                                    <div
                                                                        className={extraClass}
                                                                        style={{
                                                                            padding: "6px 12px",
                                                                            backgroundColor: background,
                                                                            color: color,
                                                                            fontWeight: "bold",
                                                                            borderRadius: "4px",
                                                                            display: "inline-block",
                                                                            minWidth: "40px",
                                                                            textAlign: "center",
                                                                        }}
                                                                    >
                                                                        {display}
                                                                    </div>
                                                                );
                                                            }}
                                                            headerStyle={{ width: "70px", textAlign: "center" }}
                                                            style={{ textAlign: "center" }}
                                                        /> */}

                                                        {/* // ============================ REQUERIMIENTO PREVENCION RECLAMOS ============================ */}
                                                        <Column field="PISOS" header="PISOS" headerStyle={{ width: "50px" }}></Column>
                                                        <Column field="PUERTA" header="PUERTA" headerStyle={{ width: "60px" }}></Column>
                                                        <Column field="FACHADA" header="FACHADA" headerStyle={{ width: "80px" }}></Column>
                                                        <Column field="personal" header="GESTOR" headerStyle={{ width: "250px" }}></Column>
                                                    </DataTable>
                                                </TabPanel>
                                                <TabPanel header="MULTICANAL">
                                                    <DataTable
                                                        value={dataHistorialFilter && dataHistorialFilter.filter((e) => e.accion_tipo == 3)}
                                                        ref={dt}
                                                        style={{ fontSize: "12px" }}
                                                        emptyMessage={"No se encontraron resultados"}
                                                        scrollable
                                                        scrollHeight="200px"
                                                        loading={loading}
                                                        stripedRows
                                                        className="p-datatable-sm p-datatable-gridlines"
                                                    >
                                                        {/* // ============================ REQUERIMIENTO PREVENCION RECLAMOS ============================ */}
                                                        {/* <Column
                                                            body={renderEmojiEstadoAnimo}
                                                            header={
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                                                                    <path
                                                                        fill="currentColor"
                                                                        fillRule="evenodd"
                                                                        d="M12 22c-4.714 0-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12s0-7.071 1.464-8.536C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22m0-4.25a.75.75 0 0 0 .75-.75v-6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75M12 7a1 1 0 1 1 0 2a1 1 0 0 1 0-2"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            }
                                                            headerStyle={{ width: "70px", textAlign: "center" }}
                                                            style={{ textAlign: "center" }}
                                                        /> */}

                                                        {/* // ============================ REQUERIMIENTO PREVENCION RECLAMOS ============================ */}
                                                        <Column field="fecha_tmk" header="FECHA" headerStyle={{ width: "130px" }}></Column>
                                                        <Column field="ACCION" header="ACCION" headerStyle={{ width: "200px" }}></Column>
                                                        <Column field="EFECTO" header="EFECTO" headerStyle={{ width: "300px" }}></Column>
                                                        <Column field="MOTIVO" header="MOTIVO" headerStyle={{ width: "200px" }}></Column>
                                                        <Column body={stateBodyTemplate} headerStyle={{ width: "450px" }} header="OBSERVACION"></Column>
                                                        <Column field="NUMERO" header="TELEFONO" headerStyle={{ width: "80px" }}></Column>
                                                        {/* // ============================ REQUERIMIENTO PREVENCION RECLAMOS ============================ */}
                                                        {/* <Column
                                                            header={
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512">
                                                                    <path
                                                                        fill="currentColor"
                                                                        d="M467 45.2A44.45 44.45 0 0 0 435.29 32H312.36a30.63 30.63 0 0 0-21.52 8.89L45.09 286.59a44.82 44.82 0 0 0 0 63.32l117 117a44.83 44.83 0 0 0 63.34 0l245.65-245.6A30.6 30.6 0 0 0 480 199.8v-123a44.24 44.24 0 0 0-13-31.6M384 160a32 32 0 1 1 32-32a32 32 0 0 1-32 32"
                                                                    />
                                                                </svg>
                                                            }
                                                            body={(rowData) => {
                                                                const valor = rowData.auto_telefonica?.toString().trim().toUpperCase();
                                                                let display = "SC";
                                                                let background = "#ccc";
                                                                let color = "#000";
                                                                let extraClass = "";

                                                                if (valor === "SI") {
                                                                    display = "SI";
                                                                    background = "#4CAF50";
                                                                    color = "#fff";
                                                                    extraClass = "emoji-pulse";
                                                                } else if (valor === "NO") {
                                                                    display = "NO";
                                                                    background = "#F44336";
                                                                    color = "#fff";
                                                                }

                                                                return (
                                                                    <div
                                                                        className={extraClass}
                                                                        style={{
                                                                            padding: "6px 12px",
                                                                            backgroundColor: background,
                                                                            color: color,
                                                                            fontWeight: "bold",
                                                                            borderRadius: "4px",
                                                                            display: "inline-block",
                                                                            minWidth: "40px",
                                                                            textAlign: "center",
                                                                        }}
                                                                    >
                                                                        {display}
                                                                    </div>
                                                                );
                                                            }}
                                                            headerStyle={{ width: "70px", textAlign: "center" }}
                                                            style={{ textAlign: "center" }}
                                                        /> */}

                                                        {/* // ============================ REQUERIMIENTO PREVENCION RECLAMOS ============================ */}
                                                        <Column field="CONTACTO" header="CONTACTO" headerStyle={{ width: "80px" }}></Column>
                                                        <Column field="NOMCONTACTO" header="NOM. CONTACTO" headerStyle={{ width: "200px" }}></Column>
                                                        <Column field="PISOS" header="PISOS" headerStyle={{ width: "50px" }}></Column>
                                                        <Column field="PUERTA" header="PUERTA" headerStyle={{ width: "60px" }}></Column>
                                                        <Column field="FACHADA" header="FACHADA" headerStyle={{ width: "80px" }}></Column>
                                                        <Column field="personal" header="GESTOR" headerStyle={{ width: "250px" }}></Column>
                                                    </DataTable>
                                                </TabPanel>
                                                <TabPanel header="PROMESAS">
                                                    <DataTable value={dataPromesa} style={{ fontSize: "12px" }} emptyMessage={"No se encontraron resultados"} scrollable scrollHeight="200px" loading={loading} className="p-datatable-sm p-datatable-gridlines">
                                                        {/* // ============================ REQUERIMIENTO PREVENCION RECLAMOS ============================ */}
                                                        {/* <Column
                                                            body={renderEmojiEstadoAnimo}
                                                            header={
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                                                                    <path
                                                                        fill="currentColor"
                                                                        fillRule="evenodd"
                                                                        d="M12 22c-4.714 0-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12s0-7.071 1.464-8.536C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22m0-4.25a.75.75 0 0 0 .75-.75v-6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75M12 7a1 1 0 1 1 0 2a1 1 0 0 1 0-2"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            }
                                                            headerStyle={{ width: "70px", textAlign: "center" }}
                                                            style={{ textAlign: "center" }}
                                                        /> */}

                                                        {/* // ============================ REQUERIMIENTO PREVENCION RECLAMOS ============================ */}
                                                        <Column field="fecha_promesa" headerStyle={{ width: "130px" }} header="FECHA"></Column>
                                                        <Column field="monto_promesa" headerStyle={{ width: "100px" }} header="MONTO"></Column>
                                                        <Column field="ACCION" headerStyle={{ width: "200px" }} header="ACCION"></Column>
                                                        <Column field="EFECTO" headerStyle={{ width: "200px" }} header="EFECTO"></Column>
                                                        <Column field="MOTIVO" headerStyle={{ width: "200px" }} header="MOTIVO"></Column>
                                                        <Column field="NUMERO" headerStyle={{ width: "200px" }} header="TEL. CONT."></Column>
                                                        {/* // ============================ REQUERIMIENTO PREVENCION RECLAMOS ============================ */}
                                                        {/* <Column
                                                            header={
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512">
                                                                    <path
                                                                        fill="currentColor"
                                                                        d="M467 45.2A44.45 44.45 0 0 0 435.29 32H312.36a30.63 30.63 0 0 0-21.52 8.89L45.09 286.59a44.82 44.82 0 0 0 0 63.32l117 117a44.83 44.83 0 0 0 63.34 0l245.65-245.6A30.6 30.6 0 0 0 480 199.8v-123a44.24 44.24 0 0 0-13-31.6M384 160a32 32 0 1 1 32-32a32 32 0 0 1-32 32"
                                                                    />
                                                                </svg>
                                                            }
                                                            body={(rowData) => {
                                                                const valor = rowData.auto_telefonica?.toString().trim().toUpperCase();
                                                                let display = "SC";
                                                                let background = "#ccc";
                                                                let color = "#000";
                                                                let extraClass = "";

                                                                if (valor === "SI") {
                                                                    display = "SI";
                                                                    background = "#4CAF50";
                                                                    color = "#fff";
                                                                    extraClass = "emoji-pulse";
                                                                } else if (valor === "NO") {
                                                                    display = "NO";
                                                                    background = "#F44336";
                                                                    color = "#fff";
                                                                }

                                                                return (
                                                                    <div
                                                                        className={extraClass}
                                                                        style={{
                                                                            padding: "6px 12px",
                                                                            backgroundColor: background,
                                                                            color: color,
                                                                            fontWeight: "bold",
                                                                            borderRadius: "4px",
                                                                            display: "inline-block",
                                                                            minWidth: "40px",
                                                                            textAlign: "center",
                                                                        }}
                                                                    >
                                                                        {display}
                                                                    </div>
                                                                );
                                                            }}
                                                            headerStyle={{ width: "70px", textAlign: "center" }}
                                                            style={{ textAlign: "center" }}
                                                        /> */}

                                                        {/* // ============================ REQUERIMIENTO PREVENCION RECLAMOS ============================ */}
                                                        <Column body={stateBodyTemplate} headerStyle={{ width: "450px" }} header="OBSERVACION"></Column>
                                                        <Column field="contacto" headerStyle={{ width: "200px" }} header="CONTACTO"></Column>
                                                        <Column field="NOMCONTACTO" headerStyle={{ width: "200px" }} header="NOM. CONTACTO"></Column>
                                                        <Column field="TIPO" headerStyle={{ width: "200px" }} header="TIPO_TELEFONO"></Column>
                                                        <Column field="personal" headerStyle={{ width: "250px" }} header="GESTOR"></Column>
                                                    </DataTable>
                                                </TabPanel>

                                                <TabPanel header="AGENDAMIENTO">
                                                    {panelContext.selectedCarteraId && panelContext.selectedCarteraId === 75 && (
                                                        <DataTable value={dataAgendamientos} style={{ fontSize: "12px" }} emptyMessage={"No se encontraron resultados"} scrollable scrollHeight="200px" loading={loading} className="p-datatable-sm p-datatable-gridlines">
                                                            {/* // ============================ REQUERIMIENTO PREVENCION RECLAMOS ============================ */}
                                                            {/* <Column
                                                                body={renderEmojiEstadoAnimo}
                                                                header={
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                                                                        <path
                                                                            fill="currentColor"
                                                                            fillRule="evenodd"
                                                                            d="M12 22c-4.714 0-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12s0-7.071 1.464-8.536C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22m0-4.25a.75.75 0 0 0 .75-.75v-6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75M12 7a1 1 0 1 1 0 2a1 1 0 0 1 0-2"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                }
                                                                headerStyle={{ width: "70px", textAlign: "center" }}
                                                                style={{ textAlign: "center" }}
                                                            /> */}

                                                            {/* // ============================ REQUERIMIENTO PREVENCION RECLAMOS ============================ */}
                                                            <Column field="tienda" headerStyle={{ width: "130px" }} header="TIENDA"></Column>
                                                            <Column field="direccion" headerStyle={{ width: "150px" }} header="DIRECCION"></Column>
                                                            <Column field="fecha_agendamiento" headerStyle={{ width: "150px" }} header="FECHA AGEND."></Column>
                                                            <Column field="visita" headerStyle={{ width: "70px" }} header="VISITA"></Column>
                                                            <Column field="venta" headerStyle={{ width: "70px" }} header="VENTA"></Column>
                                                            <Column field="desembolso" headerStyle={{ width: "90px" }} header="DESEMBOLSO"></Column>
                                                            <Column body={stateBodyTemplateAV} headerStyle={{ width: "450px" }} header="OBSERVACION"></Column>
                                                            <Column field="derivacion_canal" headerStyle={{ width: "200px" }} header="DERIV. CANAL"></Column>
                                                            {/* // ============================ REQUERIMIENTO PREVENCION RECLAMOS ============================ */}
                                                            {/* <Column
                                                                header={
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512">
                                                                        <path
                                                                            fill="currentColor"
                                                                            d="M467 45.2A44.45 44.45 0 0 0 435.29 32H312.36a30.63 30.63 0 0 0-21.52 8.89L45.09 286.59a44.82 44.82 0 0 0 0 63.32l117 117a44.83 44.83 0 0 0 63.34 0l245.65-245.6A30.6 30.6 0 0 0 480 199.8v-123a44.24 44.24 0 0 0-13-31.6M384 160a32 32 0 1 1 32-32a32 32 0 0 1-32 32"
                                                                        />
                                                                    </svg>
                                                                }
                                                                body={(rowData) => {
                                                                    const valor = rowData.auto_telefonica?.toString().trim().toUpperCase();
                                                                    let display = "SC";
                                                                    let background = "#ccc";
                                                                    let color = "#000";
                                                                    let extraClass = "";

                                                                    if (valor === "SI") {
                                                                        display = "SI";
                                                                        background = "#4CAF50";
                                                                        color = "#fff";
                                                                        extraClass = "emoji-pulse";
                                                                    } else if (valor === "NO") {
                                                                        display = "NO";
                                                                        background = "#F44336";
                                                                        color = "#fff";
                                                                    }

                                                                    return (
                                                                        <div
                                                                            className={extraClass}
                                                                            style={{
                                                                                padding: "6px 12px",
                                                                                backgroundColor: background,
                                                                                color: color,
                                                                                fontWeight: "bold",
                                                                                borderRadius: "4px",
                                                                                display: "inline-block",
                                                                                minWidth: "40px",
                                                                                textAlign: "center",
                                                                            }}
                                                                        >
                                                                            {display}
                                                                        </div>
                                                                    );
                                                                }}
                                                                headerStyle={{ width: "70px", textAlign: "center" }}
                                                                style={{ textAlign: "center" }}
                                                            /> */}

                                                            {/* // ============================ REQUERIMIENTO PREVENCION RECLAMOS ============================ */}
                                                            <Column field="personal" headerStyle={{ width: "200px" }} header="GESTOR"></Column>
                                                            <Column field="fecha_registro" headerStyle={{ width: "150px" }} header="FECHA REGISTRO"></Column>
                                                        </DataTable>
                                                    )}
                                                </TabPanel>
                                            </TabView>

                                            <div className="p-fluid p-formgrid p-grid">
                                                <div className="p-field p-col">
                                                    <label htmlFor="firstname2">COMENTARIO DEL ULTIMO CONTACTO</label>
                                                    <InputTextarea value={lastObservation} name="observacion" type="text" rows={2} cols={30} />
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    )}
                                </Card>
                            </div>
                            <div className="p-col-4">
                                {/* ===================== REQUERIMIENTO PEDRO ===================== */}

                                {panelContext.selectedCustomer && panelContext.dataTelefonos !== null && (
                                    <div
                                        style={{
                                            marginTop: "8px",
                                            marginBottom: "8px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <span>Categoría:</span>
                                        <Dropdown
                                            value={selectedCategoryFilter}
                                            options={[
                                                { label: "Todos", value: null },
                                                { label: "CD - Contacto Directo", value: "CD" },
                                                { label: "NC - No Contacto", value: "NC" },
                                                { label: "CI - Contacto Indirecto", value: "CI" },
                                                { label: "SG - Sin Gestión", value: "SG" },
                                            ]}
                                            onChange={(e) => setSelectedCategoryFilter(e.value)}
                                            placeholder="Categoría"
                                            showClear
                                            className="p-inputtext-sm"
                                        />

                                        <span>Fuente:</span>
                                        <Dropdown
                                            value={selectedFuenteFilter}
                                            options={[
                                                { label: "Todos", value: null },
                                                { label: "ASIGNACION", value: "ASIGNACION" },
                                                { label: "BUSQUEDA", value: "BUSQUEDA" },
                                                { label: "GESTIONES", value: "GESTIONES" },
                                                { label: "OTROS", value: "OTROS" },
                                            ]}
                                            onChange={(e) => setSelectedFuenteFilter(e.value)}
                                            placeholder="Fuente"
                                            showClear
                                            className="p-inputtext-sm"
                                        />
                                    </div>
                                )}

                                {filteredTelefonos && <p style={{ fontSize: "12px", color: "#555", marginBottom: "10px" }}>{filteredTelefonos.length} teléfono(s) encontrado(s)</p>}

                                {/* ===================== REQUERIMIENTO PEDRO ===================== */}

                                {/* ==================== REQUERIMIENTO OMNICANAL ==================== */}

                                {/* <Card title="SCORE DE TELEFONOS" style={{ background: "#f8f9fa", position: "relative" }}> */}
                                <Card title="GESTIÓN OMNICANAL" style={{ background: "#f8f9fa", position: "relative" }}>
                                    {/* ==================== REQUERIMIENTO OMNICANAL ==================== */}

                                    {/* Boton Telefono */}
                                    {/* <div style={{ position: "absolute", top: "2px", right: "10px" }}>
                                        <Button icon="pi pi-phone" className="p-button-rounded p-button-text" onClick={() => showPhone()} />
                                    </div> */}

                                    {panelContext.selectedCustomer && (
                                        <React.Fragment>
                                            {panelContext.dataTelefonos == null ? (
                                                <SkeletonTable />
                                            ) : (
                                                <DataTable
                                                    value={panelContext.dataTelefonos}
                                                    selection={selectedPhone}
                                                    selectionMode="single"
                                                    onSelectionChange={(e) => {
                                                        //console.log(e.value);
                                                        setSelectedPhone(e.value);
                                                        panelContext.setSelectedPhone(e.value);
                                                    }}
                                                    dataKey="IDTELEFONO"
                                                    style={{ fontSize: "12px" }}
                                                    emptyMessage="No se encontró información."
                                                    scrollable
                                                    scrollHeight="350px"
                                                    loading={loading}
                                                    stripedRows
                                                    rowClassName={rowClass}
                                                    className="p-datatable-sm p-datatable-gridlines"
                                                >
                                                    <Column headerStyle={{ width: "100px" }} body={stateBodyTemplatePhone} header="TELEFONO"></Column>

                                                    {/* ==================== REQUERIMIENTO OMNICANAL ==================== */}

                                                    <Column header="CANAL" body={canalBodyTemplate} headerStyle={{ width: "150px", textAlign: "center" }} />

                                                    {/* ==================== REQUERIMIENTO OMNICANAL ==================== */}

                                                    <Column headerStyle={{ width: "80px" }} field="categoria" header="CATEGORIA"></Column>
                                                    <Column headerStyle={{ width: "250px" }} field="cartera" header="CARTERA"></Column>
                                                    <Column headerStyle={{ width: "100px" }} field="FUENTE" header="FUENTE"></Column>
                                                    <Column headerStyle={{ width: "250px" }} field="TIPO" header="TIPO"></Column>

                                                    {/* ===================== REQUERIMIENTO PEDRO ===================== */}

                                                    <Column headerStyle={{ width: "180px" }} field="FECHA_ORIGEN_NUMTELF" header="FECHA FUENTE" />

                                                    {/* ===================== REQUERIMIENTO PEDRO ===================== */}
                                                </DataTable>
                                            )}
                                            <div className="p-fluid p-formgrid p-grid p-mt-2"></div>

                                            <div className="p-fluid p-formgrid p-grid p-mt-2">
                                                <div className="p-col-1 p-m-0 p-p-1">
                                                    <Button
                                                        icon="pi pi-phone"
                                                        onClick={() => {
                                                            onDialogActualizarTelefono(panelContext.selectedCustomer);
                                                        }}
                                                        className="p-button-raised p-button-secondary  p-button-sm"
                                                    />
                                                </div>
                                                <div className="p-col-1 p-m-0 p-p-1">
                                                    <Button
                                                        icon="pi pi-book"
                                                        onClick={() => {
                                                            onDialogActualizarDireccion(panelContext.selectedCustomer);
                                                        }}
                                                        className="p-button-raised p-button-secondary p-button-sm"
                                                    />
                                                </div>
                                                <div className="p-col-3 p-m-0 p-p-1">
                                                    <Button
                                                        label="Teléfono"
                                                        icon="pi pi-phone"
                                                        onClick={() => {
                                                            if (selectedPhone == null) {
                                                                toast.current.show({ severity: "warn", summary: "Información", detail: "Seleccione un teléfono" });
                                                                return;
                                                            }
                                                            onDialogGestion();
                                                        }}
                                                        className="p-button-raised p-button-success p-button-sm"
                                                    />
                                                </div>
                                                <div className="p-col-3 p-mr-0 p-p-1">
                                                    <Button
                                                        label="Campo"
                                                        icon="pi pi-fw pi-envelope"
                                                        onClick={() => {
                                                            onDialogGestionTelefono();
                                                        }}
                                                        className="p-button-raised p-button-info  p-button-sm"
                                                    />
                                                </div>
                                                <div className="p-col-4 p-m-0 p-p-1">
                                                    <Button
                                                        label="MultiCanal"
                                                        icon="pi pi-fw pi-th-large"
                                                        onClick={() => {
                                                            if (selectedPhone == null) {
                                                                toast.current.show({ severity: "warn", summary: "Información", detail: "Seleccione un teléfono" });
                                                                return;
                                                            }
                                                            onDialogGestionMulticanal();
                                                        }}
                                                        className="p-button-raised p-button-warning   p-button-sm"
                                                    />
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    )}
                                </Card>
                            </div>
                        </div>
                        <Divider />

                        <Dialog
                            autoZIndex="false"
                            visible={dialogProgramGestion}
                            style={{ width: "750px" }}
                            header="Programación de gestiones"
                            modal
                            onHide={() => {
                                setDialogProgramGestion(false);
                            }}
                        >
                            <div className="confirmation-content">
                                <DataTable
                                    value={dataProgramaciones}
                                    scrollable
                                    scrollHeight="200px"
                                    style={{ fontSize: "12px" }}
                                    className="p-datatable-sm"
                                    emptyMessage={"No se encontraron resultados"}
                                    selectionMode="single"
                                    // onSelectionChange={(e) => handleReprogramacionInfo(e.value.IDENTIFICADOR)}
                                >
                                    <Column field="IDENTIFICADOR" header="IDENTIFICADOR"></Column>
                                    <Column field="EFECTO" header="EFECTO"></Column>
                                    <Column field="fecha_programacion" header="FECHA DE PROGRAMACION"></Column>
                                </DataTable>
                            </div>
                        </Dialog>

                        {/* NUEVA VISTA PARA AUTOPLAN NO ADJUDICADO (69) */}
                        <Dialog
                            autoZIndex="false"
                            visible={dialogCuotasAutoplanNoAdjudicado}
                            style={{ width: "1500px" }}
                            header="Detalle de cuotas"
                            modal
                            onHide={() => {
                                setDialogCuotasAutoplanNoAdjudicado(false);
                            }}
                        >
                            <div className="confirmation-content">
                                <DataTable
                                    value={dataCuotasAutoplanNoAdjudicado}
                                    scrollable
                                    scrollHeight="700px"
                                    style={{ fontSize: "12px" }}
                                    className="p-datatable-sm"
                                    emptyMessage={"No se encontraron resultados"}
                                    selectionMode="single"
                                    onHide={() => {
                                        setDialogDireccion(false);
                                    }}
                                >
                                    <Column field="Cuenta" header="Cuenta"></Column>
                                    <Column field="capital" header="capital"></Column>
                                    <Column field="comision" header="comision"></Column>
                                    <Column field="Penalidad" header="Penalidad"></Column>
                                    <Column field="Seguro" header="Seguro"></Column>
                                    <Column field="Gps" header="Gps"></Column>
                                    <Column field="Otros" header="Otros"></Column>
                                    <Column field="Total" header="Total"></Column>
                                    <Column field="Saldo" header="Saldo"></Column>
                                    <Column field="Vencimiento" header="Vencimiento"></Column>
                                </DataTable>
                            </div>
                        </Dialog>
                        {/* FIN NUEVA VISTA PARA AUTOPLAN ADJUDICADO (69) */}

                        <ButtonDialogPromesa visible={dialogPromesas} data={dataPromesa} setDialogPromesas={setDialogPromesas}></ButtonDialogPromesa>

                        <Dialog
                            autoZIndex="false"
                            visible={dialogDireccion}
                            style={{ width: "800px" }}
                            header="Direcciones cliente"
                            modal
                            onHide={() => {
                                setDialogDireccion(false);
                            }}
                        >
                            <div className="confirmation-content">
                                <DataTable value={dataDirecciones} frozenWidth="300px" scrollable scrollHeight="400px" style={{ fontSize: "11px", width: "780px" }} loading={loading} className="p-datatable-sm p-datatable-gridlines">
                                    <Column field="FUENTE" style={{ fontSize: "11px" }} headerStyle={{ width: "150px" }} header="Fuente" frozen></Column>
                                    <Column field="DIRECCION" style={{ fontSize: "11px" }} headerStyle={{ width: "150px" }} header="Dirección" frozen></Column>
                                    <Column
                                        body={(rowData) => {
                                            return (
                                                <span style={{ fontSize: "11px" }}>
                                                    {rowData.DEPARTAMENTO}-{rowData.PROVINCIA}-{rowData.DISTRITO}
                                                </span>
                                            );
                                        }}
                                        headerStyle={{ width: "250px" }}
                                        header="Ubigeo"
                                    ></Column>
                                    <Column field="REF" style={{ fontSize: "11px" }} headerStyle={{ width: "450px" }} header="Referencia"></Column>
                                    <Column
                                        body={(rowData) => {
                                            return <span style={{ fontSize: "11px" }}>{rowData.TIPO}</span>;
                                        }}
                                        headerStyle={{ width: "100px" }}
                                        header="Tipo"
                                    ></Column>
                                </DataTable>
                            </div>
                        </Dialog>
                        <Dialog
                            autoZIndex="false"
                            visible={dialogPagos}
                            style={{ width: "750px" }}
                            header="Pagos"
                            modal
                            onHide={() => {
                                setDialogPagos(false);
                            }}
                        >
                            <div className="confirmation-content">
                                <DataTable value={dataPagos} scrollable scrollHeight="200px" style={{ fontSize: "12px" }} loading={loading} c lassName="p-datatable-sm p-datatable-gridlines">
                                    <Column field="FECHAPAG" header="FECHA"></Column>
                                    <Column field="MONTO" header="MONTO"></Column>
                                    <Column field="TIPO" header="TIPO"></Column>
                                </DataTable>
                            </div>
                        </Dialog>
                        <Dialog
                            autoZIndex="false"
                            visible={dialogCuotas}
                            style={{ width: "750px" }}
                            header="Cuotas"
                            modal
                            onHide={() => {
                                setDialogCuotas(false);
                            }}
                        >
                            <div className="confirmation-content">
                                <DataTable value={dataCuotas} scrollable scrollHeight="200px" style={{ fontSize: "12px" }} loading={loading} className="p-datatable-sm p-datatable-gridlines">
                                    <Column field="CUOTA" header="CUOTA"></Column>
                                    <Column field="TIPO" header="TIPO"></Column>
                                    <Column field="FECHACUO" header="FECHA"></Column>
                                    <Column field="MONTO" header="MONTO"></Column>
                                </DataTable>
                            </div>
                        </Dialog>
                        <Dialog
                            autoZIndex="false"
                            visible={dialogCampanas}
                            style={{ width: "750px" }}
                            header="Campañas"
                            modal
                            onHide={() => {
                                setDialogCampanas(false);
                            }}
                        >
                            <div className="confirmation-content">
                                <DataTable value={dataCampanas} scrollable scrollHeight="200px" style={{ fontSize: "12px" }} loading={loading} className="p-datatable-sm p-datatable-gridlines">
                                    <Column field="nombre" header="NOMBRE"></Column>
                                    <Column field="TIPO" header="TIPO"></Column>
                                    <Column field="FECHACAM" header="FECHACAM"></Column>
                                    <Column field="MONTO" header="MONTO"></Column>
                                    <Column field="PERCENT_DESC" header="DESC"></Column>
                                </DataTable>
                            </div>
                        </Dialog>

                        {/* ============================= REQUERIMIENTO CARLOS ============================= */}

                        <Dialog
                            autoZIndex="false"
                            visible={dialogTercerosByIdentificador}
                            style={{ width: "750px" }}
                            header="Avales"
                            modal
                            onHide={() => {
                                setDialogTercerosByIdentificador(false);
                            }}
                        >
                            <div className="confirmation-content">
                                <DataTable value={dataTercerosByIdentificador} scrollable scrollHeight="200px" loading={loading} className="p-datatable-sm">
                                    <Column field="DOCUMENTO" header="DOCUMENTO"></Column>
                                    <Column field="TIPO" header="TIPO"></Column>
                                    <Column field="NOMBRE_COMPLETO" header="NOMBRE"></Column>
                                </DataTable>
                            </div>
                        </Dialog>

                        {/* =============================== FIN REQUERIMIENTO =============================== */}

                        <Dialog
                            autoZIndex="false"
                            visible={dialogInfoadicional}
                            style={{ width: "750px" }}
                            header="Informacion adicional"
                            modal
                            onHide={() => {
                                setDialogInfoadicional(false);
                            }}
                        >
                            <div className="confirmation-content">
                                <DataTable value={customers} scrollable scrollHeight="200px" loading={loading} className="p-datatable-sm">
                                    <Column field="name" header="TIPO"></Column>
                                    <Column field="country.name" header="NOMBRE"></Column>
                                    <Column field="representative.name" header="CELULAR"></Column>
                                    <Column field="status" header="DIRECCION"></Column>
                                    <Column field="status" header="DISTRITO"></Column>
                                </DataTable>
                            </div>
                        </Dialog>

                        <DialogFilter columnsGridMain={columnsGridMain} filterGestion={filterGestion} entityId={panelContext.selectedEntityId} setDialogFiltro={setDialogFiltro} dialogFiltro={dialogFiltro}></DialogFilter>
                    </div>
                </div>
            </div>
            {/* <DialogFormGestion
                formGestionType={formGestionType}
                entityId={panelContext.selectedEntityId}
                carteraId={panelContext.selectedCarteraId}
                handleRefeshHistorial={handleRefeshHistorial}
                customer={panelContext.selectedCustomer}
                dialogGestion={dialogGestion}
                userid={panelContext.userLogin.IDPERSONAL}
                selectedEntityId={panelContext.selectedEntityId}
                selectedCarteraId={panelContext.selectedCarteraId}
                selectedPhone={panelContext.selectedPhone}
                setDialogGestion={setDialogGestion}
                showInfoCampo={showInfoCampo}
                currentUser={panelContext.userLogin}
                respuestasCliente={respuestasCliente}
                estadoAnimoCliente={estadoAnimoCliente}
            /> */}

            <DialogUpdateInfo customer={panelContext.selectedCustomer} showInfoDireccion={showInfoDireccion} setDialogActualizar={setDialogActualizar} dialogActualizar={dialogActualizar}></DialogUpdateInfo>

            {/* ================================== EDER WEBRTC ================================== */}
            {/* <PhoneModal /> */}
            <GestionJsSIP
                formGestionType={formGestionType}
                entityId={panelContext.selectedEntityId}
                carteraId={panelContext.selectedCarteraId}
                handleRefeshHistorial={handleRefeshHistorial}
                customer={panelContext.selectedCustomer}
                dialogGestion={dialogGestion}
                userid={panelContext.userLogin.IDPERSONAL}
                selectedEntityId={panelContext.selectedEntityId}
                selectedCarteraId={panelContext.selectedCarteraId}
                selectedPhone={panelContext.selectedPhone}
                setDialogGestion={setDialogGestion}
                showInfoCampo={showInfoCampo}
                currentUser={panelContext.userLogin}
                respuestasCliente={respuestasCliente}
                estadoAnimoCliente={estadoAnimoCliente}
            />
            {/* ================================== EDER WEBRTC ================================== */}

            {/* ========================== REQUERIMIENTO OMNICANAL ========================== */}
            <DialogWhatsApp visible={dialogWhatsApp} setVisible={setDialogWhatsApp} texto={textoWhatsApp} setTexto={setTextoWhatsApp} toast={toastWhatsApp} />

            <DialogSMS visible={dialogSMS} setVisible={setDialogSMS} texto={textoSMS} setTexto={setTextoSMS} toast={toastSMS} />

            <DialogIVR visible={dialogIVR} setVisible={setDialogIVR} texto={textoIVR} setTexto={setTextoIVR} toast={toastIVR} />

            {/* ========================== REQUERIMIENTO OMNICANAL ========================== */}
        </React.Fragment>
    );
};
