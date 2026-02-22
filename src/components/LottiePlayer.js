import React from "react";
import { StyleSheet, Text, View } from "react-native";

const LESSON_FIGURES = {
  "introduction_current.json": "introCurrent",
  "magnetic_needle.json": "magneticNeedle",
  "magnetic_field_wire.json": "fieldWire",
  "oerstead.json": "oerstead",
  "coil_activity.json": "coilActivity",
  "circuit_flow.json": "circuitFlow",
  "removal_cell.json": "removalCell",
  "series_cells.json": "seriesCells",
  "battery_types.json": "batteryTypes",
  "electricity_magnetism.json": "electricityMagnetism",
  "concept_explain.json": "concept",
  "quiz_pop.json": "quiz",
};

function resolveFigureType(lottieFile) {
  if (!lottieFile) return null;
  const key = lottieFile.trim().split("/").pop();
  return LESSON_FIGURES[key] ?? null;
}

function FigureCanvas({ style, children }) {
  return <View style={[styles.figure, style]}>{children}</View>;
}

function Wire({ style }) {
  return <View style={[styles.wire, style]} />;
}

function Cell({ style }) {
  return (
    <View style={[styles.cellWrap, style]}>
      <View style={styles.cellLong} />
      <View style={styles.cellShort} />
    </View>
  );
}

function Bulb({ style }) {
  return (
    <View style={[styles.bulbWrap, style]}>
      <View style={styles.bulbGlass} />
      <View style={styles.bulbBase} />
    </View>
  );
}

function Arrow({ style, label }) {
  return (
    <View style={[styles.arrowWrap, style]}>
      <Text style={styles.arrowText}>-></Text>
      {label ? <Text style={styles.labelText}>{label}</Text> : null}
    </View>
  );
}

function Magnet({ style }) {
  return (
    <View style={[styles.magnet, style]}>
      <View style={[styles.magnetHalf, styles.magnetNorth]}>
        <Text style={styles.magnetText}>N</Text>
      </View>
      <View style={[styles.magnetHalf, styles.magnetSouth]}>
        <Text style={styles.magnetText}>S</Text>
      </View>
    </View>
  );
}

function Compass({ style }) {
  return (
    <View style={[styles.compass, style]}>
      <View style={styles.needleNorth} />
      <View style={styles.needleSouth} />
    </View>
  );
}

function Coil({ style }) {
  return (
    <View style={[styles.coilRow, style]}>
      {[0, 1, 2, 3, 4].map((n) => (
        <View key={n} style={styles.coilLoop} />
      ))}
    </View>
  );
}

function CircuitClosed() {
  return (
    <FigureCanvas>
      <Wire style={{ top: 26, left: 28, width: 224, height: 3 }} />
      <Wire style={{ top: 26, left: 249, width: 3, height: 145 }} />
      <Wire style={{ top: 168, left: 28, width: 224, height: 3 }} />
      <Wire style={{ top: 26, left: 28, width: 3, height: 145 }} />
      <Cell style={{ top: 57, left: 22 }} />
      <Bulb style={{ top: 11, left: 122 }} />
      <Arrow style={{ top: 176, left: 92 }} label="Current" />
    </FigureCanvas>
  );
}

function CircuitOpen() {
  return (
    <FigureCanvas>
      <Wire style={{ top: 26, left: 28, width: 95, height: 3 }} />
      <Wire style={{ top: 26, left: 168, width: 84, height: 3 }} />
      <Wire style={{ top: 26, left: 249, width: 3, height: 145 }} />
      <Wire style={{ top: 168, left: 28, width: 224, height: 3 }} />
      <Wire style={{ top: 26, left: 28, width: 3, height: 145 }} />
      <Cell style={{ top: 57, left: 22 }} />
      <Bulb style={{ top: 11, left: 122 }} />
      <Text style={[styles.labelText, { position: "absolute", top: 34, left: 128 }]}>Cell removed</Text>
    </FigureCanvas>
  );
}

function SeriesCells() {
  return (
    <FigureCanvas>
      <Wire style={{ top: 26, left: 28, width: 224, height: 3 }} />
      <Wire style={{ top: 26, left: 249, width: 3, height: 145 }} />
      <Wire style={{ top: 168, left: 28, width: 224, height: 3 }} />
      <Wire style={{ top: 26, left: 28, width: 3, height: 145 }} />
      <Cell style={{ top: 57, left: 20 }} />
      <Cell style={{ top: 57, left: 54 }} />
      <Bulb style={{ top: 11, left: 122 }} />
      <Text style={[styles.labelText, { position: "absolute", top: 176, left: 92 }]}>Higher voltage</Text>
    </FigureCanvas>
  );
}

