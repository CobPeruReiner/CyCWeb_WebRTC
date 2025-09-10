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

export const PanelGestion = (props) => {
    const { selectedPhone, setSelectedPhone, toast, toastJsIP, showFormNewGestionRTC, showPhone, dialogGestion, setDialogGestion, showInfoCampo, setShowInfoCampo, formGestionType, setFormGestionType } = useContext(SIPContext);

    // const API_URL_DOWNLOAD = `${process.env.REACT_APP_ROUTE_API}download`;
    const API_URL_JUDICIAL = `${process.env.REACT_APP_ROUTE_API}judicial`;
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

    // ========================= REQUERIMIENTO JUDICIAL =========================
    const toastJudicial = useRef(null);
    const [isPostingJudicial, setIsPostingJudicial] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitedDemanda, setSubmitedDemanda] = useState(false);
    const [submitedEstadoProcesal, setSubmitedEstadoProcesal] = useState(false);
    const [submitedPropiedad, setSubmitedPropiedad] = useState(false);
    const [submitedSolMedCautelar, setSubmitedSolMedCautelar] = useState(false);
    const [submitedSolDemanda, setSubmitedSolDemanda] = useState(false);
    const [submitedSegProcesal, setSubmitedSegProcesal] = useState(false);
    const [submitedInEjecForzada, setSubmitedInEjecForzada] = useState(false);

    const [historialCalificacionDemanda, setHistorialCalificacionDemanda] = useState(false);
    const [HDetDemandas, setHDetDemandas] = useState([]);

    const [historialEstadoProcesal, setHistorialEstadoProcesal] = useState(false);
    const [HEstadoProcesal, setHEstadoProcesal] = useState([]);

    const [tSegProcesalPositivo, setTSegProcesalPositivo] = useState(false);
    const [seguimientoProcesal, setSeguimientoProcesal] = useState([]);

    const [tEjecForzadaPositivo, setTEjecForzadaPositivo] = useState(false);
    const [ejecucionForzada, setEjecucionForzada] = useState([]);

    const [hSolMedidaCautelar, setHSolMedidaCautelar] = useState([]);
    const [mSolMedidaCautelar, setMSolMedidaCautelar] = useState(false);

    const [hSolPropiedad, setHSolPropiedad] = useState([]);
    const [mSolPropiedad, setMSolPropiedad] = useState(false);

    const [hSolDemandaPositivo, setHSolDemandaPositivo] = useState([]);
    const [mSolDemandaPositivo, setMSolDemandaPositivo] = useState(false);

    const [estadoAnimoCliente, setEstadoAnimoCliente] = useState([]);
    const [respuestasCliente, setrespuestasCliente] = useState([]);

    // Formulario
    const [form, setForm] = useState(valoresIniciales);

    const [dialogGestionJudicial, setDialogGestionJudicial] = useState(false);

    const [dataJudicial, setDataJudicial] = useState([]);

    const [modoLectura, setModoLectura] = useState(false);

    const [bloqueos, setBloqueos] = useState({
        bloqueaDemanda: false,
        bloqueaInfoPropiedad: !(valoresIniciales.tipoBienesSC === 2 || valoresIniciales.tipoBienesSC === 1),
        bloqueaPosteriorMedCautelar: false,
        bloqueaPosteriorCalDemanda: false,
        bloqueaPosteriorCalDemandaNegativa: false,
        bloquearSaveInfoGestion: false,

        // CLIENTE NEGATIVO
        bloqueaCargaHistorialDemanda: false,
        bloqueaCargaEstadoProcesal: false,

        // CLIENTE POSITVIO
        bloquearCargaPropiedad: false,
        bloquearCargaSolMedCautelar: false,
        bloquearCargaSolDemanda: false,
        bloqueaCargaSeguimientoProcesal: false,
        bloqueaCargaEjecucionForzada: false,
    });

    // ========================= REQUERIMIENTO JUDICIAL =========================

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

    {
        /* ========================= REQUERIMIENTO JUDICIAL ========================= */
    }
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

    // Logica de la solicitud de cautelar
    // const handleSolicitudCautelarChange = async (e) => {
    //     const value = e.value;

    //     if (value == 2) {
    //         try {
    //             const response = await axios.get(`${API_URL_JUDICIAL}/get-last-det-demanda/${form.SJIdExpediente}`);
    //             const { data } = response;

    //             if (data.ok && data.options.length > 0) {
    //                 const detalle = data.options[0];

    //                 // Simulamos carga automática de datos de demanda
    //                 setForm((prev) => ({
    //                     ...prev,
    //                     solicitudCautelar: value,
    //                     SJIdDemandaDet: detalle.SJIdDemandaDet || null,
    //                     juzgadoDemandaSC: detalle.SJJuzgado || "",
    //                     nroExpedienteDemandaSC: detalle.SJNumeroExpediente || "",
    //                     calDemandaSC: detalle.SJIdDemanda || "",
    //                     fechaCalDemandaSC: detalle.SJFechaDemanda ? new Date(detalle.SJFechaDemanda) : null,
    //                     tipoEscritoCalDemandaSC: detalle.SJTipoEscrito || "",
    //                     observacionDemandaSC: detalle.SJObservacion || "",
    //                     observacionCalDemandaSC: detalle.SJObservacionCal || "",
    //                     adjuntoCalDemandaSC: detalle.SJDemandaAdjunto || null,
    //                 }));

    //                 setBloqueos((prev) => ({
    //                     ...prev,
    //                     bloqueaDemanda: true,
    //                 }));
    //             } else {
    //                 console.warn("No se encontró detalle de demanda");

    //                 toastJudicial.current?.show({
    //                     severity: "warn",
    //                     summary: "Detalle Demanda",
    //                     detail: "No se encontró detalle de demanda.",
    //                     life: 3000,
    //                 });
    //             }
    //         } catch (error) {
    //             console.error("Error al obtener detalle de demanda:", error);

    //             toastJudicial.current?.show({
    //                 severity: "error",
    //                 summary: "Detalle Demanda",
    //                 detail: "Error al obtener detalle de demanda.",
    //                 life: 3000,
    //             });
    //         }
    //     } else {
    //         // Al seleccionar FUERA DEL PROCESO, limpiamos los campos automáticos
    //         setForm((prev) => ({
    //             ...prev,
    //             solicitudCautelar: value,
    //             juzgadoDemandaSC: "",
    //             nroExpedienteDemandaSC: "",
    //             calDemandaSC: null,
    //             fechaCalDemandaSC: null,
    //             tipoEscritoCalDemandaSC: "",
    //             observacionDemandaSC: "",
    //             observacionCalDemandaSC: "",
    //             adjuntoCalDemandaSC: null,
    //         }));

    //         setBloqueos((prev) => ({
    //             ...prev,
    //             bloqueaDemanda: false,
    //         }));
    //     }
    // };

    // Logica de Tipo de Bienes
    const handleTipoBienesChange = (e) => {
        const value = e.value;

        if (value === 2 || value === 1) {
            setBloqueos((prev) => ({
                ...prev,
                bloqueaInfoPropiedad: false,
            }));
        } else {
            // Limpiamos los campos relacionados a Información de Propiedad
            setForm((prev) => ({
                ...prev,
                tipoBienesSC: value,
                estadoPropiedadSC: null,
                estadoPropiedadObsSC: "",
                gravamenSC: null,
                tipoGravamenSC: null,
                tipoGravamenObsSC: "",
                rangoGravamenSC: null,
                montoGravamenSC: "",
                detalleDelBienSC: "",
                fotoSC: null,
                partidaSC: null,
            }));

            setBloqueos((prev) => ({
                ...prev,
                bloqueaInfoPropiedad: true,
            }));

            // Nota: como hacemos el setForm completo arriba, este puede ir después del setForm
            return;
        }

        // Si es muebles o inmuebles, actualizamos el tipo sin limpiar
        setForm((prev) => ({
            ...prev,
            tipoBienesSC: value,
        }));
    };

    // Logica de Calificacion Demanda de cliente negativo
    const handleCalificacionDemandaNegativaChange = (e) => {
        const value = e.value;

        if (value == 1 || value == 2) {
            setForm((prev) => ({
                ...prev,
                calificacionDemanda: value,
                estadoProcesal: null,
                detalleEstadoFecha: null,
                detalleTipoEscrito: "",
                detalleEstadoTipoEscrito: "",
                detalleEstadoAdjunto: null,
                detalleEstadoObservacion: "",
            }));

            setBloqueos((prev) => ({
                ...prev,
                bloqueaPosteriorCalDemandaNegativa: true,
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                calificacionDemanda: value,
            }));

            setBloqueos((prev) => ({
                ...prev,
                bloqueaPosteriorCalDemandaNegativa: false,
            }));
        }
    };

    // Logica de Calificacion Demanda de cliente positivo
    const handleCalificacionDemandaChange = (e) => {
        const value = e.value;

        if (value == 1 || value == 2) {
            setForm((prev) => ({
                ...prev,
                juzgadoDemandaSC: "",
                nroExpedienteDemandaSC: "",
                observacionDemandaSC: "",
                calDemandaSC: value,
                tipoEscritoCalDemandaSC: "",
                estadoProcesalDP: null,
                detalleEstadoFechaDP: null,
                detalleEstadoTipoEscritoDP: "",
                detalleEstadoAdjuntoDP: null,
                detalleEstadoObservacionDP: "",
                inicioEjecucion: null,
                detalleInicioAdjuntoDP: null,
                detalleInicioFechaDP: null,
                detalleInicioTipoEscritoDP: "",
                detalleInicioObservacionDP: "",
            }));

            setBloqueos((prev) => ({
                ...prev,
                bloqueaPosteriorCalDemanda: true,
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                calDemandaSC: value,
            }));

            setBloqueos((prev) => ({
                ...prev,
                bloqueaPosteriorCalDemanda: false,
            }));
        }
    };

    const handleCalificacionMCautelarChange = (e) => {
        const value = e.value;

        setForm((prev) => ({
            ...prev,
            calificacionMCautelar: value,
        }));

        if (value == 1 || value == 2) {
            // Siempre limpiamos los posteriores de Medida Cautelar
            setForm((prev) => ({
                ...prev,
                jusgadoSC: "",
                nroExpedienteSC: "",
                fechaSC: null,
                adjuntoFechaSC: null,
                observacionSC: "",
                tipoEscritoMCautelar: "",
                estadoProcesalDP: null,
                detalleEstadoFechaDP: null,
                detalleEstadoTipoEscritoDP: "",
                detalleEstadoAdjuntoDP: null,
                detalleEstadoObservacionDP: "",
                inicioEjecucion: null,
                detalleInicioAdjuntoDP: null,
                detalleInicioFechaDP: null,
                detalleInicioTipoEscritoDP: "",
                detalleInicioObservacionDP: "",
            }));

            setBloqueos((prev) => ({
                ...prev,
                bloqueaPosteriorMedCautelar: true,
            }));

            // Solo limpiamos Demanda si la Solicitud Cautelar es FUERA DEL PROCESO
            if (form.solicitudCautelar != 2) {
                setForm((prev) => ({
                    ...prev,
                    juzgadoDemandaSC: "",
                    nroExpedienteDemandaSC: "",
                    calDemandaSC: null,
                    fechaCalDemandaSC: null,
                    tipoEscritoCalDemandaSC: "",
                    observacionDemandaSC: "",
                    observacionCalDemandaSC: "",
                    adjuntoCalDemandaSC: null,
                }));
            }
        } else {
            setBloqueos((prev) => ({
                ...prev,
                bloqueaPosteriorMedCautelar: false,
            }));
        }
    };

    const onDialogGestionJudicial = () => {
        setDialogGestionJudicial(true);
        setModoLectura(false);
    };

    // Limpiar form cuando se cierra
    const closeDialogGestionJudicial = () => {
        setForm(valoresIniciales);
        setSubmitted(false);
        setIsPostingJudicial(false);
        setDialogGestionJudicial(false);
        setBloqueos({
            bloqueaDemanda: false,
            bloqueaInfoPropiedad: !(valoresIniciales.tipoBienesSC === 2 || valoresIniciales.tipoBienesSC === 1),
            bloqueaPosteriorCalDemanda: false,
            bloqueaPosteriorMedCautelar: false,
            bloqueaPosteriorCalDemandaNegativa: false,
        });
    };

    const handleVerJudicial = (item) => {
        console.log("ABRIR GESTION JUDICIAL: ", item);

        const nuevaCalificacion = item.SJIdDemanda;

        if (item.SJIDBusqueda === 1) {
            setForm({
                ...valoresIniciales,
                SJIdExpediente: item.SJIdExpediente,
                SJIdDemandaDet: item.SJIdDemandaDet || null,
                SJIdDetEstadoProcesal: item.SJIdDetEstadoProcesal || null,

                tipoBusqueda: item.SJIDBusqueda,
                nroCargoExpediente: item.SJNumCargoExpediente,
                juzgado: item.SJJuzgado,
                observacion: item.ObservacionExpediente,
                fechaIngreso: item.SJFechaIngreso ? new Date(item.SJFechaIngreso) : null,
                fechaDemanda: item.SJFechaDemanda ? new Date(item.SJFechaDemanda) : null,
                nroExpediente: item.SJNumeroExpediente,

                // Archivos:
                adjuntoNroCargoExpediente: item.SJExpedienteADJ,
                adjuntoFechaDemanda: item.SJDemandaADJ,
            });
        } else {
            setForm({
                ...valoresIniciales,
                SJIdExpediente: item.SJIdExpediente,
                tipoBusqueda: item.TBusquedaSolCautelar,
                SJIdSolicitudCautelar: item.SJIdSolicitudCautelar,
                fechaIngresoSC: item.FechaIngresoSC ? new Date(item.FechaIngresoSC) : null,
                nroCargoExpAdmSC: item.SJNumCargoExpAdm,
                solicitudCautelar: item.SJIdSolicitudCautelarTipo,
                formaSC: item.SJIdFormaCautelar,
                tipoBienesSC: item.SJIdTipoBienes,
                embargoSC: item.SJIdEmbargo,
                secuestroSC: item.SJIdSecuestro,
                adjuntoSecuestroSC: item.SJAdjuntoSecuestro,
                adjuntoEmbargoSC: item.SJAdjuntoEmbargo,
                adjuntoSolicitudCautelar: item.SJAdjuntoSolicitudCautelar,
                nroCargoExpAdmAdjuntoSC: item.SJAdjuntoNumCargoExpAdm,
            });

            if (item.SJIdTipoBienes === 2 || item.SJIdTipoBienes === 1) {
                setBloqueos((prev) => ({
                    ...prev,
                    bloqueaInfoPropiedad: false,
                }));
            }

            setBloqueos((prev) => ({
                ...prev,
                bloquearSaveInfoGestion: true,
            }));
        }

        setModoLectura(true);
        setDialogGestionJudicial(true);
    };

    const formatDate = (value) => {
        return value ? moment(value).format("YYYY-MM-DD HH:mm:ss") : "";
    };

    // const handleGuardarExpediente = async () => {
    //     if (!modoLectura) {
    //         setSubmitted(true);

    //         if (!form.fechaIngreso || !form.juzgado || !form.nroCargoExpediente || !form.adjuntoNroCargoExpediente || !form.nroExpediente || !form.fechaDemanda || !form.adjuntoFechaDemanda || !form.observacion) {
    //             toastJudicial.current?.show({
    //                 severity: "warn",
    //                 summary: "Campos incompletos",
    //                 detail: "Complete todos los campos obligatorios del formulario.",
    //                 life: 3000,
    //             });
    //             return;
    //         }

    //         setIsPostingJudicial(true);

    //         try {
    //             const formData = new FormData();

    //             const formatDate = (value) => {
    //                 return value ? moment(value).format("YYYY-MM-DD HH:mm:ss") : "";
    //             };

    //             formData.append("SJFechaReg", moment().format("YYYY-MM-DD HH:mm:ss"));
    //             formData.append("usuarioReg", panelContext.userLogin.IDPERSONAL);
    //             formData.append("tipoBusqueda", form.tipoBusqueda.toString());
    //             formData.append("fechaIngreso", formatDate(form.fechaIngreso));
    //             formData.append("juzgado", form.juzgado);
    //             formData.append("nroCargoExpediente", form.nroCargoExpediente);
    //             formData.append("nroExpediente", form.nroExpediente);
    //             formData.append("fechaDemanda", formatDate(form.fechaDemanda));
    //             formData.append("observacion", form.observacion);

    //             if (form.adjuntoNroCargoExpediente) {
    //                 formData.append("adjuntoNroCargoExpediente", form.adjuntoNroCargoExpediente);
    //             }
    //             if (form.adjuntoFechaDemanda) {
    //                 formData.append("adjuntoFechaDemanda", form.adjuntoFechaDemanda);
    //             }

    //             const { data } = await axios.post(`${API_URL_JUDICIAL}/save-expediente`, formData, {
    //                 headers: {
    //                     "Content-Type": "multipart/form-data",
    //                 },
    //             });

    //             if (data.ok) {
    //                 // console.log("ID Expediente: ", data.insertId);
    //                 setModoLectura(true);

    //                 setForm((prev) => ({
    //                     ...prev,
    //                     SJIdExpediente: data.insertId,
    //                 }));

    //                 toastJudicial.current.show({ severity: "success", summary: "Éxito", detail: "Expediente guardado correctamente.", life: 3000 });
    //             } else {
    //                 toastJudicial.current.show({ severity: "error", summary: "Error", detail: "No se pudo guardar.", life: 3000 });
    //             }
    //         } catch (error) {
    //             console.error("Error al guardar el expediente:", error);

    //             toastJudicial.current.show({ severity: "error", summary: "Error", detail: "Ocurrió un error inesperado.", life: 3000 });
    //         } finally {
    //             setIsPostingJudicial(false);
    //             loadGestionesJudiciales();
    //             setSubmitted(false);
    //         }
    //     }
    // };

    // const handleGuardarDemanda = async () => {
    //     setSubmitedDemanda(true);

    //     if (!form.SJIdExpediente) {
    //         toastJudicial.current?.show({
    //             severity: "warn",
    //             summary: "Expediente requerido",
    //             detail: "Debe ingresar el expediente.",
    //             life: 3000,
    //         });
    //         return;
    //     }

    //     if (!bloqueos.bloqueaPosteriorCalDemandaNegativa) {
    //         if (!form.calificacionDemanda || !form.detalleFecha || !form.detalleTipoEscrito || !form.detalleAdjunto || !form.detalleObservacion) {
    //             toastJudicial.current?.show({
    //                 severity: "warn",
    //                 summary: "Campos incompletos",
    //                 detail: "Complete todos los campos obligatorios del formulario.",
    //                 life: 3000,
    //             });
    //             return;
    //         }
    //     } else {
    //         if (!form.detalleObservacion || !form.detalleAdjunto || !form.detalleFecha) {
    //             toastJudicial.current?.show({
    //                 severity: "warn",
    //                 summary: "Observación requerida",
    //                 detail: "Debe ingresar la observación.",
    //                 life: 3000,
    //             });
    //             return;
    //         }
    //     }

    //     setIsPostingJudicial(true);

    //     try {
    //         const formData = new FormData();

    //         const formatDate = (value) => {
    //             return value ? moment(value).format("YYYY-MM-DD HH:mm:ss") : "";
    //         };

    //         formData.append("SJFechaReg", moment().format("YYYY-MM-DD HH:mm:ss"));
    //         formData.append("usuarioReg", panelContext.userLogin.IDPERSONAL);
    //         formData.append("calificacionDemanda", form.calificacionDemanda?.toString() ?? "");
    //         formData.append("detalleFecha", formatDate(form.detalleFecha));
    //         formData.append("detalleTipoEscrito", form.detalleTipoEscrito ?? "");
    //         formData.append("detalleObservacion", form.detalleObservacion ?? "");
    //         formData.append("SJIdExpediente", form.SJIdExpediente ?? "");

    //         if (form.detalleAdjunto) {
    //             formData.append("detalleAdjunto", form.detalleAdjunto);
    //         }

    //         const { data } = await axios.post(`${API_URL_JUDICIAL}/save-detalle-demanda`, formData, {
    //             headers: {
    //                 "Content-Type": "multipart/form-data",
    //             },
    //         });

    //         if (data.ok) {
    //             toastJudicial.current.show({ severity: "success", summary: "Éxito", detail: "Demanda guardada correctamente.", life: 3000 });

    //             setForm((prev) => ({
    //                 ...prev,
    //                 SJIdDemandaDet: null,
    //                 calificacionDemanda: null,
    //                 detalleFecha: null,
    //                 detalleTipoEscrito: "",
    //                 detalleAdjunto: null,
    //                 detalleObservacion: "",
    //             }));
    //         } else {
    //             toastJudicial.current.show({ severity: "error", summary: "Error", detail: "No se pudo guardar.", life: 3000 });
    //         }
    //     } catch (error) {
    //         console.error("Error al guardar la demanda:", error);
    //         toastJudicial.current.show({ severity: "error", summary: "Error", detail: "Ocurrio un error inesperado.", life: 3000 });
    //     } finally {
    //         setIsPostingJudicial(false);
    //         loadGestionesJudiciales();
    //         setSubmitedDemanda(false);

    //         setBloqueos((prev) => ({
    //             ...prev,
    //             bloqueaPosteriorCalDemandaNegativa: false,
    //         }));
    //     }
    // };

    // const handleGuardarDetEstadoProcesal = async () => {
    //     setSubmitedEstadoProcesal(true);

    //     if (!form.SJIdExpediente) {
    //         toastJudicial.current?.show({
    //             severity: "warn",
    //             summary: "Expediente requerido",
    //             detail: "Debe ingresar el expediente.",
    //             life: 3000,
    //         });
    //         return;
    //     }

    //     if (!form.estadoProcesal || !form.detalleEstadoFecha || !form.detalleEstadoTipoEscrito || !form.detalleEstadoAdjunto || !form.detalleEstadoObservacion) {
    //         toastJudicial.current?.show({
    //             severity: "warn",
    //             summary: "Campos incompletos",
    //             detail: "Complete todos los campos obligatorios del formulario.",
    //             life: 3000,
    //         });
    //         return;
    //     }

    //     setIsPostingJudicial(true);

    //     try {
    //         const formData = new FormData();

    //         const formatDate = (value) => {
    //             return value ? moment(value).format("YYYY-MM-DD HH:mm:ss") : "";
    //         };

    //         formData.append("SJFechaReg", moment().format("YYYY-MM-DD HH:mm:ss"));
    //         formData.append("usuarioReg", panelContext.userLogin.IDPERSONAL);
    //         formData.append("estadoProcesal", form.estadoProcesal?.toString() ?? "");
    //         formData.append("detalleEstadoFecha", formatDate(form.detalleEstadoFecha));
    //         formData.append("detalleEstadoTipoEscrito", form.detalleEstadoTipoEscrito ?? "");
    //         formData.append("detalleEstadoObservacion", form.detalleEstadoObservacion ?? "");
    //         formData.append("SJIdExpediente", form.SJIdExpediente ?? "");

    //         if (form.detalleEstadoAdjunto) {
    //             formData.append("detalleEstadoAdjunto", form.detalleEstadoAdjunto);
    //         }

    //         const { data } = await axios.post(`${API_URL_JUDICIAL}/save-detalle-estado-procesal`, formData, {
    //             headers: {
    //                 "Content-Type": "multipart/form-data",
    //             },
    //         });

    //         if (data.ok) {
    //             toastJudicial.current.show({ severity: "success", summary: "Éxito", detail: "Estado Procesal guardado correctamente.", life: 3000 });

    //             setForm((prev) => ({
    //                 ...prev,
    //                 SJIdEstadoProcesalDet: null,
    //                 estadoProcesal: null,
    //                 detalleEstadoFecha: null,
    //                 detalleEstadoTipoEscrito: "",
    //                 detalleEstadoAdjunto: null,
    //                 detalleEstadoObservacion: "",
    //             }));
    //         } else {
    //             toastJudicial.current.show({ severity: "error", summary: "Error", detail: "No se pudo guardar.", life: 3000 });
    //         }
    //     } catch (error) {
    //         console.error("Error al guardar la demanda:", error);
    //         toastJudicial.current.show({ severity: "error", summary: "Error", detail: "Ocurrio un error inesperado.", life: 3000 });
    //     } finally {
    //         setIsPostingJudicial(false);
    //         loadGestionesJudiciales();
    //         setSubmitedEstadoProcesal(false);

    //         setBloqueos((prev) => ({
    //             ...prev,
    //             bloqueaPosteriorCalDemandaNegativa: false,
    //         }));
    //     }
    // };

    // INFORMACION DE LA GESTION - CLIENTE POSITIVO
    // const saveInfoGestion = async () => {
    //     if (!bloqueos.bloquearSaveInfoGestion) {
    //         if (form.SJIdExpediente) {
    //             setSubmitted(true);

    //             if (!form.fechaIngresoSC || !form.nroCargoExpAdmSC || !form.nroCargoExpAdmAdjuntoSC || !form.tipoBusqueda || !form.solicitudCautelar || !form.adjuntoSolicitudCautelar || !form.formaSC || !form.tipoBienesSC) {
    //                 toastJudicial.current?.show({
    //                     severity: "warn",
    //                     summary: "Campos incompletos",
    //                     detail: "Complete todos los campos obligatorios en la sección de Información de la Gestión.",
    //                     life: 3000,
    //                 });
    //                 return;
    //             }

    //             if (form.formaSC === 1) {
    //                 if (!form.embargoSC || !form.adjuntoEmbargoSC) {
    //                     toastJudicial.current?.show({
    //                         severity: "warn",
    //                         summary: "Campos de embargo incompletos",
    //                         detail: "Debe completar los datos y adjuntos del embargo.",
    //                         life: 3000,
    //                     });
    //                     return;
    //                 }
    //             }

    //             if (form.formaSC === 2) {
    //                 if (!form.secuestroSC || !form.adjuntoSecuestroSC) {
    //                     toastJudicial.current?.show({
    //                         severity: "warn",
    //                         summary: "Campos de secuestro incompletos",
    //                         detail: "Debe completar los datos y adjuntos del secuestro.",
    //                         life: 3000,
    //                     });
    //                     return;
    //                 }
    //             }

    //             setIsPostingJudicial(true);

    //             try {
    //                 const formData = new FormData();

    //                 formData.append("SJFechaReg", moment().format("YYYY-MM-DD HH:mm:ss"));
    //                 formData.append("usuarioReg", panelContext.userLogin.IDPERSONAL);
    //                 formData.append("SJIdExpediente", form.SJIdExpediente ?? "");

    //                 // Agregar campos simples al FormData
    //                 camposSimples.forEach((campo) => {
    //                     const valor = form[campo];

    //                     if (campo.toLowerCase().includes("fecha")) {
    //                         formData.append(campo, formatDate(valor));
    //                     } else {
    //                         formData.append(campo, valor ?? "");
    //                     }
    //                 });

    //                 // Agregar archivos si existen
    //                 Object.entries(camposArchivos).forEach(([key, field]) => {
    //                     const archivo = form[field];
    //                     if (archivo instanceof File) {
    //                         formData.append(field, archivo);
    //                     }
    //                 });

    //                 console.log("Enviando: ", form);

    //                 const { data } = await axios.post(`${API_URL_JUDICIAL}/save-info-gestion`, formData, {
    //                     headers: {
    //                         "Content-Type": "multipart/form-data",
    //                     },
    //                 });

    //                 if (data.ok) {
    //                     toastJudicial.current.show({ severity: "success", summary: "Éxito", detail: "Información de la Gestion guardado correctamente.", life: 3000 });

    //                     setBloqueos((prev) => ({
    //                         ...prev,
    //                         bloquearSaveInfoGestion: true,
    //                     }));

    //                     setForm((prev) => ({
    //                         ...prev,
    //                         SJIdSolicitudCautelar: data.insertId,
    //                     }));
    //                 } else {
    //                     toastJudicial.current.show({ severity: "error", summary: "Error", detail: "No se pudo guardar.", life: 3000 });
    //                 }
    //             } catch (error) {
    //                 console.error("Error al guardar la demanda:", error);
    //                 toastJudicial.current.show({ severity: "error", summary: "Error", detail: "Ocurrio un error inesperado.", life: 3000 });
    //             } finally {
    //                 setIsPostingJudicial(false);
    //                 loadGestionesJudiciales();
    //                 setSubmitedDemanda(false);
    //             }
    //         } else {
    //             toastJudicial.current?.show({
    //                 severity: "warn",
    //                 summary: "Expediente requerido",
    //                 detail: "Debe ingresar el expediente.",
    //                 life: 3000,
    //             });
    //         }
    //     }
    // };

    const esFormularioPropiedadValido = () => {
        if (bloqueos.bloqueaInfoPropiedad) {
            return false;
        }

        const camposBasicosCompletos = form.estadoPropiedadSC && form.gravamenSC && form.fotoSC && form.partidaSC && form.detalleDelBienSC;

        if (!camposBasicosCompletos) return false;

        if (form.gravamenSC === 1) {
            if (!form.tipoGravamenSC || !form.rangoGravamenSC || !form.montoGravamenSC) {
                return false;
            }

            if (form.tipoGravamenSC === 3 && !form.tipoGravamenObsSC) {
                return false;
            }
        }

        if (form.estadoPropiedadSC === 4 && !form.estadoPropiedadObsSC) {
            return false;
        }

        return true;
    };

    // INFORMACION DE LA PROPIEDAD - CLIENTE POSITIVO
    // const saveInfoPropiedad = async () => {
    //     if (form.SJIdSolicitudCautelar) {
    //         if (!bloqueos.bloqueaInfoPropiedad) {
    //             setSubmitedPropiedad(true);
    //             setIsPostingJudicial(true);

    //             try {
    //                 const formData = new FormData();

    //                 formData.append("SJFechaReg", moment().format("YYYY-MM-DD HH:mm:ss"));
    //                 formData.append("usuarioReg", panelContext.userLogin.IDPERSONAL);
    //                 formData.append("SJIdSolicitudCautelar", form.SJIdSolicitudCautelar ?? null);

    //                 // Agregar campos simples al FormData
    //                 camposSimples.forEach((campo) => {
    //                     const valor = form[campo];

    //                     if (campo.toLowerCase().includes("fecha")) {
    //                         formData.append(campo, formatDate(valor));
    //                     } else {
    //                         formData.append(campo, valor ?? "");
    //                     }
    //                 });

    //                 // Agregar archivos si existen
    //                 Object.entries(camposArchivos).forEach(([key, field]) => {
    //                     const archivo = form[field];
    //                     if (archivo instanceof File) {
    //                         formData.append(field, archivo);
    //                     }
    //                 });

    //                 const { data } = await axios.post(`${API_URL_JUDICIAL}/save-info-propiedad`, formData, {
    //                     headers: {
    //                         "Content-Type": "multipart/form-data",
    //                     },
    //                 });

    //                 if (data.ok) {
    //                     toastJudicial.current.show({ severity: "success", summary: "Éxito", detail: "Información de la propiedad guardado correctamente.", life: 3000 });

    //                     setForm((prev) => ({
    //                         ...prev,
    //                         estadoPropiedadSC: null,
    //                         gravamenSC: null,
    //                         tipoGravamenSC: null,
    //                         rangoGravamenSC: null,
    //                         montoGravamenSC: "",
    //                         fotoSC: null,
    //                         partidaSC: null,
    //                         detalleDelBienSC: "",
    //                         estadoPropiedadObsSC: "",
    //                         tipoGravamenObsSC: "",
    //                     }));
    //                 } else {
    //                     toastJudicial.current.show({ severity: "error", summary: "Error", detail: "No se pudo guardar.", life: 3000 });
    //                 }
    //             } catch (error) {
    //                 console.error("Error al guardar la demanda:", error);
    //                 toastJudicial.current.show({ severity: "error", summary: "Error", detail: "Ocurrio un error inesperado.", life: 3000 });
    //             } finally {
    //                 setIsPostingJudicial(false);
    //                 loadGestionesJudiciales();
    //                 setSubmitedPropiedad(false);
    //             }
    //         }
    //     } else {
    //         toastJudicial.current?.show({
    //             severity: "warn",
    //             summary: "Solicitud Cautelar requerida",
    //             detail: "Debe ingresar la solicitud cautelar.",
    //             life: 3000,
    //         });
    //     }
    // };

    const esFormularioMedidaCautelarValido = () => {
        if (!form.calificacionMCautelar) return;

        // Validación para improcedente/inadmisible
        if (form.calificacionMCautelar === 1 || form.calificacionMCautelar === 2) {
            return form.fechaMCautelar && form.adjuntoMCautelar instanceof File && form.observacionMCautelar;
        }

        if (bloqueos.bloqueaPosteriorMedCautelar) return true;

        const camposCompletos = form.jusgadoSC && form.nroExpedienteSC && form.fechaSC && form.adjuntoFechaSC instanceof File && form.observacionSC;

        return camposCompletos;
    };

    // SOLICITUD DE LA MEDIDA CAUTELAR - CLIENTE POSITIVO
    // const saveSolMedidaCautelar = async () => {
    //     if (form.SJIdSolicitudCautelar) {
    //         if (!bloqueos.bloquearCargaSolMedCautelar) {
    //             setSubmitedSolMedCautelar(true);
    //             setIsPostingJudicial(true);

    //             try {
    //                 const formData = new FormData();

    //                 formData.append("SJFechaReg", moment().format("YYYY-MM-DD HH:mm:ss"));
    //                 formData.append("usuarioReg", panelContext.userLogin.IDPERSONAL);
    //                 formData.append("SJIdSolicitudCautelar", form.SJIdSolicitudCautelar ?? null);

    //                 // Agregar campos simples al FormData
    //                 camposSimples.forEach((campo) => {
    //                     const valor = form[campo];

    //                     if (campo.toLowerCase().includes("fecha")) {
    //                         formData.append(campo, formatDate(valor));
    //                     } else {
    //                         formData.append(campo, valor ?? "");
    //                     }
    //                 });

    //                 // Agregar archivos si existen
    //                 Object.entries(camposArchivos).forEach(([key, field]) => {
    //                     const archivo = form[field];
    //                     if (archivo instanceof File) {
    //                         formData.append(field, archivo);
    //                     }
    //                 });

    //                 const { data } = await axios.post(`${API_URL_JUDICIAL}/save-info-medida-cautelar`, formData, {
    //                     headers: {
    //                         "Content-Type": "multipart/form-data",
    //                     },
    //                 });

    //                 if (data.ok) {
    //                     toastJudicial.current.show({
    //                         severity: "success",
    //                         summary: "Éxito",
    //                         detail: "Medida cautelar guardada correctamente.",
    //                         life: 3000,
    //                     });

    //                     setBloqueos((prev) => ({
    //                         ...prev,
    //                         bloqueaPosteriorMedCautelar: false,
    //                     }));

    //                     setForm((prev) => ({
    //                         ...prev,
    //                         jusgadoSC: "",
    //                         nroExpedienteSC: "",
    //                         fechaSC: null,
    //                         adjuntoFechaSC: null,
    //                         calificacionMCautelar: null,
    //                         observacionSC: "",
    //                         fechaMCautelar: null,
    //                         tipoEscritoMCautelar: "",
    //                         adjuntoMCautelar: null,
    //                         observacionMCautelar: "",
    //                     }));
    //                 } else {
    //                     toastJudicial.current.show({
    //                         severity: "error",
    //                         summary: "Error",
    //                         detail: "No se pudo guardar la medida cautelar.",
    //                         life: 3000,
    //                     });
    //                 }
    //             } catch (error) {
    //                 console.error("Error al guardar medida cautelar:", error);
    //                 toastJudicial.current.show({
    //                     severity: "error",
    //                     summary: "Error",
    //                     detail: "Ocurrió un error inesperado.",
    //                     life: 3000,
    //                 });
    //             } finally {
    //                 setSubmitedSolMedCautelar(false);
    //                 setIsPostingJudicial(false);
    //                 loadGestionesJudiciales();
    //             }
    //         }
    //     } else {
    //         toastJudicial.current?.show({
    //             severity: "warn",
    //             summary: "Solicitud Cautelar requerida",
    //             detail: "Debe ingresar la solicitud cautelar.",
    //             life: 3000,
    //         });
    //     }
    // };

    const esFormularioDemandaValido = () => {
        // Si el bloque de demanda está totalmente bloqueado, no se debe guardar
        if (bloqueos.bloqueaDemanda) return false;

        // Validación de calificación de demanda (independiente)
        const calificacionCompleta = form.calDemandaSC && form.fechaCalDemandaSC && form.adjuntoCalDemandaSC instanceof File;

        if (!calificacionCompleta) return false;

        // Validar campos del bloque completo si NO están bloqueados
        if (!bloqueos.bloqueaPosteriorCalDemanda && !bloqueos.bloqueaPosteriorMedCautelar) {
            const camposDemandaCompletos = form.juzgadoDemandaSC && form.nroExpedienteDemandaSC && form.observacionDemandaSC && form.tipoEscritoCalDemandaSC && form.observacionCalDemandaSC;

            if (!camposDemandaCompletos) return false;
        }

        return true;
    };

    // SOLICITUD DE LA DEMANDA - CLIENTE POSITIVO
    // const saveSolDemanda = async () => {
    //     if (form.SJIdExpediente) {
    //         if (!bloqueos.bloquearCargaSolDemanda) {
    //             setSubmitedSolDemanda(true);
    //             setIsPostingJudicial(true);

    //             try {
    //                 const formData = new FormData();

    //                 formData.append("SJFechaReg", moment().format("YYYY-MM-DD HH:mm:ss"));
    //                 formData.append("usuarioReg", panelContext.userLogin.IDPERSONAL);
    //                 formData.append("SJIdExpediente", form.SJIdExpediente ?? null);

    //                 // Agregar campos simples al FormData
    //                 camposSimples.forEach((campo) => {
    //                     const valor = form[campo];

    //                     if (campo.toLowerCase().includes("fecha")) {
    //                         formData.append(campo, formatDate(valor));
    //                     } else {
    //                         formData.append(campo, valor ?? "");
    //                     }
    //                 });

    //                 // Agregar archivos si existen
    //                 Object.entries(camposArchivos).forEach(([key, field]) => {
    //                     const archivo = form[field];
    //                     if (archivo instanceof File) {
    //                         formData.append(field, archivo);
    //                     }
    //                 });

    //                 const { data } = await axios.post(`${API_URL_JUDICIAL}/save-info-demanda`, formData, {
    //                     headers: {
    //                         "Content-Type": "multipart/form-data",
    //                     },
    //                 });

    //                 if (data.ok) {
    //                     toastJudicial.current.show({
    //                         severity: "success",
    //                         summary: "Éxito",
    //                         detail: "Información de la demanda guardada correctamente.",
    //                         life: 3000,
    //                     });

    //                     setBloqueos((prev) => ({
    //                         ...prev,
    //                         bloqueaPosteriorCalDemanda: false,
    //                     }));

    //                     setForm((prev) => ({
    //                         ...prev,
    //                         juzgadoDemandaSC: "",
    //                         nroExpedienteDemandaSC: "",
    //                         calDemandaSC: null,
    //                         observacionDemandaSC: "",
    //                         fechaCalDemandaSC: null,
    //                         tipoEscritoCalDemandaSC: "",
    //                         adjuntoCalDemandaSC: null,
    //                         observacionCalDemandaSC: "",
    //                     }));
    //                 } else {
    //                     toastJudicial.current.show({
    //                         severity: "error",
    //                         summary: "Error",
    //                         detail: "No se pudo guardar la información de la demanda.",
    //                         life: 3000,
    //                     });
    //                 }
    //             } catch (error) {
    //                 console.error("Error al guardar la información de la demanda:", error);
    //                 toastJudicial.current.show({
    //                     severity: "error",
    //                     summary: "Error",
    //                     detail: "Ocurrio un error inesperado.",
    //                     life: 3000,
    //                 });
    //             } finally {
    //                 setSubmitedSolDemanda(false);
    //                 setIsPostingJudicial(false);
    //                 loadGestionesJudiciales();
    //             }
    //         }
    //     } else {
    //         toastJudicial.current?.show({
    //             severity: "warn",
    //             summary: "Expediente requerido",
    //             detail: "Debe ingresar un expediente.",
    //             life: 3000,
    //         });
    //     }
    // };

    const esFormularioSegProcesalValido = () => {
        // Paso 1: Solo seguir si ambos son exactamente 3
        if (form.calificacionMCautelar === 1 || form.calificacionMCautelar === 2 || form.calDemandaSC === 1 || form.calDemandaSC === 2) {
            return false;
        }

        // Paso 2: Validar tipo de búsqueda
        if (form.tipoBusqueda !== 2) {
            return false;
        }

        // Paso 3: Validar bloqueo
        if (bloqueos.bloqueaPosteriorCalDemanda) {
            return false;
        }

        // Paso 4: Validar campos obligatorios
        const camposCompletos = form.estadoProcesalDP && form.detalleEstadoFechaDP && form.detalleEstadoTipoEscritoDP && form.detalleEstadoObservacionDP && form.detalleEstadoAdjuntoDP instanceof File;

        return camposCompletos;
    };

    // const onSaveSegProcesal = async () => {
    //     if (form.SJIdSolicitudCautelar) {
    //         if (!bloqueos.bloqueaCargaSeguimientoProcesal) {
    //             setSubmitedSegProcesal(true);
    //             setIsPostingJudicial(true);

    //             try {
    //                 const formData = new FormData();

    //                 formData.append("SJFechaReg", moment().format("YYYY-MM-DD HH:mm:ss"));
    //                 formData.append("usuarioReg", panelContext.userLogin.IDPERSONAL);
    //                 formData.append("SJIdSolicitudCautelar", form.SJIdSolicitudCautelar ?? null);

    //                 // Agregar campos simples al FormData
    //                 camposSimples.forEach((campo) => {
    //                     const valor = form[campo];

    //                     if (campo.toLowerCase().includes("fecha")) {
    //                         formData.append(campo, formatDate(valor));
    //                     } else {
    //                         formData.append(campo, valor ?? "");
    //                     }
    //                 });

    //                 // Agregar archivos si existen
    //                 Object.entries(camposArchivos).forEach(([key, field]) => {
    //                     const archivo = form[field];
    //                     if (archivo instanceof File) {
    //                         formData.append(field, archivo);
    //                     }
    //                 });

    //                 const { data } = await axios.post(`${API_URL_JUDICIAL}/save-seg-procesal`, formData, {
    //                     headers: {
    //                         "Content-Type": "multipart/form-data",
    //                     },
    //                 });

    //                 if (data.ok) {
    //                     toastJudicial.current.show({
    //                         severity: "success",
    //                         summary: "Éxito",
    //                         detail: "Seguimiento procesal guardado correctamente.",
    //                         life: 3000,
    //                     });

    //                     // LIMPIAR FORMULARIO
    //                     setForm((prev) => ({
    //                         ...prev,
    //                         estadoProcesalDP: null,
    //                         detalleEstadoAdjuntoDP: null,
    //                         detalleEstadoFechaDP: null,
    //                         detalleEstadoTipoEscritoDP: "",
    //                         detalleEstadoObservacionDP: "",
    //                     }));
    //                 } else {
    //                     toastJudicial.current.show({
    //                         severity: "error",
    //                         summary: "Error",
    //                         detail: "No se pudo guardar el seguimiento procesal.",
    //                         life: 3000,
    //                     });
    //                 }
    //             } catch (error) {
    //                 console.error("Error al guardar seguimiento procesal:", error);
    //                 toastJudicial.current.show({
    //                     severity: "error",
    //                     summary: "Error",
    //                     detail: "Ocurrió un error inesperado.",
    //                     life: 3000,
    //                 });
    //             } finally {
    //                 setIsPostingJudicial(false);
    //                 setSubmitedSegProcesal(false);
    //                 loadGestionesJudiciales();
    //             }
    //         }
    //     } else {
    //         toastJudicial.current?.show({
    //             severity: "warn",
    //             summary: "Solicitud Cautelar requerida",
    //             detail: "Debe ingresar la solicitud cautelar.",
    //             life: 3000,
    //         });
    //     }
    // };

    const esFormularioInicioEjecucionValido = () => {
        // Paso 1: Verificar que la calificación y la demanda sean procedentes
        if (form.calificacionMCautelar === 1 || form.calificacionMCautelar === 2 || form.calDemandaSC === 1 || form.calDemandaSC === 2) {
            return false;
        }

        // Paso 2: Verificar tipo de búsqueda
        if (form.tipoBusqueda !== 2) {
            return false;
        }

        // Paso 3: Verificar que no esté bloqueado
        if (bloqueos.bloqueaPosteriorCalDemanda) {
            return false;
        }

        // Paso 4: Verificar que todos los campos estén completos
        const camposCompletos = form.inicioEjecucion && form.detalleInicioFechaDP && form.detalleInicioTipoEscritoDP && form.detalleInicioObservacionDP && form.detalleInicioAdjuntoDP instanceof File;

        return camposCompletos;
    };

    // const onSaveInEjecForzada = async () => {
    //     if (form.SJIdSolicitudCautelar) {
    //         if (!bloqueos.bloqueaCargaEjecucionForzada) {
    //             setSubmitedInEjecForzada(true);
    //             setIsPostingJudicial(true);

    //             try {
    //                 const formData = new FormData();

    //                 formData.append("SJFechaReg", moment().format("YYYY-MM-DD HH:mm:ss"));
    //                 formData.append("usuarioReg", panelContext.userLogin.IDPERSONAL);
    //                 formData.append("SJIdSolicitudCautelar", form.SJIdSolicitudCautelar ?? null);

    //                 // Agregar campos simples al FormData
    //                 camposSimples.forEach((campo) => {
    //                     const valor = form[campo];

    //                     if (campo.toLowerCase().includes("fecha")) {
    //                         formData.append(campo, formatDate(valor));
    //                     } else {
    //                         formData.append(campo, valor ?? "");
    //                     }
    //                 });

    //                 // Agregar archivos si existen
    //                 Object.entries(camposArchivos).forEach(([key, field]) => {
    //                     const archivo = form[field];
    //                     if (archivo instanceof File) {
    //                         formData.append(field, archivo);
    //                     }
    //                 });

    //                 const { data } = await axios.post(`${API_URL_JUDICIAL}/save-inicio-ejecucion`, formData, {
    //                     headers: {
    //                         "Content-Type": "multipart/form-data",
    //                     },
    //                 });

    //                 if (data.ok) {
    //                     toastJudicial.current.show({
    //                         severity: "success",
    //                         summary: "Éxito",
    //                         detail: "Inicio de ejecución guardado correctamente.",
    //                         life: 3000,
    //                     });

    //                     // LIMPIAR FORMULARIO
    //                     setForm((prev) => ({
    //                         ...prev,
    //                         inicioEjecucion: null,
    //                         detalleInicioAdjuntoDP: null,
    //                         detalleInicioFechaDP: null,
    //                         detalleInicioTipoEscritoDP: "",
    //                         detalleInicioObservacionDP: "",
    //                     }));
    //                 } else {
    //                     toastJudicial.current.show({
    //                         severity: "error",
    //                         summary: "Error",
    //                         detail: "No se pudo guardar el inicio de ejecución.",
    //                         life: 3000,
    //                     });
    //                 }
    //             } catch (error) {
    //                 console.error("Error al guardar inicio ejecución:", error);
    //                 toastJudicial.current.show({
    //                     severity: "error",
    //                     summary: "Error",
    //                     detail: "Ocurrió un error inesperado.",
    //                     life: 3000,
    //                 });
    //             } finally {
    //                 setIsPostingJudicial(false);
    //                 setSubmitedInEjecForzada(false);
    //                 loadGestionesJudiciales();
    //             }
    //         }
    //     } else {
    //         toastJudicial.current?.show({
    //             severity: "warn",
    //             summary: "Solicitud Cautelar requerida",
    //             detail: "Debe ingresar la solicitud cautelar.",
    //             life: 3000,
    //         });
    //     }
    // };

    const onSaveGestionJudicial = async () => {
        console.log("Enviando formulario: ", form);

        if (form.tipoBusqueda === 1) {
            // handleGuardarExpediente();
        } else {
            // handleGuardarExpediente();

            if (form.SJIdExpediente) {
                // saveInfoGestion();

                if (esFormularioPropiedadValido()) {
                    // await saveInfoPropiedad();
                }

                if (esFormularioMedidaCautelarValido()) {
                    // await saveSolMedidaCautelar();
                }

                if (esFormularioDemandaValido()) {
                    // await saveSolDemanda();
                }

                if (esFormularioSegProcesalValido()) {
                    // await onSaveSegProcesal();
                }

                if (esFormularioInicioEjecucionValido()) {
                    // await onSaveInEjecForzada();
                }
            }
        }
    };

    const extraerNombreArchivo = (ruta) => {
        return ruta?.split("/").pop() || "";
    };

    // const loadDetallesDemandas = async () => {
    //     setSubmitedDemanda(false);

    //     if (!form.SJIdExpediente) {
    //         return;
    //     }

    //     try {
    //         const { data } = await axios.get(`${API_URL_JUDICIAL}/get-detalle-demanda/${form.SJIdExpediente}`);

    //         if (data.ok && Array.isArray(data.detalles)) {
    //             // console.log("Detalles de demandas: ", data.detalles);
    //             setHDetDemandas(data.detalles);
    //         } else {
    //             setHDetDemandas([]);
    //         }
    //     } catch (error) {
    //         console.error("Error al cargar detalles de demandas:", error);

    //         setHDetDemandas([]);

    //         toastJudicial.current.show({ severity: "error", summary: "Error", detail: "Ocurrio un error inesperado.", life: 3000 });
    //     } finally {
    //         setHistorialCalificacionDemanda(true);
    //     }
    // };

    const closeDetallesDemandas = () => {
        setHistorialCalificacionDemanda(false);

        setForm((prev) => ({
            ...prev,
            detalleFecha: null,
            detalleTipoEscrito: "",
            detalleObservacion: "",
            detalleAdjunto: null,
        }));

        setBloqueos((prev) => ({
            ...prev,
            bloqueaCargaHistorialDemanda: false,
        }));
    };

    const viewDetallesDemandas = (detalle) => {
        setForm((prev) => ({
            ...prev,
            calificacionDemanda: detalle.SJIdDemanda || null,
            detalleFecha: detalle.SJFechaDemanda ? new Date(detalle.SJFechaDemanda) : null,
            detalleTipoEscrito: detalle.SJTipoEscrito || "",
            detalleObservacion: detalle.SJObservacion || "",
            detalleAdjunto: detalle.SJDemandaAdjunto
                ? {
                      name: detalle.SJDemandaAdjunto.split("/").pop(),
                      path: detalle.SJDemandaAdjunto,
                  }
                : null,
        }));

        setBloqueos((prev) => ({
            ...prev,
            bloqueaCargaHistorialDemanda: true,
        }));

        setHistorialCalificacionDemanda(false);
        setSubmitted(false);
        setLoading(false);
    };

    const handleNuevoDetalleDemanda = () => {
        setForm((prev) => ({
            ...prev,
            calificacionDemanda: null,
            detalleFecha: null,
            detalleTipoEscrito: "",
            detalleObservacion: "",
            detalleAdjunto: null,
        }));

        setBloqueos((prev) => ({
            ...prev,
            bloqueaCargaHistorialDemanda: false,
        }));
    };

    // const loadEstadoProcesal = async () => {
    //     setSubmitedEstadoProcesal(false);

    //     if (!form.SJIdExpediente) {
    //         return;
    //     }

    //     try {
    //         const { data } = await axios.get(`${API_URL_JUDICIAL}/get-detalle-estado-procesal/${form.SJIdExpediente}`);

    //         if (data.ok && Array.isArray(data.detalles)) {
    //             // console.log("Estados Procesales: ", data.detalles);

    //             setHEstadoProcesal(data.detalles);
    //         } else {
    //             setHEstadoProcesal([]);
    //         }
    //     } catch (error) {
    //         console.error("Error al cargar estado de procesal:", error);

    //         setHEstadoProcesal([]);

    //         toastJudicial.current.show({ severity: "error", summary: "Error", detail: "Ocurrio un error inesperado.", life: 3000 });
    //     } finally {
    //         setHistorialEstadoProcesal(true);
    //     }
    // };

    const closeEstadoProcesal = () => {
        setHistorialEstadoProcesal(false);

        setForm((prev) => ({
            ...prev,
            estadoProcesal: null,
            detalleEstadoFecha: null,
            detalleEstadoTipoEscrito: "",
            detalleEstadoAdjunto: null,
            detalleEstadoObservacion: "",
        }));

        setBloqueos((prev) => ({
            ...prev,
            bloqueaCargaEstadoProcesal: false,
        }));
    };

    const viewEstadoProcesal = (estado) => {
        // console.log("Estado procesal: ", estado);

        setForm((prev) => ({
            ...prev,
            estadoProcesal: estado.SJIdEstadoProcesal || null,
            detalleEstadoFecha: estado.SJFechaEstadoProcesal ? new Date(estado.SJFechaEstadoProcesal) : null,
            detalleEstadoTipoEscrito: estado.SJTipoEscrito || "",
            detalleEstadoAdjunto: estado.SJEPAdjunto ? { name: extraerNombreArchivo(estado.SJEPAdjunto), url: estado.SJEPAdjunto } : null,
            detalleEstadoObservacion: estado.SJObservacion || "",
        }));

        setBloqueos((prev) => ({
            ...prev,
            bloqueaCargaEstadoProcesal: true,
        }));

        setHistorialEstadoProcesal(false);
    };

    const handleNuevoEstadoProcesal = () => {
        setForm((prev) => ({
            ...prev,
            estadoProcesal: null,
            detalleEstadoFecha: null,
            detalleEstadoTipoEscrito: "",
            detalleEstadoAdjunto: null,
            detalleEstadoObservacion: "",
        }));

        setBloqueos((prev) => ({
            ...prev,
            bloqueaCargaEstadoProcesal: false,
        }));
    };

    // const loadSeguimientoProcesal = async () => {
    //     if (!form.SJIdSolicitudCautelar) {
    //         return;
    //     }

    //     try {
    //         const { data } = await axios.get(`${API_URL_JUDICIAL}/get-seguimiento-procesal/${form.SJIdSolicitudCautelar}`);

    //         if (data.ok && Array.isArray(data.options)) {
    //             setSeguimientoProcesal(data.options);

    //             setTSegProcesalPositivo(true);
    //         }
    //     } catch (error) {
    //         console.error("Error al cargar seguimiento de procesal:", error);

    //         toastJudicial.current.show({ severity: "error", summary: "Error", detail: "Ocurrio un error inesperado.", life: 3000 });
    //     }
    // };

    const closeSeguimientoProcesal = () => {
        // console.log("Cerrar seguimiento procesal");

        setTSegProcesalPositivo(false);

        setForm((prev) => ({
            ...prev,
            estadoProcesalDP: null,
            detalleEstadoAdjuntoDP: null,
            detalleEstadoFechaDP: null,
            detalleEstadoTipoEscritoDP: "",
            detalleEstadoObservacionDP: "",
        }));

        setBloqueos((prev) => ({
            ...prev,
            bloqueaCargaSeguimientoProcesal: false,
        }));
    };

    const viewSeguimientoProcesal = (estado) => {
        setForm((prev) => ({
            ...prev,
            estadoProcesalDP: estado.SJIdEstadoProcesal || null,
            detalleEstadoAdjuntoDP: estado.SJAdjuntoEstado ? { name: extraerNombreArchivo(estado.SJAdjuntoEstado), url: estado.SJAdjuntoEstado } : null,
            detalleEstadoFechaDP: estado.SJFechaEstado ? new Date(estado.SJFechaEstado) : null,
            detalleEstadoTipoEscritoDP: estado.SJTipoEscrito || "",
            detalleEstadoObservacionDP: estado.SJObservacion || "",
        }));

        setBloqueos((prev) => ({
            ...prev,
            bloqueaCargaSeguimientoProcesal: true,
        }));

        setTSegProcesalPositivo(false);
    };

    const handleNuevoSeguimientoProcesal = () => {
        setForm((prev) => ({
            ...prev,
            estadoProcesalDP: null,
            detalleEstadoAdjuntoDP: null,
            detalleEstadoFechaDP: null,
            detalleEstadoTipoEscritoDP: "",
            detalleEstadoObservacionDP: "",
        }));

        setBloqueos((prev) => ({
            ...prev,
            bloqueaCargaSeguimientoProcesal: false,
        }));
    };

    // const loadInicioEjecucion = async () => {
    //     if (!form.SJIdSolicitudCautelar) {
    //         return;
    //     }

    //     try {
    //         const { data } = await axios.get(`${API_URL_JUDICIAL}/get-inicio-ejecucion/${form.SJIdSolicitudCautelar}`);

    //         if (data.ok && Array.isArray(data.options)) {
    //             setEjecucionForzada(data.options);

    //             setTEjecForzadaPositivo(true);
    //         }
    //     } catch (error) {
    //         console.error("Error al cargar inicio de ejecucion:", error);

    //         toastJudicial.current.show({ severity: "error", summary: "Error", detail: "Ocurrio un error inesperado.", life: 3000 });
    //     }
    // };

    const closeInicioEjecucion = () => {
        setTEjecForzadaPositivo(false);

        setForm((prev) => ({
            ...prev,
            inicioEjecucion: null,
            detalleInicioAdjuntoDP: null,
            detalleInicioFechaDP: null,
            detalleInicioTipoEscritoDP: "",
            detalleInicioObservacionDP: "",
        }));

        setBloqueos((prev) => ({
            ...prev,
            bloqueaCargaEjecucionForzada: false,
        }));
    };

    const viewInicioEjecucion = (estado) => {
        setForm((prev) => ({
            ...prev,
            inicioEjecucion: estado.SJIdEjecucionForzada || null,
            detalleInicioAdjuntoDP: estado.SJAdjuntoInicio ? { name: extraerNombreArchivo(estado.SJAdjuntoInicio), url: estado.SJAdjuntoInicio } : null,
            detalleInicioFechaDP: estado.SJFechaInicio ? new Date(estado.SJFechaInicio) : null,
            detalleInicioTipoEscritoDP: estado.SJTipoEscrito || "",
            detalleInicioObservacionDP: estado.SJObservacion || "",
        }));

        setBloqueos((prev) => ({
            ...prev,
            bloqueaCargaEjecucionForzada: true,
        }));

        setTEjecForzadaPositivo(false);
    };

    const handleNuevoInicioEjecucion = () => {
        setForm((prev) => ({
            ...prev,
            inicioEjecucion: null,
            detalleInicioAdjuntoDP: null,
            detalleInicioFechaDP: null,
            detalleInicioTipoEscritoDP: "",
            detalleInicioObservacionDP: "",
        }));

        setBloqueos((prev) => ({
            ...prev,
            bloqueaCargaEjecucionForzada: false,
        }));
    };

    // const loadInfoMedidaCautelar = async () => {
    //     if (!form.SJIdSolicitudCautelar) {
    //         return;
    //     }

    //     try {
    //         const { data } = await axios.get(`${API_URL_JUDICIAL}/get-info-medida-cautelar/${form.SJIdSolicitudCautelar}`);

    //         if (data.ok && Array.isArray(data.informacionMedidaCautelar)) {
    //             setHSolMedidaCautelar(data.informacionMedidaCautelar);

    //             setMSolMedidaCautelar(true);
    //         }
    //     } catch (error) {
    //         console.error("Error al cargar informacion de medida cautelar:", error);

    //         toastJudicial.current.show({ severity: "error", summary: "Error", detail: "Ocurrio un error inesperado.", life: 3000 });
    //     }
    // };

    const closeInfoMedidaCautelar = () => {
        setMSolMedidaCautelar(false);

        setForm((prev) => ({
            ...prev,
            jusgadoSC: "",
            nroExpedienteSC: "",
            fechaSC: null,
            adjuntoFechaSC: null,
            calificacionMCautelar: null,
            observacionSC: "",
            fechaMCautelar: null,
            tipoEscritoMCautelar: "",
            adjuntoMCautelar: null,
            observacionMCautelar: "",
        }));
    };

    const viewInfoMedidaCautelar = (info) => {
        setForm((prev) => ({
            ...prev,
            jusgadoSC: info.SJJuzgado || "",
            nroExpedienteSC: info.SJNumeroExpediente || "",
            fechaSC: info.SJFechaSolicitud ? new Date(info.SJFechaSolicitud) : null,
            adjuntoFechaSC: info.SJAdjuntoFechaSolicitud
                ? {
                      name: extraerNombreArchivo(info.SJAdjuntoFechaSolicitud),
                      url: info.SJAdjuntoFechaSolicitud,
                  }
                : null,
            calificacionMCautelar: info.SJIdCalificacionMCautelar || null,
            observacionSC: info.SJObservacion || "",
            fechaMCautelar: info.SJFechaMCautelar ? new Date(info.SJFechaMCautelar) : null,
            tipoEscritoMCautelar: info.SJTipoEscritoMCautelar || "",
            adjuntoMCautelar: info.SJAdjuntoMCautelar
                ? {
                      name: extraerNombreArchivo(info.SJAdjuntoMCautelar),
                      url: info.SJAdjuntoMCautelar,
                  }
                : null,
            observacionMCautelar: info.SJObservacionMCautelar || "",
        }));

        if (info.SJIdCalificacionMCautelar == 1 || info.SJIdCalificacionMCautelar == 2) {
            setForm((prev) => ({
                ...prev,
                jusgadoSC: "",
                nroExpedienteSC: "",
                fechaSC: null,
                adjuntoFechaSC: null,
                observacionSC: "",
                tipoEscritoMCautelar: "",
                estadoProcesalDP: null,
                detalleEstadoFechaDP: null,
                detalleEstadoTipoEscritoDP: "",
                detalleEstadoAdjuntoDP: null,
                detalleEstadoObservacionDP: "",
                inicioEjecucion: null,
                detalleInicioAdjuntoDP: null,
                detalleInicioFechaDP: null,
                detalleInicioTipoEscritoDP: "",
                detalleInicioObservacionDP: "",
            }));

            setBloqueos((prev) => ({
                ...prev,
                bloqueaPosteriorMedCautelar: true,
            }));

            // Solo limpiamos Demanda si la Solicitud Cautelar es FUERA DEL PROCESO
            if (form.solicitudCautelar != 2) {
                setForm((prev) => ({
                    ...prev,
                    juzgadoDemandaSC: "",
                    nroExpedienteDemandaSC: "",
                    calDemandaSC: null,
                    fechaCalDemandaSC: null,
                    tipoEscritoCalDemandaSC: "",
                    observacionDemandaSC: "",
                    observacionCalDemandaSC: "",
                    adjuntoCalDemandaSC: null,
                }));
            }
        } else {
            setBloqueos((prev) => ({
                ...prev,
                bloqueaPosteriorMedCautelar: false,
            }));
        }

        setMSolMedidaCautelar(false);

        setBloqueos((prev) => ({
            ...prev,
            bloquearCargaSolMedCautelar: true,
        }));
    };

    const handleNuevoInfoMedidaCautelar = () => {
        setForm((prev) => ({
            ...prev,
            jusgadoSC: "",
            nroExpedienteSC: "",
            fechaSC: null,
            adjuntoFechaSC: null,
            calificacionMCautelar: null,
            observacionSC: "",
            fechaMCautelar: null,
            tipoEscritoMCautelar: "",
            adjuntoMCautelar: null,
            observacionMCautelar: "",
        }));

        setBloqueos((prev) => ({
            ...prev,
            bloqueaPosteriorMedCautelar: false,
            bloquearCargaSolMedCautelar: false,
        }));
    };

    // const loadInfoPropiedad = async () => {
    //     if (!form.SJIdSolicitudCautelar) {
    //         return;
    //     }

    //     try {
    //         const { data } = await axios.get(`${API_URL_JUDICIAL}/get-info-propiedad/${form.SJIdSolicitudCautelar}`);

    //         if (data.ok && Array.isArray(data.informacionPropiedad)) {
    //             setHSolPropiedad(data.informacionPropiedad);

    //             // console.log("Abriendo modal de propiedad");

    //             setMSolPropiedad(true);
    //         }
    //     } catch (error) {
    //         console.error("Error al cargar informacion de propiedad:", error);

    //         toastJudicial.current.show({ severity: "error", summary: "Error", detail: "Ocurrio un error inesperado.", life: 3000 });
    //     }
    // };

    const closeInfoPropiedad = () => {
        setMSolPropiedad(false);

        setForm((prev) => ({
            ...prev,
            estadoPropiedadSC: null,
            gravamenSC: null,
            tipoGravamenSC: null,
            rangoGravamenSC: null,
            montoGravamenSC: "",
            fotoSC: null,
            partidaSC: null,
            detalleDelBienSC: "",
            estadoPropiedadObsSC: "",
            tipoGravamenObsSC: "",
        }));
    };

    const viewInfoPropiedad = (info) => {
        setForm((prev) => ({
            ...prev,
            estadoPropiedadSC: info.SJIdEstadoPropiedad || null,
            gravamenSC: info.SJIdGravamen || null,
            tipoGravamenSC: info.SJIdTipoGravamen || null,
            rangoGravamenSC: info.SJIdRangoGravamen || null,
            montoGravamenSC: info.SJMontoGravamen || "",
            fotoSC: info.SJFoto ? { name: extraerNombreArchivo(info.SJFoto), url: info.SJFoto } : null,
            partidaSC: info.SJPartida ? { name: extraerNombreArchivo(info.SJPartida), url: info.SJPartida } : null,
            detalleDelBienSC: info.SJDetalleBien || "",
            estadoPropiedadObsSC: info.SJEstadoPropiedadObs || "",
            tipoGravamenObsSC: info.SJTipoGravamenObs || "",
        }));

        setMSolPropiedad(false);

        setBloqueos((prev) => ({
            ...prev,
            bloqueaInfoPropiedad: true,
        }));
    };

    const handleNuevoInfoPropiedad = () => {
        setForm((prev) => ({
            ...prev,
            estadoPropiedadSC: null,
            gravamenSC: null,
            tipoGravamenSC: null,
            rangoGravamenSC: null,
            montoGravamenSC: "",
            fotoSC: null,
            partidaSC: null,
            detalleDelBienSC: "",
            estadoPropiedadObsSC: "",
            tipoGravamenObsSC: "",
        }));

        setBloqueos((prev) => ({
            ...prev,
            bloqueaInfoPropiedad: false,
        }));
    };

    // const loadSolDemandaPositivo = async () => {
    //     if (!form.SJIdExpediente) {
    //         return;
    //     }

    //     try {
    //         const { data } = await axios.get(`${API_URL_JUDICIAL}/get-detalle-demanda/${form.SJIdExpediente}`);

    //         if (data.ok && Array.isArray(data.detalles)) {
    //             setHSolDemandaPositivo(data.detalles);

    //             setMSolDemandaPositivo(true);
    //         }
    //     } catch (error) {
    //         console.error("Error al cargar informacion de demanda positivo:", error);

    //         toastJudicial.current.show({ severity: "error", summary: "Error", detail: "Ocurrio un error inesperado.", life: 3000 });
    //     }
    // };

    const closeSolDemandaPositivo = () => {
        setMSolDemandaPositivo(false);

        setForm((prev) => ({
            ...prev,
            juzgadoDemandaSC: "",
            nroExpedienteDemandaSC: "",
            calDemandaSC: null,
            observacionDemandaSC: "",
            fechaCalDemandaSC: null,
            tipoEscritoCalDemandaSC: "",
            adjuntoCalDemandaSC: null,
            observacionCalDemandaSC: "",
        }));
    };

    const viewSolDemandaPositivo = (info) => {
        setMSolDemandaPositivo(false);

        setForm((prev) => ({
            ...prev,
            // Campos de la solicitud de la demanda
            juzgadoDemandaSC: info.SJJuzgado || "",
            nroExpedienteDemandaSC: info.SJNumeroExpediente || "",
            calDemandaSC: info.SJIdDemanda || null,
            observacionDemandaSC: info.SJObservacion || "",
            fechaCalDemandaSC: info.SJFechaDemanda ? new Date(info.SJFechaDemanda) : null,
            tipoEscritoCalDemandaSC: info.SJTipoEscrito || "",
            adjuntoCalDemandaSC: info.SJDemandaAdjunto ? { name: extraerNombreArchivo(info.SJDemandaAdjunto), url: info.SJDemandaAdjunto } : null,
            observacionCalDemandaSC: info.SJObservacionCal || "",
        }));

        if (info.SJIdDemanda == 1 || info.SJIdDemanda == 2) {
            setBloqueos((prev) => ({
                ...prev,
                bloqueaPosteriorCalDemanda: true,
            }));
        } else {
            setBloqueos((prev) => ({
                ...prev,
                bloqueaPosteriorCalDemanda: false,
            }));
        }

        setBloqueos((prev) => ({
            ...prev,
            bloquearCargaSolDemanda: true,
        }));
    };

    const handleNuevoSolDemandaPositivo = () => {
        setForm((prev) => ({
            ...prev,
            juzgadoDemandaSC: "",
            nroExpedienteDemandaSC: "",
            calDemandaSC: null,
            observacionDemandaSC: "",
            fechaCalDemandaSC: null,
            tipoEscritoCalDemandaSC: "",
            adjuntoCalDemandaSC: null,
            observacionCalDemandaSC: "",
        }));

        setBloqueos((prev) => ({
            ...prev,
            bloqueaPosteriorCalDemanda: false,
            bloquearCargaSolDemanda: false,
        }));
    };

    // const loadGestionesJudiciales = async () => {
    //     try {
    //         const { data } = await axios.get(`${API_URL_JUDICIAL}/get-expedientes`);

    //         if (data.ok && Array.isArray(data.expedientes)) {
    //             setDataJudicial(data.expedientes);
    //         } else {
    //             setDataJudicial([]);
    //         }
    //     } catch (error) {
    //         console.error("Error al cargar gestiones judiciales:", error);
    //         setDataJudicial([]);
    //     }
    // };

    const loadEstadosAnimo = async () => {
        try {
            const { data } = await axios.get(`${API_URL_GESTION}/get-estados-animo`);

            if (data.ok && Array.isArray(data.estados)) {
                setEstadoAnimoCliente(data.estados);
            } else {
                setEstadoAnimoCliente([]);
            }
        } catch (error) {
            console.error("Error al cargar estados de animo:", error);
            setEstadoAnimoCliente([]);
        }
    };

    const loadRespuestasCliente = async () => {
        try {
            const { data } = await axios.get(`${API_URL_GESTION}/get-respuestas-cliente`);

            if (data.ok && Array.isArray(data.respuestas)) {
                setrespuestasCliente(data.respuestas);
            } else {
                setrespuestasCliente([]);
            }
        } catch (error) {
            console.error("Error al cargar respuestas del cliente:", error);
            setrespuestasCliente([]);
        }
    };

    {
        /* ========================= REQUERIMIENTO JUDICIAL ========================= */
    }

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

    // const stateBodyTemplatePhone = (rowData) => {
    //     return (
    //         <React.Fragment>
    //             {/* <span className={`state-row status-${rowData.COLOR}`}>{rowData.NUMERO}</span> */}
    //             <span>{rowData.NUMERO}</span>
    //         </React.Fragment>
    //     );
    // };

    const stateBodyTemplatePhone = (rowData) => {
        return (
            <div className="telefono-cell">
                <span>{rowData.NUMERO}</span>
                <Button
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
                />
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

                {/* ========================= REQUERIMIENTO JUDICIAL ========================= */}
                {/* <Button
                    label=" Gest. Judicial"
                    icon="pi pi-briefcase"
                    onClick={() => {
                        if (selectedPhone == null) {
                            toast.current.show({ severity: "warn", summary: "Información", detail: "Seleccione un teléfono" });
                            return;
                        }
                        onDialogGestionJudicial();
                    }}
                    className="p-button-raised p-button-secondary p-mt-2 p-ml-2 p-button-sm"
                /> */}
                {/* ========================= REQUERIMIENTO JUDICIAL ========================= */}
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

    // ========================= REQUERIMIENTO JUDICIAL =========================

    useEffect(() => {
        // loadGestionesJudiciales();
        // loadEstadosAnimo();
        // loadRespuestasCliente();
    }, []);

    // ========================= REQUERIMIENTO JUDICIAL =========================

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
                                                {/* ============================= REQUERIMIENTO JUDICIAL ============================= */}

                                                {/* <TabPanel header="JUDICIAL">
                                                    <DataTable value={dataJudicial} style={{ fontSize: "12px" }} emptyMessage={"No se encontraron resultados"} scrollable scrollHeight="200px" loading={loading} className="p-datatable-sm p-datatable-gridlines">
                                                        <Column body={(rowData) => <i className="pi pi-eye" style={{ cursor: "pointer" }} onClick={() => handleVerJudicial(rowData)} />} header="ACCIÓN" headerStyle={{ width: "80px" }} />

                                                        <Column field="SJIdExpediente" header="ID EXPEDIENTE" headerStyle={{ width: "150px" }} />

                                                        <Column field="SJFechaReg" header="FECHA REGISTRO" headerStyle={{ width: "180px" }} body={(rowData) => moment(rowData.SJFechaReg).utc().format("YYYY-MM-DD HH:mm:ss")} />

                                                        <Column
                                                            field="SJIDBusqueda"
                                                            header="TIPO DE BÚSQUEDA"
                                                            headerStyle={{ width: "200px" }}
                                                            body={(rowData) => {
                                                                const tipo = tiposBusqueda.find((t) => t.value === rowData.SJIDBusqueda);
                                                                return tipo ? tipo.label : "-";
                                                            }}
                                                        />

                                                        <Column field="SJNumCargoExpediente" header="NRO CARGO EXPEDIENTE" headerStyle={{ width: "200px" }} />
                                                        <Column field="SJJuzgado" header="JUZGADO" headerStyle={{ width: "200px" }} />
                                                        <Column field="ObservacionExpediente" header="OBSERVACIÓN" headerStyle={{ width: "250px" }} />
                                                        <Column
                                                            body={(rowData) => (
                                                                <a href={`${API_URL_JUDICIAL}/expedientes/${rowData.SJIdExpediente}/descargar-zip`} target="_blank" rel="noopener noreferrer" title="Descargar todos los adjuntos">
                                                                    <i className="pi pi-download" style={{ cursor: "pointer" }} />
                                                                </a>
                                                            )}
                                                            header="ADJUNTOS"
                                                            headerStyle={{ width: "100px" }}
                                                        />

                                                        <Column field="SJFechaIngreso" header="FECHA" headerStyle={{ width: "150px" }} />
                                                        <Column field="SJNumeroExpediente" header="NRO EXPEDIENTE" headerStyle={{ width: "200px" }} />
                                                    </DataTable>
                                                </TabPanel> */}

                                                {/* ============================= REQUERIMIENTO JUDICIAL ============================= */}
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
                                <Card title="SCORE DE TELEFONOS" style={{ background: "#f8f9fa", position: "relative" }}>
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
                                                    <Column headerStyle={{ width: "80px" }} field="categoria" header="CATEGORIA"></Column>
                                                    <Column headerStyle={{ width: "250px" }} field="cartera" header="CARTERA"></Column>
                                                    <Column headerStyle={{ width: "100px" }} field="FUENTE" header="FUENTE"></Column>
                                                    <Column headerStyle={{ width: "250px" }} field="TIPO" header="TIPO"></Column>
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

            {/* // ========================= REQUERIMIENTO JUDICIAL ========================= */}
            {/* <DialogFormJudicial
                toast={toastJudicial}
                submitted={submitted}
                submitedDemanda={submitedDemanda}
                submitedEstadoProcesal={submitedEstadoProcesal}
                submitedPropiedad={submitedPropiedad}
                submitedSolMedCautelar={submitedSolMedCautelar}
                submitedSolDemanda={submitedSolDemanda}
                submitedSegProcesal={submitedSegProcesal}
                submitedInEjecForzada={submitedInEjecForzada}
                loading={isPostingJudicial}
                handleCalificacionDemandaNegativaChange={handleCalificacionDemandaNegativaChange}
                handleCalificacionMCautelarChange={handleCalificacionMCautelarChange}
                handleSolicitudCautelarChange={handleSolicitudCautelarChange}
                handleTipoBienesChange={handleTipoBienesChange}
                handleCalificacionDemandaChange={handleCalificacionDemandaChange}
                bloqueos={bloqueos}
                setBloqueos={setBloqueos}
                form={form}
                setForm={setForm}
                visible={dialogGestionJudicial}
                onHide={closeDialogGestionJudicial}
                // =============== GUARDAR ===============
                onSave={onSaveGestionJudicial}
                onSaveDemanda={handleGuardarDemanda}
                onSaveDetEstadoProcesal={handleGuardarDetEstadoProcesal}
                // =============== GUARDAR ===============
                modoLectura={modoLectura}
                loadDetallesDemandas={loadDetallesDemandas}
                closeDetallesDemandas={closeDetallesDemandas}
                viewDetallesDemandas={viewDetallesDemandas}
                historialCalificacionDemanda={historialCalificacionDemanda}
                HDetDemandas={HDetDemandas}
                handleNuevoDetalleDemanda={handleNuevoDetalleDemanda}
                loadEstadoProcesal={loadEstadoProcesal}
                historialEstadoProcesal={historialEstadoProcesal}
                HEstadoProcesal={HEstadoProcesal}
                closeEstadoProcesal={closeEstadoProcesal}
                viewEstadoProcesal={viewEstadoProcesal}
                handleNuevoEstadoProcesal={handleNuevoEstadoProcesal}
                // Seguimiento Procesal
                tSegProcesalPositivoData={tSegProcesalPositivo}
                seguimientoProcesal={seguimientoProcesal}
                loadSeguimientoProcesal={loadSeguimientoProcesal}
                closeSeguimientoProcesal={closeSeguimientoProcesal}
                viewSeguimientoProcesal={viewSeguimientoProcesal}
                handleNuevoSeguimientoProcesal={handleNuevoSeguimientoProcesal}
                // Ejecucion Forzada
                tEjecForzadaPositivo={tEjecForzadaPositivo}
                ejecucionForzadaData={ejecucionForzada}
                loadInicioEjecucion={loadInicioEjecucion}
                closeInicioEjecucion={closeInicioEjecucion}
                viewInicioEjecucion={viewInicioEjecucion}
                handleNuevoInicioEjecucion={handleNuevoInicioEjecucion}
                hSolMedidaCautelar={hSolMedidaCautelar}
                mSolMedidaCautelar={mSolMedidaCautelar}
                loadInfoMedidaCautelar={loadInfoMedidaCautelar}
                closeInfoMedidaCautelar={closeInfoMedidaCautelar}
                viewInfoMedidaCautelar={viewInfoMedidaCautelar}
                handleNuevoInfoMedidaCautelar={handleNuevoInfoMedidaCautelar}
                hSolPropiedad={hSolPropiedad}
                mSolPropiedad={mSolPropiedad}
                loadInfoPropiedad={loadInfoPropiedad}
                closeInfoPropiedad={closeInfoPropiedad}
                viewInfoPropiedad={viewInfoPropiedad}
                handleNuevoInfoPropiedad={handleNuevoInfoPropiedad}
                // SOL DEMANDA
                hSolDemandaPositivo={hSolDemandaPositivo}
                mSolDemandaPositivo={mSolDemandaPositivo}
                loadSolDemandaPositivo={loadSolDemandaPositivo}
                closeSolDemandaPositivo={closeSolDemandaPositivo}
                viewSolDemandaPositivo={viewSolDemandaPositivo}
                handleNuevoSolDemandaPositivo={handleNuevoSolDemandaPositivo}
            /> */}
            {/* // ========================= REQUERIMIENTO JUDICIAL ========================= */}

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
        </React.Fragment>
    );
};
