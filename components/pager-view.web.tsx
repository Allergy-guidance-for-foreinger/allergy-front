import React, { Children, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
export type PagerViewOnPageScrollEventData = { position: number; offset: number };
export type PagerViewOnPageSelectedEventData = { position: number };
type PagerHandle = { setPage: (page: number) => void };
type Props = {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    initialPage?: number;
    onPageScroll?: (event: { nativeEvent: PagerViewOnPageScrollEventData }) => void;
    onPageSelected?: (event: { nativeEvent: PagerViewOnPageSelectedEventData }) => void;
};
const PagerView = forwardRef<PagerHandle, Props>(function PagerView({ children, style, initialPage = 0, onPageScroll, onPageSelected }, ref) {
    const [page, setPage] = useState(initialPage);
    const start = useRef<number | null>(null);
    const pages = Children.toArray(children);
    const select = (value: number) => {
        const next = Math.max(0, Math.min(pages.length - 1, value));
        setPage(next);
        onPageScroll?.({ nativeEvent: { position: next, offset: 0 } });
        onPageSelected?.({ nativeEvent: { position: next } });
    };
    useImperativeHandle(ref, () => ({ setPage: select }));
    return (
        <View style={style}
            onTouchStart={event => { start.current = event.nativeEvent.pageX; }}
            onTouchEnd={event => {
                if (start.current !== null) {
                    const delta = event.nativeEvent.pageX - start.current;
                    if (Math.abs(delta) > 60) select(page + (delta < 0 ? 1 : -1));
                }
                start.current = null;
            }}>
            {pages.map((child, index) => (
                <View key={index} style={{ flex: 1, display: index === page ? 'flex' : 'none' }}>{child}</View>
            ))}
        </View>
    );
});
export default PagerView;
