import { useState } from "react";
import { Text } from "react-native";
import { PageGate } from "@/components/dashboard/page-gate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Screen } from "@/components/ui/screen";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { useTheme } from "@/theme/theme";

type FieldKey =
  | "jurisdiccion"
  | "tribunal"
  | "sala"
  | "instancia"
  | "fecha_hecho"
  | "fecha_sentencia"
  | "tipo_sentencia"
  | "doctrina_barrientos"
  | "aseguradora"
  | "capital_normalizado"
  | "capital_x_pto"
  | "delay_anios"
  | "is_porcentaje"
  | "is_monto"
  | "dm_monto"
  | "dep_monto"
  | "dem_monto"
  | "lc_monto"
  | "pc_monto"
  | "vv_monto";

const EMPTY: Record<FieldKey, string> = {
  jurisdiccion: "",
  tribunal: "",
  sala: "",
  instancia: "",
  fecha_hecho: "",
  fecha_sentencia: "",
  tipo_sentencia: "",
  doctrina_barrientos: "",
  aseguradora: "",
  capital_normalizado: "",
  capital_x_pto: "",
  delay_anios: "",
  is_porcentaje: "",
  is_monto: "",
  dm_monto: "",
  dep_monto: "",
  dem_monto: "",
  lc_monto: "",
  pc_monto: "",
  vv_monto: "",
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default function CargaScreen() {
  return (
    <PageGate flag="page.carga">
      <CargaForm />
    </PageGate>
  );
}

function CargaForm() {
  const { colors } = useTheme();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [notice, setNotice] = useState<string | null>(null);

  function set(key: FieldKey, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setNotice(null);
  }

  function onSubmit() {
    const next: Partial<Record<FieldKey, string>> = {};
    if (!values.jurisdiccion.trim()) next.jurisdiccion = "Requerido";
    if (!values.tribunal.trim()) next.tribunal = "Requerido";
    if (!values.instancia.trim()) next.instancia = "Requerido";
    if (!DATE_RE.test(values.fecha_hecho)) next.fecha_hecho = "Usá AAAA-MM-DD";
    if (!DATE_RE.test(values.fecha_sentencia)) next.fecha_sentencia = "Usá AAAA-MM-DD";
    if (!values.tipo_sentencia) next.tipo_sentencia = "Requerido";
    if (!values.doctrina_barrientos) next.doctrina_barrientos = "Requerido";
    const capital = Number(values.capital_normalizado.replace(",", "."));
    if (!values.capital_normalizado || Number.isNaN(capital) || capital < 0) next.capital_normalizado = "Ingresá un monto válido";
    const optionalNumbers: FieldKey[] = ["capital_x_pto", "delay_anios", "is_porcentaje", "is_monto", "dm_monto", "dep_monto", "dem_monto", "lc_monto", "pc_monto", "vv_monto"];
    for (const key of optionalNumbers) {
      if (!values[key]) continue;
      const parsed = Number(values[key].replace(",", "."));
      if (Number.isNaN(parsed) || parsed < 0) next[key] = "Número inválido";
    }
    if (values.is_porcentaje) {
      const pct = Number(values.is_porcentaje.replace(",", "."));
      if (pct > 100) next.is_porcentaje = "Máximo 100";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setNotice(null);
      return;
    }
    setNotice("El formulario es válido. La API de carga todavía no existe, igual que en la web, así que el fallo no se guardó.");
  }

  return (
    <Screen>
      <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 20 }}>
        Completá los datos del fallo. El alta todavía no tiene endpoint: se valida acá y queda pendiente de carga-api.
      </Text>
      <Card title="Datos del fallo">
        <TextField label="Jurisdicción" value={values.jurisdiccion} onChangeText={(value) => set("jurisdiccion", value)} error={errors.jurisdiccion} />
        <TextField label="Tribunal" value={values.tribunal} onChangeText={(value) => set("tribunal", value)} error={errors.tribunal} />
        <TextField label="Sala" value={values.sala} onChangeText={(value) => set("sala", value)} />
        <TextField label="Instancia" value={values.instancia} onChangeText={(value) => set("instancia", value)} error={errors.instancia} />
        <TextField label="Fecha del hecho" value={values.fecha_hecho} onChangeText={(value) => set("fecha_hecho", value)} placeholder="AAAA-MM-DD" error={errors.fecha_hecho} autoCapitalize="none" />
        <TextField label="Fecha de sentencia" value={values.fecha_sentencia} onChangeText={(value) => set("fecha_sentencia", value)} placeholder="AAAA-MM-DD" error={errors.fecha_sentencia} autoCapitalize="none" />
        <SelectField
          label="Tipo de sentencia"
          value={values.tipo_sentencia}
          onChange={(value) => set("tipo_sentencia", value)}
          options={[
            { value: "", label: "Seleccionar" },
            { value: "hace_lugar", label: "Hace lugar" },
            { value: "hace_lugar_parcial", label: "Hace lugar parcial" },
            { value: "rechaza", label: "Rechaza" },
          ]}
        />
        {errors.tipo_sentencia ? <Text style={errorStyle(colors.danger)}>{errors.tipo_sentencia}</Text> : null}
        <SelectField
          label="Doctrina Barrientos"
          value={values.doctrina_barrientos}
          onChange={(value) => set("doctrina_barrientos", value)}
          options={[
            { value: "", label: "Seleccionar" },
            { value: "si", label: "Aplicada" },
            { value: "no", label: "No aplicada" },
            { value: "no_clasificada", label: "No clasificada" },
          ]}
        />
        {errors.doctrina_barrientos ? <Text style={errorStyle(colors.danger)}>{errors.doctrina_barrientos}</Text> : null}
        <TextField label="Aseguradora" value={values.aseguradora} onChangeText={(value) => set("aseguradora", value)} />
      </Card>
      <Card title="Capital y métricas">
        <TextField label="Capital normalizado ($)" value={values.capital_normalizado} onChangeText={(value) => set("capital_normalizado", value)} keyboardType="decimal-pad" error={errors.capital_normalizado} />
        <TextField label="Costo por punto ($)" value={values.capital_x_pto} onChangeText={(value) => set("capital_x_pto", value)} keyboardType="decimal-pad" error={errors.capital_x_pto} />
        <TextField label="Demora (años)" value={values.delay_anios} onChangeText={(value) => set("delay_anios", value)} keyboardType="decimal-pad" error={errors.delay_anios} />
        <TextField label="% Incapacidad" value={values.is_porcentaje} onChangeText={(value) => set("is_porcentaje", value)} keyboardType="decimal-pad" error={errors.is_porcentaje} />
      </Card>
      <Card title="Rubros indemnizatorios ($)">
        <TextField label="Incapacidad sobreviniente" value={values.is_monto} onChangeText={(value) => set("is_monto", value)} keyboardType="decimal-pad" error={errors.is_monto} />
        <TextField label="Daño moral" value={values.dm_monto} onChangeText={(value) => set("dm_monto", value)} keyboardType="decimal-pad" error={errors.dm_monto} />
        <TextField label="Daño emergente personal" value={values.dep_monto} onChangeText={(value) => set("dep_monto", value)} keyboardType="decimal-pad" error={errors.dep_monto} />
        <TextField label="Daño emergente material" value={values.dem_monto} onChangeText={(value) => set("dem_monto", value)} keyboardType="decimal-pad" error={errors.dem_monto} />
        <TextField label="Lucro cesante" value={values.lc_monto} onChangeText={(value) => set("lc_monto", value)} keyboardType="decimal-pad" error={errors.lc_monto} />
        <TextField label="Pérdida de chance" value={values.pc_monto} onChangeText={(value) => set("pc_monto", value)} keyboardType="decimal-pad" error={errors.pc_monto} />
        <TextField label="Valor vida" value={values.vv_monto} onChangeText={(value) => set("vv_monto", value)} keyboardType="decimal-pad" error={errors.vv_monto} />
      </Card>
      <Button label="Validar fallo" onPress={onSubmit} />
      {notice ? <Text style={{ color: colors.primaryStrong, fontSize: 14, lineHeight: 20 }}>{notice}</Text> : null}
    </Screen>
  );
}

function errorStyle(color: string) {
  return { color, fontSize: 12, marginTop: -6 } as const;
}
