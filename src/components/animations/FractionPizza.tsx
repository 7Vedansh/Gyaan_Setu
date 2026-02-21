import React, { useEffect } from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    interpolate,
    interpolateColor,
    Extrapolation,
    createAnimatedPropAdapter,
    processColor,
} from "react-native-reanimated";

const AnimatedPath = Animated.createAnimatedComponent(Path);

// --- 1. The Android Fix: Create a Prop Adapter ---
// This ensures 'fill' is processed correctly for the native driver on Android.
const svgAdapter = createAnimatedPropAdapter(
    (props: any) => {
        if (Object.keys(props).includes("fill")) {
            props.fill = { type: 0, payload: processColor(props.fill) };
        }
    },
    ["fill"]
);

interface SliceProps {
    index: number;
    path: string;
    progress: Animated.SharedValue<number>;
}

const PizzaSlice = ({ index, path, progress }: SliceProps) => {
    const animatedProps = useAnimatedProps(() => {
        const sliceFillProgress = interpolate(
            progress.value,
            [index, index + 1],
            [0, 1],
            Extrapolation.CLAMP
        );

        return {
            fill: interpolateColor(
                sliceFillProgress,
                [0, 1],
                ["#E0E0E0", "#FFB703"]
            ),
        };
    },
        null, // No dependencies needed
        svgAdapter // <--- Pass the adapter here!
    );

    return (
        <AnimatedPath
            d={path}
            stroke="#333"
            strokeWidth={2}
            animatedProps={animatedProps}
        />
    );
};

export default function FractionPizza({
    totalSlices,
    highlightSlices,
    duration = 1200,
    size = 200,
}: { totalSlices: number; highlightSlices: number; duration?: number; size?: number }) {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withTiming(highlightSlices, { duration });
    }, [highlightSlices]);

    const radius = size / 2;
    const center = radius;

    const createSlicePath = (startAngle: number, endAngle: number) => {
        const x1 = center + radius * Math.cos(startAngle);
        const y1 = center + radius * Math.sin(startAngle);
        const x2 = center + radius * Math.cos(endAngle);
        const y2 = center + radius * Math.sin(endAngle);
        return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
    };

    return (
        <View>
            <Svg width={size} height={size}>
                {Array.from({ length: totalSlices }).map((_, i) => {
                    const startAngle = (2 * Math.PI * i) / totalSlices - Math.PI / 2;
                    const endAngle = (2 * Math.PI * (i + 1)) / totalSlices - Math.PI / 2;
                    return (
                        <PizzaSlice
                            key={i}
                            index={i}
                            path={createSlicePath(startAngle, endAngle)}
                            progress={progress}
                        />
                    );
                })}
            </Svg>
        </View>
    );
}