function IntroductionCurrent() {
  return (
    <FigureCanvas>
      <Cell style={{ top: 92, left: 44 }} />
      <Bulb style={{ top: 72, left: 200 }} />
      <Wire style={{ top: 106, left: 74, width: 126, height: 3 }} />
      <Arrow style={{ top: 114, left: 116 }} label="Current" />
      <Text style={[styles.labelText, { position: "absolute", top: 50, left: 38 }]}>Source</Text>
      <Text style={[styles.labelText, { position: "absolute", top: 50, left: 203 }]}>Load</Text>
    </FigureCanvas>
  );
}

function MagneticNeedle() {
  return (
    <FigureCanvas>
      <Magnet style={{ top: 34, left: 86 }} />
      <Compass style={{ top: 112, left: 124 }} />
      <Text style={[styles.labelText, { position: "absolute", top: 182, left: 78 }]}>Needle aligns with magnetic field</Text>
    </FigureCanvas>
  );
}

function MagneticFieldWire() {
  return (
    <FigureCanvas>
      <View style={[styles.verticalWire, { top: 40, left: 139 }]} />
      <View style={[styles.fieldRing, { top: 60, left: 99, width: 80, height: 80 }]} />
      <View style={[styles.fieldRing, { top: 50, left: 89, width: 100, height: 100 }]} />
      <View style={[styles.fieldRing, { top: 40, left: 79, width: 120, height: 120 }]} />
      <Text style={[styles.labelText, { position: "absolute", top: 176, left: 74 }]}>Circular field around straight wire</Text>
    </FigureCanvas>
  );
}

function OersteadObservation() {
  return (
    <FigureCanvas>
      <Wire style={{ top: 88, left: 56, width: 172, height: 4 }} />
      <Cell style={{ top: 72, left: 28 }} />
      <Compass style={{ top: 116, left: 120 }} />
      <Text style={[styles.labelText, { position: "absolute", top: 174, left: 44 }]}>Compass needle deflects near current-carrying wire</Text>
    </FigureCanvas>
  );
}

function CoilActivity() {
  return (
    <FigureCanvas>
      <Coil style={{ top: 84, left: 52 }} />
      <Cell style={{ top: 70, left: 26 }} />
      <Compass style={{ top: 80, left: 210 }} />
      <Text style={[styles.labelText, { position: "absolute", top: 174, left: 60 }]}>Coil behaves like a magnet when current flows</Text>
    </FigureCanvas>
  );
}

function BatteryTypes() {
  return (
    <FigureCanvas>
      <View style={[styles.blockBattery, { top: 60, left: 46 }]}>
        <Text style={styles.batteryText}>Lead-acid</Text>
      </View>
      <View style={[styles.cylBattery, { top: 58, left: 180 }]}>
        <Text style={styles.batteryText}>Ni-Cd</Text>
      </View>
      <Text style={[styles.labelText, { position: "absolute", top: 172, left: 54 }]}>Different cells for different applications</Text>
    </FigureCanvas>
  );
}

function ElectricityMagnetism() {
  return (
    <FigureCanvas>
      <Text style={[styles.bolt, { top: 46, left: 58 }]}>E</Text>
      <Coil style={{ top: 94, left: 54 }} />
      <Arrow style={{ top: 104, left: 166 }} />
      <Magnet style={{ top: 84, left: 196 }} />
      <Text style={[styles.labelText, { position: "absolute", top: 172, left: 44 }]}>Electricity can produce magnetism</Text>
    </FigureCanvas>
  );
}

function ConceptFigure() {
  return (
    <FigureCanvas>
      <View style={styles.cardIcon}>
        <Text style={styles.cardIconText}>Concept</Text>
      </View>
      <Text style={[styles.labelText, { position: "absolute", top: 146, left: 72 }]}>Key idea illustration</Text>
    </FigureCanvas>
  );
}

function QuizFigure() {
  return (
    <FigureCanvas>
      <View style={styles.cardIcon}>
        <Text style={styles.cardIconText}>Quiz</Text>
      </View>
      <Text style={[styles.labelText, { position: "absolute", top: 146, left: 48 }]}>Check your understanding</Text>
    </FigureCanvas>
  );
}

