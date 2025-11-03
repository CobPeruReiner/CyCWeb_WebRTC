/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import React, { useState, useEffect, useRef, useContext } from "react";
import { InputText } from "primereact/inputtext";
import { Panel } from "primereact/panel";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { CommonService } from "../service/CommonService";
import { GestionService } from "../service/GestionService";
import { Dialog } from "primereact/dialog";
import { Skeleton } from "primereact/skeleton";
import { InputNumber } from "primereact/inputnumber";
import { ProgressBar } from "primereact/progressbar";
import moment from "moment";
import { Divider } from "primereact/divider";
import { Card } from "primereact/card";
import PanelContext from "../context/Panel/PanelContext";
import { LocalStorageService } from "../service/LocalStorageService";
import { DialogFormAgenVentas } from "./DialogFormAgenVentas";

// ================================================================================================================================
import { Toast } from "primereact/toast";
import classNames from "classnames";
import { SIPContext } from "../context/JsSIP/JsSIPContext";
// ================================================================================================================================

export const DialogFormGestion = (props) => {
    const { hidePhone } = useContext(SIPContext);

    // ================================================================================================================================
    const toast = useRef(null);
    // ================================================================================================================================

    // "IDEFECTO"	"HOMOLO"
    // "13518"	    "AMK 00"
    // "13519"	    "AMK 01"
    // "13520"	    "AMK 02"
    // "13537"	    "AMK 20"
    // "13538"	    "AMK 21"
    // "13539"	    "AMK 22"
    var arrayEfectosAV = [13518, 13519, 13520, 13537, 13538, 13539];
    var arrayEfectosOptional = [13520, 13537];

    // ============================ REQUERIMIENTO PREVENCION RECLAMOS ============================
    // const [formGestion, setFormGestion] = useState({ observacion: "", tipoCliente: null, autorizaCliente: 0 });
    const [formGestion, setFormGestion] = useState({ observacion: "" });

    const tipos = [
        { label: "Normal", value: 0, icon: "😊", title: "Cordial" },
        { label: "Reclamo", value: 2, icon: "😤", title: "Queja directa" },
        { label: "Malcriado", value: 1, icon: "😡", title: "Actitud negativa" },
    ];
    // ============================ REQUERIMIENTO PREVENCION RECLAMOS ============================

    const [submitted, setSubmitted] = useState(false);
    const [isPromise, setIsPromise] = useState(false);
    const [date9, setDate9] = useState(null);

    const [labelDireccion, setLabelDireccion] = useState("null");

    // const [formGestion, setFormGestion] = useState({ observacion: "" });

    const [listAccion, setListAccion] = useState([]);
    const [listEfecto, setListEfecto] = useState([]);
    const [listEfectoAV, setListEfectoAV] = useState([]);
    const [listMotivo, setListMotivo] = useState([]);

    const [listContacto, setListContacto] = useState([]);
    const [listCategoria, setListCategoria] = useState([]);
    const [listDireccion, setListDireccion] = useState([]);

    const [loadingEfecto, setLoadingEfecto] = useState(false);
    const [loadingCategoria, setLoadingCategoria] = useState(false);
    const [loadingMotivoContacto, setLoadingMotivoContacto] = useState(false);
    const [showLoading, setShowLoading] = useState(false);

    const [selectedCategoria, setSelectedCategoria] = useState();

    const panelContext = useContext(PanelContext);

    const [isDisabled, setIsDisabled] = useState(false);

    const [dialogFormAgenVentas, setDialogFormAgenVentas] = useState(false);

    // Timer Save Gestion
    const [tiempoDesdeAccion, setTiempoDesdeAccion] = useState(0);
    const contadorAccionRef = useRef(null);

    const obtenerEmoji = (id) => {
        if (id === 0) return "😊";
        if (id === 1) return "😡";
        if (id === 2) return "😤";
        return "❓";
    };

    const handleChange = (e) => {
        let service = new CommonService();
        // let _formGestion = { ...formGestion, [e.target.name]: e.target.value };
        // setFormGestion(_formGestion);

        // new
        const { name, value } = e.target;

        setFormGestion((prevFormGestion) => ({
            ...prevFormGestion,
            [name]: value,
        }));

        if (name === "idaccion") {
            if (!contadorAccionRef.current) {
                contadorAccionRef.current = setInterval(() => {
                    setTiempoDesdeAccion((prev) => prev + 1);
                }, 1000);
            }

            setLoadingEfecto(true);
            service.getEfecto(value).then((data) => {
                setListEfecto(data);
                setLoadingEfecto(false);
                // setFormGestion({ ..._formGestion, 'idefecto': null });
                setFormGestion((prevFormGestion) => ({
                    ...prevFormGestion,
                    idefecto: null,
                }));
            });
        } else if (name === "idefecto") {
            var idEfecto = value;

            var oEfecto = listEfecto.find((e) => e.IDEFECTO == idEfecto);
            //console.log('idEfecto', oEfecto);
            setIsPromise(oEfecto.promesa == 1);
            setLoadingMotivoContacto(true);
            let promiseMotivo = service.getMotivo(value);
            let promiseContacto = service.getContacto(value);

            Promise.all([promiseMotivo, promiseContacto]).then((values) => {
                setListMotivo(values[0]);
                setListContacto(values[1]);
                setLoadingMotivoContacto(false);
                // setFormGestion({ ..._formGestion, 'idmotivo': null, 'idcontacto': null });
                setFormGestion((prevFormGestion) => ({
                    ...prevFormGestion,
                    idmotivo: null,
                    idcontacto: null,
                }));
            });
        } else if (name === "iddireccion") {
            let rowData = listDireccion.find((data) => data.IDDIRECCION === value);
            setLabelDireccion(rowData.DEPARTAMENTO + ", " + rowData.PROVINCIA + ", " + rowData.DISTRITO);
        }
    };

    const buttonsFooterDialog = (nameLeft, actionLeft, nameRight, actionRight, nameFirst, actionFirst) => {
        return (
            <>
                {props.selectedCarteraId && props.selectedCarteraId === 75 && arrayEfectosAV.includes(formGestion.idefecto) && <Button label={nameFirst} icon="pi pi-check" className="p-button-text" onClick={actionFirst} />}
                <Button label={nameLeft} icon="pi pi-times" className="p-button-text" onClick={actionLeft} />
                <Button label={nameRight} icon="pi pi-check" className="p-button-text" onClick={actionRight} disabled={isDisabled} />
            </>
        );
    };

    const handleSave = (e) => {
        if (isDisabled) return;
        setSubmitted(true);

        // ======================== REQUERIMIENTO PREVENCION RECLAMOS ========================
        // if (formGestion.tipoCliente === null || formGestion.tipoCliente === undefined) {
        //     toast.current.show({
        //         severity: "warn",
        //         summary: "Información",
        //         detail: "Debe seleccionar un tipo de cliente.",
        //     });
        //     return;
        // }
        // ======================== REQUERIMIENTO PREVENCION RECLAMOS ========================

        if (typeof formGestion.idaccion === "undefined" || formGestion.idaccion === null) return;
        if (typeof formGestion.idefecto === "undefined" || formGestion.idefecto === null) return;
        if ((typeof formGestion.idmotivo === "undefined" && listMotivo.length > 0) || (formGestion.idmotivo === null && listMotivo.length > 0)) return;
        if ((typeof formGestion.idcontacto === "undefined" && listContacto.length > 0) || (formGestion.idcontacto === null && listContacto.length > 0)) return;
        //if (typeof formGestion.idmotivo === 'undefined' || formGestion.idmotivo === null) return;
        //if (typeof formGestion.idcontacto === 'undefined' || formGestion.idcontacto === null) return;
        if (props.showInfoCampo && (typeof formGestion.iddireccion === "undefined" || formGestion.iddireccion === null)) return;
        if (formGestion.idefecto && isPromise && (typeof formGestion.fecha_promesa === "undefined" || formGestion.fecha_promesa === null || typeof formGestion.monto_promesa === "undefined" || formGestion.monto_promesa === null)) return;

        // =========================== REQUERIMIENTO MARCHENA ===========================
        if ([28, 29].includes(panelContext.selectedCarteraId) && isPromise) {
            const idAccion = Number(formGestion.idaccion);
            const idEfecto = Number(formGestion.idefecto);

            const efectosValidosPorAccion = {
                63: [670, 658],
                64: [697, 685],
                67: [724, 712],
                68: [751, 739],
            };

            const efectoValido = efectosValidosPorAccion[idAccion] && efectosValidosPorAccion[idAccion].includes(idEfecto);

            if (efectoValido) {
                const capital = Number(panelContext.selectedCustomer?.CAPITAL || 0);
                const montoPromesa = Number(formGestion.monto_promesa || 0);
                const cumpleMonto = montoPromesa >= capital * 0.05;

                const hoy = moment().startOf("day");
                const fechaPromesa = moment(formGestion.fecha_promesa);
                const dosDiasMas = moment().add(2, "days").endOf("day");
                const mismoMes = fechaPromesa.isSame(hoy, "month");
                const cumpleFecha = fechaPromesa.isBetween(hoy, dosDiasMas, null, "[]") && mismoMes;

                if (!cumpleMonto || !cumpleFecha) {
                    let mensaje = "";
                    if (!cumpleMonto) mensaje += "El monto de promesa debe ser al menos el 5% del capital. ";
                    if (!cumpleFecha) mensaje += "La fecha de promesa debe estar entre hoy y dos días más, dentro del mes actual.";

                    toast.current.show({
                        severity: "warn",
                        summary: "Validación",
                        detail: mensaje.trim(),
                        life: 8000,
                    });
                    return;
                }
            }
        }
        // =========================== REQUERIMIENTO MARCHENA ===========================

        let gestionService = new GestionService();
        formGestion.identificador = props.customer.identificador;

        formGestion.idcartera = props.selectedCarteraId;
        formGestion.id_table = props.selectedEntityId;

        formGestion.id_user = props.userid;
        formGestion.isPromise = isPromise;
        if (formGestion.fecha_programacion) {
            formGestion.fecha_programacion = moment(new Date(formGestion.fecha_programacion)).format("DD-MM-yy");
        }

        if (formGestion.hora_programacion) {
            formGestion.hora_programacion = moment(new Date(formGestion.hora_programacion)).format("HH:mm");
        }
        if (!props.showInfoCampo) {
            formGestion.idtelefono = props.selectedPhone.IDTELEFONO;
        }

        // ================================================================================================================================
        // COMPROBAMOS DE QUE LA FECHA_AV Y HORA_AV SEA OBLIGATORIO SOLO PARA LA CARTERA 75
        if (props.selectedCarteraId === 75 && [13539, 13519].includes(formGestion.idefecto)) {
            console.log("Cartera 75 y efecto 13539 o 13519");

            // if (!formGestion.fecha_av || !formGestion.hora_av) {
            if (!formGestion.fecha_av) {
                toast.current.show({ severity: "warn", summary: "Información", detail: "Debe ingresar una Fecha de Agendamiento para este efecto." });
                return;
            }
        }
        // ================================================================================================================================

        // set AV
        if (props.selectedCarteraId === 75 && arrayEfectosAV.includes(formGestion.idefecto)) {
            const requiredFields = ["tienda_av", "programar_visita_av", "fecha_av", "hora_av", "programar_cita_av", "venta_av", "desembolso_av", "importe_av", "observaciones_av", "derivacion_canal_av"];

            const isAnyFieldFilled = requiredFields.some((field) => formGestion[field] !== "" && formGestion[field] !== null && formGestion[field] !== undefined);

            formGestion.addAV = 1;
        } else formGestion.addAV = 0;

        setShowLoading(true);

        gestionService.addGestion(formGestion).then((data) => {
            if (data.status && data.status == 0) {
                alert(data.body);
            }

            clearInterval(contadorAccionRef.current);
            contadorAccionRef.current = null;

            console.log("⏱️ Tiempo desde selección de acción hasta guardar:", tiempoDesdeAccion, "segundos");

            props.setDialogGestion(false);
            setShowLoading(false);
            props.handleRefeshHistorial();

            hidePhone();
        });
        setIsDisabled(true);
    };

    useEffect(() => {
        if (props.dialogGestion) {
            setIsDisabled(false);
        }
        if (props.customer !== null && props.dialogGestion) {
            setFormGestion({});
            setSelectedCategoria(null);
            setListEfectoAV([]);
            setSubmitted(false);
            let service = new CommonService();
            service.getAccionByCartera(props.formGestionType, props.entityId).then((data) => setListAccion(data));

            let serviceGestion = new GestionService();

            serviceGestion.getDirecciones(props.customer.documento).then((data) => setListDireccion(data));

            // categoria
            service.getCategoria().then((data) => {
                setListCategoria(data);
            });
        }
    }, [props.dialogGestion]);

    const handleCategoria = (e) => {
        setSelectedCategoria(e.target.value);
        setListEfectoAV(listEfecto.filter((x) => x.IDCATEGORIA === e.target.value));
    };

    const endOfMonth = moment().endOf("month").toDate();

    /* console.log(moment())
    console.log(moment().format('YYYY'))
    console.log(moment().format('M'))
    console.log(moment().format('D'))
    console.log(moment().endOf('month'))
    console.log(moment().add(1, 'months'))
    console.log(moment().add(1, 'months').endOf('month').toDate()) 
    console.log(props.selectedEntityId)
    console.log(typeof props.selectedEntityId)*/

    const getMaxPromiseDate = (idtable) => {
        if (props.carteraId == "43") {
            //return the 4th day of next month
            return moment().endOf("month").add(4, "days").toDate();
        } else if (props.carteraId == "47") {
            //return last day of next month
            return moment().add(1, "months").endOf("month").toDate();
        }
        //return last day of current month
        else return moment().endOf("month").toDate();
    };

    //const endOfMonth = moment().endOf('month').toDate();

    return (
        <React.Fragment>
            {/* =========================================================================================================== */}
            <Toast ref={toast} />
            {/* =========================================================================================================== */}

            <Dialog
                autoZIndex="false"
                visible={props.dialogGestion}
                style={{ width: "650px" }}
                header="FORMULARIO DE GESTIÓN"
                modal
                onHide={() => {
                    props.setDialogGestion(false);
                    hidePhone();
                }}
                footer={buttonsFooterDialog(
                    "Cancelar",
                    () => {
                        props.setDialogGestion(false);
                        hidePhone();
                    },
                    "Guardar",
                    handleSave,
                    "AV",
                    () => {
                        setDialogFormAgenVentas(true);
                    }
                )}
            >
                <div className="confirmation-content">
                    {showLoading && <ProgressBar mode="indeterminate" className="p-mb-2" style={{ height: "6px" }} />}
                    <div className="p-grid">
                        <div className="p-col">
                            <Card style={{ background: "#f8f9fa", fontSize: 12 }}>
                                <div className="p-card-title-form p-pb-3">INFORMACIÓN DE LA GESTIÓN</div>

                                <div className="p-fluid">
                                    <div className="p-field">
                                        <span className="p-float-label">
                                            <Dropdown name="idaccion" options={listAccion} value={formGestion.idaccion} optionLabel="ACCION" optionValue="IDACCION" onChange={handleChange} placeholder="ACCIÓN" className="p-inputtext-sm" />
                                            {submitted && !formGestion.idaccion && <small className="p-invalid">Acción es requerido.</small>}
                                        </span>
                                    </div>
                                    {props.selectedCarteraId && props.selectedCarteraId === 75 && (
                                        <div className="p-field">
                                            {loadingCategoria ? (
                                                <Skeleton className="p-mb-2" height="2.3rem"></Skeleton>
                                            ) : (
                                                <span className="p-float-label">
                                                    <Dropdown name="categoria" options={listCategoria} value={selectedCategoria} optionLabel="CATEGORIA" optionValue="IDCATEGORIA" tag="eee" onChange={handleCategoria} className="p-inputtext-sm" placeholder="CATEGORIA" />
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <div className="p-field">
                                        {loadingEfecto ? (
                                            <Skeleton className="p-mb-2" height="2.3rem"></Skeleton>
                                        ) : (
                                            <>
                                                <span className="p-float-label">
                                                    <Dropdown name="idefecto" options={listEfectoAV.length > 0 ? listEfectoAV : listEfecto} value={formGestion.idefecto} optionLabel="EFECTO" optionValue="IDEFECTO" tag="eee" onChange={handleChange} className="p-inputtext-sm" placeholder="EFECTO" />
                                                    {submitted && !formGestion.idefecto && <small className="p-invalid">Efecto es requerido.</small>}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <div className="p-field">
                                        {loadingMotivoContacto ? (
                                            <Skeleton className="p-mb-2" height="2.3rem"></Skeleton>
                                        ) : (
                                            <>
                                                <span className="p-float-label">
                                                    <Dropdown name="idmotivo" options={listMotivo} value={formGestion.idmotivo} optionLabel="MOTIVO" optionValue="IDMOTIVO" placeholder="MOTIVO" onChange={handleChange} className="p-inputtext-sm" />
                                                    {submitted && !formGestion.idmotivo && listMotivo.length > 0 && <small className="p-invalid">Motivo es requerido.</small>}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <div className="p-field">
                                        {loadingMotivoContacto ? (
                                            <Skeleton className="p-mb-2" height="2.3rem"></Skeleton>
                                        ) : (
                                            <>
                                                <span className="p-float-label">
                                                    <Dropdown name="idcontacto" options={listContacto} value={formGestion.idcontacto} optionLabel="CONTACTO" optionValue="IDCONTACTO" placeholder="CONTACTO" onChange={handleChange} className="p-inputtext-sm" />
                                                    {submitted && !formGestion.idcontacto && listContacto.length > 0 && <small className="p-invalid">Contacto es requerido.</small>}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    {/* <div className="p-field">
                                        <label htmlFor="lastname1">Nombre del contacto</label>
                                        <InputText name="nomcontacto" value={formGestion.nomcontacto && formGestion.nomcontacto} onChange={handleChange} className="p-inputtext-sm" />
                                    </div> */}
                                    <div className="p-field">
                                        <label htmlFor="lastname1">Nombre del contacto</label>
                                        <InputText
                                            name="nomcontacto"
                                            value={formGestion.nomcontacto || ""}
                                            onChange={(e) => {
                                                const value = e.target.value;

                                                const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;

                                                if (!regex.test(value)) {
                                                    toast.current.show({
                                                        severity: "warn",
                                                        summary: "Información",
                                                        detail: "Solo se permiten letras y espacios.",
                                                    });
                                                    return;
                                                }

                                                if (value.length > 20) {
                                                    toast.current.show({
                                                        severity: "warn",
                                                        summary: "Información",
                                                        detail: "El nombre no puede superar los 20 caracteres.",
                                                    });
                                                    return;
                                                }

                                                handleChange(e);
                                            }}
                                            className="p-inputtext-sm"
                                        />
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div className="p-col">
                            <Card style={{ background: "#f8f9fa", fontSize: 12 }}>
                                {props.showInfoCampo ? (
                                    <React.Fragment>
                                        <div className="p-card-title-form  p-pb-3">INFORMACIÓN DE CAMPO</div>

                                        <div className="p-fluid">
                                            <div className="p-field">
                                                <Dropdown name="iddireccion" options={listDireccion} value={formGestion.iddireccion} optionLabel="DIRECCION" optionValue="IDDIRECCION" onChange={handleChange} placeholder="DIRECCIÓN" className="p-inputtext-sm" />
                                                {submitted && !formGestion.iddireccion && <small className="p-invalid">Dirección es requerido.</small>}
                                                {formGestion.iddireccion && (
                                                    <small id="username1-help" className="p-d-block">
                                                        {labelDireccion}
                                                    </small>
                                                )}
                                            </div>
                                            <div className="p-fluid p-formgrid p-grid">
                                                <div className="p-field  p-col">
                                                    <label htmlFor="lastname1">N.Pisos</label>
                                                    <InputText name="pisos" value={formGestion.pisos} type="text" onChange={handleChange} className="p-inputtext-sm" />
                                                </div>
                                                <div className="p-field p-col">
                                                    <label htmlFor="lastname1">Puerta</label>
                                                    <InputText name="puerta" value={formGestion.puerta} type="text" onChange={handleChange} className="p-inputtext-sm" />
                                                </div>
                                                <div className="p-field p-col">
                                                    <label htmlFor="lastname1">Color F</label>
                                                    <InputText name="fachada" value={formGestion.fachada} type="text" onChange={handleChange} className="p-inputtext-sm" />
                                                </div>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ) : (
                                    <React.Fragment>
                                        <div className="p-card-title-form">INFORMACIÓN DEL TELÉFONO</div>
                                        <Divider />
                                        <div className="p-fluid">
                                            {/* ========================== REQUERIMIENTO PREVENCION RECLAMOS ========================== */}
                                            <div className="p-field p-grid">
                                                <div className="p-col-8">
                                                    <label htmlFor="telefono">Teléfono del contacto</label>
                                                    <InputText name="telefonotipo" keyfilter="int" value={props.selectedPhone && props.selectedPhone.NUMERO} type="text" disabled={true} className="p-inputtext-sm" />
                                                </div>

                                                {/* <div className="p-col-4">
                                                    <label>Aut. cliente</label>
                                                    <div className="p-d-flex align-items-center" style={{ gap: "6px" }}>
                                                        {props?.respuestasCliente
                                                            .filter((resp) => resp.IDAUTORIZATEL === 1 || resp.IDAUTORIZATEL === 2)
                                                            .map((resp) => {
                                                                const isSelected = formGestion.autorizaCliente === resp.IDAUTORIZATEL;
                                                                const isSi = resp.IDAUTORIZATEL === 1;

                                                                return (
                                                                    <div
                                                                        key={resp.IDAUTORIZATEL}
                                                                        title={resp.DESCRIPCION}
                                                                        className="p-d-flex align-items-center cursor-pointer"
                                                                        onClick={() =>
                                                                            setFormGestion((prev) => ({
                                                                                ...prev,
                                                                                autorizaCliente: isSelected ? 0 : resp.IDAUTORIZATEL,
                                                                            }))
                                                                        }
                                                                        style={{
                                                                            padding: "6px 12px",
                                                                            border: `1px solid ${isSelected ? (isSi ? "#4CAF50" : "#F44336") : "#ccc"}`,
                                                                            borderRadius: "4px",
                                                                            backgroundColor: isSelected ? (isSi ? "#4CAF50" : "#F44336") : "#f0f0f0",
                                                                            color: isSelected ? "#fff" : "#333",
                                                                            fontWeight: "bold",
                                                                            cursor: "pointer",
                                                                        }}
                                                                    >
                                                                        {resp.NOMBRE_AUTORIZACION}
                                                                    </div>
                                                                );
                                                            })}
                                                    </div>
                                                </div>*/}
                                            </div>
                                            {/* ========================== REQUERIMIENTO PREVENCION RECLAMOS ========================== */}

                                            {/* <div className="p-field">
                                                <label htmlFor="firstname1">Teléfono del contacto</label>
                                                <InputText name="telefonotipo" keyfilter="int" value={props.selectedPhone && props.selectedPhone.NUMERO} type="text" disabled={true} className="p-inputtext-sm" />
                                            </div> */}
                                            <div className="p-field">
                                                <label htmlFor="firstname1">Tipo de teléfono</label>
                                                <InputText name="telefonotipo" value={props.selectedPhone && props.selectedPhone.TIPO} type="text" disabled={true} className="p-inputtext-sm" />
                                            </div>
                                        </div>
                                    </React.Fragment>
                                )}

                                <div className="p-card-title-form p-pb-3 ">PROGRAMAR GESTIÓN</div>

                                <div className="p-fluid p-formgrid p-grid">
                                    <div className="p-field  p-col">
                                        <div className="p-inputgroup">
                                            <Calendar id="time12" className="p-inputtext-sm" placeholder="FECHA" appendTo={document.body} value={formGestion.fecha_programacion} onChange={(e) => setFormGestion({ ...formGestion, fecha_programacion: e.target.value })} />
                                            <span className="p-inputgroup-addon">
                                                <i className="pi pi-calendar"></i>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-field p-col">
                                        <div className="p-inputgroup">
                                            <Calendar id="time12" className="p-inputtext-sm" placeholder="HORA" appendTo={document.body} value={formGestion.hora_programacion} onChange={(e) => setFormGestion({ ...formGestion, hora_programacion: e.target.value })} timeOnly hourFormat="24" />
                                            <span className="p-inputgroup-addon">
                                                <i className="pi pi-clock"></i>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* {formGestion.idefecto && isPromise && (
                                    <React.Fragment>
                                        <div className="p-card-title-form p-pb-3">PROMESA DE PAGO</div>

                                        <div className="p-fluid p-formgrid p-grid">
                                            <div className="p-field  p-col">
                                                <div className="p-inputgroup">
                                                    <Calendar
                                                        name="fecha_promesa"
                                                        placeholder="FECHA"
                                                        minDate={moment().toDate()}
                                                        maxDate={getMaxPromiseDate(props.selectedEntityId)}
                                                        readOnlyInput
                                                        className="p-inputtext-sm"
                                                        appendTo={document.body}
                                                        value={formGestion.fecha_promesa}
                                                        onChange={handleChange}
                                                    />
                                                    <span className="p-inputgroup-addon">
                                                        <i className="pi pi-calendar"></i>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-field p-col">
                                                <div className="p-inputgroup">
                                                    <InputNumber name="monto_promesa" placeholder="MONTO" className="p-inputtext-sm" value={formGestion.monto_promesa} onValueChange={handleChange} mode="decimal" minFractionDigits={2} maxFractionDigits={2} />
                                                    <span className="p-inputgroup-addon">
                                                        <i className="pi pi-money-bill"></i>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {submitted && formGestion.idefecto && isPromise && (!formGestion.fecha_promesa || !formGestion.monto_promesa) && <small className="p-invalid">La promesa de pago es requerido.</small>}
                                    </React.Fragment>
                                )} */}

                                {/* // =========================== REQUERIMIENTO MARCHENA =========================== */}
                                {formGestion.idefecto && isPromise && (
                                    <React.Fragment>
                                        <div className="p-card-title-form p-pb-3">PROMESA DE PAGO</div>

                                        {(() => {
                                            const capital = Number(panelContext.selectedCustomer?.CAPITAL || 0);
                                            const montoMinimo = capital * 0.05;
                                            const carteraId = panelContext.selectedCarteraId;
                                            const efectoId = Number(formGestion.idefecto);

                                            const efectosValidosPorAccion = {
                                                63: [670, 658],
                                                64: [697, 685],
                                                67: [724, 712],
                                                68: [751, 739],
                                            };
                                            const esCarteraEspecial = [28, 29].includes(carteraId) && efectosValidosPorAccion[formGestion.idaccion] && efectosValidosPorAccion[formGestion.idaccion].includes(efectoId);

                                            const hoy = moment().startOf("day").toDate();
                                            const max2Dias = moment().add(2, "days").endOf("day").toDate();
                                            const finDeMes = moment().endOf("month").toDate();

                                            const maxDate = esCarteraEspecial ? new Date(Math.min(max2Dias.getTime(), finDeMes.getTime())) : getMaxPromiseDate(carteraId);

                                            return (
                                                <>
                                                    <div className="p-fluid p-formgrid p-grid">
                                                        <div className="p-field p-col">
                                                            <div className="p-inputgroup">
                                                                <Calendar name="fecha_promesa" placeholder="FECHA" minDate={hoy} maxDate={maxDate} readOnlyInput className="p-inputtext-sm" appendTo={document.body} value={formGestion.fecha_promesa} onChange={handleChange} />
                                                                <span className="p-inputgroup-addon">
                                                                    <i className="pi pi-calendar"></i>
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="p-field p-col">
                                                            <div className="p-inputgroup">
                                                                <InputNumber
                                                                    name="monto_promesa"
                                                                    placeholder={esCarteraEspecial ? `MONTO (mínimo ${montoMinimo.toFixed(2)})` : "MONTO"}
                                                                    className={`p-inputtext-sm ${submitted && formGestion.monto_promesa < montoMinimo ? "p-invalid" : ""}`}
                                                                    value={formGestion.monto_promesa}
                                                                    onValueChange={handleChange}
                                                                    mode="decimal"
                                                                    minFractionDigits={2}
                                                                    maxFractionDigits={2}
                                                                />
                                                                <span className="p-inputgroup-addon">
                                                                    <i className="pi pi-money-bill"></i>
                                                                </span>
                                                            </div>

                                                            {esCarteraEspecial && <small className="p-text-secondary">El monto debe ser mayor o igual a ({montoMinimo.toFixed(2)}).</small>}
                                                        </div>
                                                    </div>

                                                    {submitted && formGestion.idefecto && isPromise && (!formGestion.fecha_promesa || !formGestion.monto_promesa) && <small className="p-invalid">La promesa de pago es requerida.</small>}
                                                </>
                                            );
                                        })()}
                                    </React.Fragment>
                                )}
                                {/* // =========================== REQUERIMIENTO MARCHENA =========================== */}
                            </Card>
                        </div>
                    </div>

                    <Card style={{ background: "#f8f9fa", fontSize: 12 }} className="p-mt-1">
                        {/* ========================== REQUERIMIENTO PREVENCION RECLAMOS ========================== */}
                        <div className="p-card-title-form p-pb-2" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                            <strong>OBSERVACIÓN</strong>
                            {/* <div className="d-flex align-items-center" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                {props?.estadoAnimoCliente.map((estado) => (
                                    <div
                                        key={estado.IDEAGESTION}
                                        title={estado.DESCRIPCION}
                                        onClick={() =>
                                            setFormGestion((prev) => ({
                                                ...prev,
                                                tipoCliente: prev.tipoCliente === estado.IDEAGESTION ? null : estado.IDEAGESTION,
                                            }))
                                        }
                                        className={classNames("p-px-2 p-py-1 border-round cursor-pointer", {
                                            "bg-primary text-white": formGestion.tipoCliente === estado.IDEAGESTION,
                                            "border-2 border-gray-300": formGestion.tipoCliente !== estado.IDEAGESTION,
                                        })}
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            border: "1px solid",
                                            borderColor: formGestion.tipoCliente === estado.IDEAGESTION ? "#2196F3" : "#ccc",
                                            borderRadius: 6,
                                            fontSize: 13,
                                            cursor: "pointer",
                                            gap: 5,
                                            padding: "6px 10px",
                                            marginBottom: "4px",
                                        }}
                                    >
                                        <span style={{ fontSize: "16px" }}>{obtenerEmoji(estado.IDEAGESTION)}</span>
                                        <span>{estado.NOMBRE_ESTADO_ANIMO}</span>
                                    </div>
                                ))}
                            </div>*/}
                        </div>
                        {/* ========================== REQUERIMIENTO PREVENCION RECLAMOS ========================== */}

                        {/* <div className="p-card-title-form p-pb-2">OBSERVACIÓN</div> */}
                        <div className="p-fluid p-formgrid p-grid">
                            <div className="p-field p-col">
                                <InputTextarea value={formGestion.observacion} name="observacion" type="text" onChange={handleChange} rows={2} cols={30} />
                            </div>
                        </div>
                    </Card>
                </div>
            </Dialog>
            <DialogFormAgenVentas dialogFormAgenVentas={dialogFormAgenVentas} setDialogFormAgenVentas={setDialogFormAgenVentas} handleChange={handleChange} formGestion={formGestion} setFormGestion={setFormGestion}></DialogFormAgenVentas>
        </React.Fragment>
    );
};