function StaticFigure({ type }) {
  switch (type) {
    case "introCurrent":
      return <IntroductionCurrent />;
    case "magneticNeedle":
      return <MagneticNeedle />;
    case "fieldWire":
      return <MagneticFieldWire />;
    case "oerstead":
      return <OersteadObservation />;
    case "coilActivity":
      return <CoilActivity />;
    case "circuitFlow":
      return <CircuitClosed />;
    case "removalCell":
      return <CircuitOpen />;
    case "seriesCells":
      return <SeriesCells />;
    case "batteryTypes":
      return <BatteryTypes />;
    case "electricityMagnetism":
      return <ElectricityMagnetism />;
    case "quiz":
      return <QuizFigure />;
    default:
      return <ConceptFigure />;
  }
}

const LottiePlayer = ({ animationSpec, style = undefined }) => {
  if (!animationSpec) return null;

  const lottieFile = animationSpec?.lottie_file ?? null;
  const type = resolveFigureType(lottieFile);

  if (!type && __DEV__) {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.fallbackText}>{`Missing figure mapping:\n${String(lottieFile)}`}</Text>
      </View>
    );
  }

  if (!type) return null;

  return <StaticFigure type={type} />;
};

const styles = StyleSheet.create({
  figure: {
    width: 280,
    height: 220,
    alignSelf: "center",
    marginVertical: 15,
    borderWidth: 1,
    borderColor: "#D5DCEA",
    borderRadius: 16,
    backgroundColor: "#F6F9FF",
    overflow: "hidden",
    position: "relative",
  },
  wire: {
    position: "absolute",
    backgroundColor: "#2A4D9B",
    borderRadius: 6,
  },
  cellWrap: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  cellLong: {
    width: 4,
    height: 28,
    backgroundColor: "#1E2B45",
  },
  cellShort: {
    width: 4,
    height: 16,
    backgroundColor: "#1E2B45",
  },
  bulbWrap: {
    position: "absolute",
    alignItems: "center",
  },
  bulbGlass: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E3A600",
    backgroundColor: "#FFE89A",
  },
  bulbBase: {
    width: 10,
    height: 8,
    marginTop: 2,
    backgroundColor: "#8D919B",
    borderRadius: 2,
  },
  arrowWrap: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  arrowText: {
    fontSize: 14,
    color: "#27548A",
    fontWeight: "700",
  },
  labelText: {
    fontSize: 12,
    color: "#4D5D7A",
    fontWeight: "600",
  },
  magnet: {
    position: "absolute",
    width: 110,
    height: 36,
    borderRadius: 10,
    overflow: "hidden",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#99A8C7",
  },
  magnetHalf: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  magnetNorth: {
    backgroundColor: "#FF8A80",
  },
  magnetSouth: {
    backgroundColor: "#82B1FF",
  },
  magnetText: {
    color: "#1D2B4A",
    fontWeight: "800",
  },
  compass: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#5A6C8F",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  needleNorth: {
    position: "absolute",
    width: 3,
    height: 12,
    backgroundColor: "#D94343",
    top: 5,
    borderRadius: 2,
  },
  needleSouth: {
    position: "absolute",
    width: 3,
    height: 12,
    backgroundColor: "#3A72D6",
    bottom: 5,
    borderRadius: 2,
  },
  verticalWire: {
    position: "absolute",
    width: 4,
    height: 126,
    backgroundColor: "#2A4D9B",
    borderRadius: 5,
  },
  fieldRing: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "#7DA0E6",
    borderRadius: 999,
  },
  coilRow: {
    position: "absolute",
    flexDirection: "row",
    gap: 6,
  },
  coilLoop: {
    width: 22,
    height: 46,
    borderWidth: 3,
    borderColor: "#E1782B",
    borderRadius: 11,
  },
  blockBattery: {
    position: "absolute",
    width: 86,
    height: 52,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#4C628C",
    backgroundColor: "#DCE7FF",
    justifyContent: "center",
    alignItems: "center",
  },
  cylBattery: {
    position: "absolute",
    width: 60,
    height: 56,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#4C628C",
    backgroundColor: "#FDEEC8",
    justifyContent: "center",
    alignItems: "center",
  },
  batteryText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#24324F",
  },
  bolt: {
    position: "absolute",
    fontSize: 34,
  },
  cardIcon: {
    position: "absolute",
    top: 52,
    left: 72,
    width: 136,
    height: 78,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#7DA0E6",
    backgroundColor: "#EAF1FF",
    justifyContent: "center",
    alignItems: "center",
  },
  cardIconText: {
    color: "#27548A",
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  fallback: {
    width: 220,
    height: 120,
    borderWidth: 1,
    borderColor: "#cc3333",
    borderRadius: 8,
    backgroundColor: "#1d1d2f",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginVertical: 15,
  },
  fallbackText: {
    color: "#ff6b6b",
    textAlign: "center",
    fontSize: 12,
  },
});

export default LottiePlayer;


